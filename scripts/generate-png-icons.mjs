import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// CRC table for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
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

function generateIcon(size, isMaskable = false) {
  const rowLength = size * 4 + 1;
  const buffer = Buffer.alloc(rowLength * size);

  // Center coordinate and radii
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLength;
    buffer[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background color (Deep Navy)
      let r = 14, g = 28, b = 56, a = 255;

      // If not maskable, round corners nicely
      if (!isMaskable) {
        // Squircle corner check
        const qx = Math.abs(dx) - (size * 0.35);
        const qy = Math.abs(dy) - (size * 0.35);
        if (qx > 0 && qy > 0 && Math.sqrt(qx * qx + qy * qy) > (size * 0.12)) {
          a = 0; // Transparent outside squircle
        }
      }

      if (a > 0) {
        // Background gradient: slightly lighter navy at top, deeper at bottom
        const gradT = y / size;
        r = Math.round(20 * (1 - gradT) + 10 * gradT);
        g = Math.round(38 * (1 - gradT) + 16 * gradT);
        b = Math.round(75 * (1 - gradT) + 36 * gradT);

        // Golden rim border
        const rimDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (rimDist > size * 0.43 && rimDist < size * 0.46) {
          r = 216; g = 154; b = 40; // Gold rim
        }

        // Draw Open Book at bottom
        const bookY = cy + size * 0.22;
        if (Math.abs(dy - size * 0.25) < size * 0.12 && Math.abs(dx) < size * 0.35) {
          // Parchment pages
          r = 250; g = 246; b = 236; // #FAF6EC
          if (Math.abs(dx) < 2) {
            r = 194; g = 125; b = 22; // spine
          }
        }

        // Draw Fox Head (Mascot Félix)
        // Fox Face base triangle
        const foxY = cy - size * 0.05;
        const fdx = Math.abs(dx);
        const fdy = y - (foxY - size * 0.1);

        // Head bounds
        if (fdy > 0 && fdy < size * 0.32 && fdx < (size * 0.24 - fdy * 0.3)) {
          // Orange fur: #E26829
          r = 226; g = 104; b = 41;

          // White cheeks
          if (fdy > size * 0.15 && fdx > (size * 0.05 + (fdy - size * 0.15) * 0.3)) {
            r = 255; g = 253; b = 248; // White cheek patch
          }

          // Eyes
          const eyeY = foxY + size * 0.06;
          const eyeX = size * 0.09;
          if (Math.abs(y - eyeY) < size * 0.025 && Math.abs(fdx - eyeX) < size * 0.018) {
            r = 22; g = 40; b = 79; // Navy eye
          }

          // Nose
          if (Math.abs(y - (foxY + size * 0.2)) < size * 0.015 && fdx < size * 0.02) {
            r = 26; g = 28; b = 36; // Black nose
          }
        }

        // Fox Ears
        const earBaseY = foxY - size * 0.08;
        if (y < earBaseY && y > earBaseY - size * 0.22) {
          const earH = earBaseY - y;
          const leftEarCenter = size * 0.16;
          if (Math.abs(fdx - leftEarCenter) < (size * 0.11 - earH * 0.35)) {
            r = 226; g = 104; b = 41; // Orange ear
            if (Math.abs(fdx - leftEarCenter) < (size * 0.06 - earH * 0.25)) {
              r = 250; g = 246; b = 236; // Inner ear parchment
            }
          }
        }

        // Floating magic sparkles / golden accent
        const starDist1 = Math.sqrt((x - (cx + size * 0.28)) ** 2 + (y - (cy - size * 0.28)) ** 2);
        const starDist2 = Math.sqrt((x - (cx - size * 0.28)) ** 2 + (y - (cy - size * 0.24)) ** 2);
        if (starDist1 < size * 0.035 || starDist2 < size * 0.025) {
          r = 244; g = 202; b = 120; // Gold star #F4CA78
        }
      }

      buffer[pixelOffset] = r;
      buffer[pixelOffset + 1] = g;
      buffer[pixelOffset + 2] = b;
      buffer[pixelOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(buffer);

  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace

  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate 192x192
console.log('Generando icon-192.png...');
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generateIcon(192, false));

// Generate 512x512
console.log('Generando icon-512.png...');
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generateIcon(512, false));

// Generate 512x512 Maskable
console.log('Generando icon-512-maskable.png...');
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), generateIcon(512, true));

// Generate apple-touch-icon 180x180
console.log('Generando apple-touch-icon.png...');
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generateIcon(180, true));

console.log('¡Iconos PWA generados con éxito!');
