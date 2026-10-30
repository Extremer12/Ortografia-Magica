import React, { useState, useEffect } from 'react';
import { Download, X, Share, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture Chrome/Android/Desktop install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  // Do not show if already installed, dismissed by user, or not applicable
  if (isInstalled || dismissed) return null;
  if (!deferredPrompt && !isIos) return null;

  return (
    <>
      {/* Floating Install Notification Banner */}
      <aside aria-label="Instalar aplicación" className="fixed top-14 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="bg-[#0E1C38] border-2 border-[#C27D16] text-[#FAF6EC] rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(4,10,24,0.7)] flex items-center gap-3">
          {/* App Icon preview */}
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#D9CDB8]/40 shrink-0 bg-[#16284F] flex items-center justify-center">
            <img src="/icons/icon.svg" alt="Ortografía Mágica" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F4CA78] block">
              App disponible
            </span>
            <h4 className="font-editorial font-bold text-xs sm:text-sm text-white truncate">
              Instalá Ortografía Mágica
            </h4>
            <p className="text-[10px] text-[#A6B4CE] leading-tight">
              Usala a pantalla completa y sin internet.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-[#C88214] hover:bg-[#D68F20] text-[#0E1C38] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Instalar en este dispositivo"
            >
              <Download size={13} />
              <span>Instalar</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-[#7E8DAA] hover:text-white transition-colors cursor-pointer"
              title="Cerrar aviso"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-[#0A1426]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#C8BDA5] rounded-2xl p-5 max-w-sm w-full text-left space-y-4 shadow-2xl text-[#16284F] animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF6EC] border border-[#C27D16] flex items-center justify-center text-[#C27D16]">
                  <Smartphone size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                    Instalación en iPhone / iPad
                  </span>
                  <h3 className="font-editorial font-bold text-base text-[#16284F]">
                    Cómo agregar al inicio
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-[#7E8DAA] hover:text-[#16284F]"
              >
                <X size={18} />
              </button>
            </div>

            <ol className="text-xs text-[#526079] space-y-2.5 bg-[#FAF6EC] p-3.5 rounded-xl border border-[#E2DAC8]">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#16284F] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span>En Safari, tocá el botón <strong>Compartir</strong> (<Share size={12} className="inline text-[#C27D16]" />) en la barra inferior.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#16284F] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span>Deslizá hacia abajo y seleccioná <strong>«Agregar a pantalla de inicio»</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#16284F] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span>Tocá <strong>«Agregar»</strong> en la esquina superior derecha.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 px-4 rounded-xl btn-editorial-primary text-xs font-bold cursor-pointer"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
