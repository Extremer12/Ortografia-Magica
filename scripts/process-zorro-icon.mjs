import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// 1. Unfilter PNG
function decodePngRgb(buffer) {
  let offset = 8;
  const idatChunks = [];
  let width = 0;
  let height = 0;

  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
      const colorType = buffer[offset + 17];
      if (colorType !== 2 && colorType !== 6) {
        throw new Error('Unsupported color type: ' + colorType);
      }
    } else if (type === 'IDAT') {
      idatChunks.push(buffer.subarray(offset + 8, offset + 8 + len));
    }
    offset += 12 + len;
    if (type === 'IEND') break;
  }

  const compressed = Buffer.concat(idatChunks);
  const raw = zlib.inflateSync(compressed);

  const bpp = 3; // RGB 8-bit
  const stride = 1 + width * bpp;
  const pixels = Buffer.alloc(width * height * 4); // Target: RGBA

  let prevRow = Buffer.alloc(width * bpp);

  for (let y = 0; y < height; y++) {
    const filterType = raw[y * stride];
    const rowOffset = y * stride + 1;
    const curRow = Buffer.alloc(width * bpp);

    for (let i = 0; i < width * bpp; i++) {
      const x = raw[rowOffset + i];
      const a = i >= bpp ? curRow[i - bpp] : 0;
      const b = prevRow[i];
      const c = i >= bpp ? prevRow[i - bpp] : 0;

      let val = 0;
      if (filterType === 0) { // None
        val = x;
      } else if (filterType === 1) { // Sub
        val = (x + a) & 0xff;
      } else if (filterType === 2) { // Up
        val = (x + b) & 0xff;
      } else if (filterType === 3) { // Average
        val = (x + Math.floor((a + b) / 2)) & 0xff;
      } else if (filterType === 4) { // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        val = (x + pr) & 0xff;
      }
      curRow[i] = val;
    }

    // Convert curRow RGB to pixels RGBA
    for (let x = 0; x < width; x++) {
      const srcIdx = x * 3;
      const dstIdx = (y * width + x) * 4;
      pixels[dstIdx] = curRow[srcIdx];         // R
      pixels[dstIdx + 1] = curRow[srcIdx + 1]; // G
      pixels[dstIdx + 2] = curRow[srcIdx + 2]; // B
      pixels[dstIdx + 3] = 255;                // A
    }

    prevRow = curRow;
  }

  return { width, height, pixels };
}

// 2. High-Quality Bilinear Resample
function resizeBilinear(src, targetW, targetH, paddingPercent = 0) {
  const dst = Buffer.alloc(targetW * targetH * 4);
  const scale = (1 - paddingPercent * 2);
  const innerW = targetW * scale;
  const innerH = targetH * scale;
  const startX = targetW * paddingPercent;
  const startY = targetH * paddingPercent;

  // Detect edge background color from source (corners)
  const bgR = src.pixels[0];
  const bgG = src.pixels[1];
  const bgB = src.pixels[2];

  for (let dy = 0; dy < targetH; dy++) {
    for (let dx = 0; dx < targetW; dx++) {
      const dstIdx = (dy * targetW + dx) * 4;

      if (dx < startX || dx >= startX + innerW || dy < startY || dy >= startY + innerH) {
        dst[dstIdx] = bgR;
        dst[dstIdx + 1] = bgG;
        dst[dstIdx + 2] = bgB;
        dst[dstIdx + 3] = 255;
        continue;
      }

      const gx = ((dx - startX) / innerW) * (src.width - 1);
      const gy = ((dy - startY) / innerH) * (src.height - 1);
      const gxi = Math.floor(gx);
      const gyi = Math.floor(gy);
      const fx = gx - gxi;
      const fy = gy - gyi;

      const idx00 = (gyi * src.width + gxi) * 4;
      const idx10 = (gyi * src.width + Math.min(src.width - 1, gxi + 1)) * 4;
      const idx01 = (Math.min(src.height - 1, gyi + 1) * src.width + gxi) * 4;
      const idx11 = (Math.min(src.height - 1, gyi + 1) * src.width + Math.min(src.width - 1, gxi + 1)) * 4;

      for (let c = 0; c < 4; c++) {
        const top = src.pixels[idx00 + c] * (1 - fx) + src.pixels[idx10 + c] * fx;
        const bottom = src.pixels[idx01 + c] * (1 - fx) + src.pixels[idx11 + c] * fx;
        dst[dstIdx + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }

  return { width: targetW, height: targetH, pixels: dst };
}

// 3. Encode to PNG
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function encodePng(img) {
  const rowLen = 1 + img.width * 4;
  const raw = Buffer.alloc(rowLen * img.height);

  for (let y = 0; y < img.height; y++) {
    raw[y * rowLen] = 0; // Filter: None
    const srcRowOffset = y * img.width * 4;
    const dstRowOffset = y * rowLen + 1;
    img.pixels.copy(raw, dstRowOffset, srcRowOffset, srcRowOffset + img.width * 4);
  }

  const idatData = zlib.deflateSync(raw, { level: 9 });

  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.width, 0);
  ihdr.writeUInt32BE(img.height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Main Execution
const sourcePath = path.resolve('public', 'icons', 'zorromagicoicon.png');
if (!fs.existsSync(sourcePath)) {
  console.error('No se encontró:', sourcePath);
  process.exit(1);
}

console.log('Decodificando imagen original:', sourcePath);
const srcBuf = fs.readFileSync(sourcePath);
const srcImg = decodePngRgb(srcBuf);
console.log(`Dimensiones originales: ${srcImg.width}x${srcImg.height}`);

// Copy directly to public/zorromagicoicon.png
fs.copyFileSync(sourcePath, path.resolve('public', 'zorromagicoicon.png'));
console.log('Copiado a public/zorromagicoicon.png');

// Copy banner if present
const bannerSource = path.resolve('public', 'icons', 'Ortografía Mágica_ Zorro Encantado.png');
if (fs.existsSync(bannerSource)) {
  fs.copyFileSync(bannerSource, path.resolve('public', 'assets', 'zorro_encantado_banner.png'));
  fs.copyFileSync(bannerSource, path.resolve('public', 'assets', 'og-banner.png'));
  console.log('Banner copiado a public/assets/zorro_encantado_banner.png y og-banner.png');
}

// Generate PWA Icon Variants
const iconsDir = path.resolve('public', 'icons');

// 1. icon-512.png
console.log('Generando icon-512.png...');
const img512 = resizeBilinear(srcImg, 512, 512, 0);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), encodePng(img512));

// 2. icon-512-maskable.png (with 12% safe zone padding)
console.log('Generando icon-512-maskable.png (con margen seguro)...');
const img512Mask = resizeBilinear(srcImg, 512, 512, 0.10);
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), encodePng(img512Mask));

// 3. icon-192.png
console.log('Generando icon-192.png...');
const img192 = resizeBilinear(srcImg, 192, 192, 0);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), encodePng(img192));

// 4. apple-touch-icon.png (180x180)
console.log('Generando apple-touch-icon.png...');
const img180 = resizeBilinear(srcImg, 180, 180, 0);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), encodePng(img180));

// 5. favicon-32.png
console.log('Generando favicon-32.png...');
const img32 = resizeBilinear(srcImg, 32, 32, 0);
fs.writeFileSync(path.join(iconsDir, 'favicon-32.png'), encodePng(img32));
fs.writeFileSync(path.resolve('public', 'favicon.png'), encodePng(img32));

// 6. SVG wrapper for favicon.svg that embeds the 192px PNG in high quality Base64
const pngBase64 = encodePng(img192).toString('base64');
const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="100%" height="100%">
  <image href="data:image/png;base64,${pngBase64}" width="192" height="192" />
</svg>`;
fs.writeFileSync(path.resolve('public', 'favicon.svg'), svgWrapper);
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgWrapper);
console.log('favicon.svg y icon.svg actualizados con la nueva imagen del zorro mágico.');

console.log('=== ¡Todos los iconos generados y procesados meticulosamente! ===');
