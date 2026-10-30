import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1426]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#FDFBF7] border border-[#C8BDA5] rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-left space-y-4 animate-in zoom-in-95 text-[#16284F]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E8DFCF] pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isDestructive
                ? 'bg-[#FDF1F0] text-[#8F261C] border-[#F5C2BE]'
                : 'bg-[#FAF6EC] text-[#C27D16] border-[#E2DAC8]'
            }`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                Atención pedagógica
              </span>
              <h3 className="text-base font-editorial font-bold text-[#16284F] leading-tight">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#7E8DAA] hover:text-[#16284F] hover:bg-[#F2ECE0] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#526079] leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-3 rounded-xl border border-[#D9CDB8] bg-[#F7F4EB] text-xs font-bold text-[#526079] hover:bg-[#FFFFFF] hover:text-[#16284F] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs ${
              isDestructive
                ? 'bg-[#B9382C] hover:bg-[#9E2A20]'
                : 'bg-[#C27D16] hover:bg-[#9A600B]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
