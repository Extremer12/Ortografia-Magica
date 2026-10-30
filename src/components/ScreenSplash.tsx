import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { Grade } from '../types';
import { ArrowRight, Users } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

export const ScreenSplash: React.FC = () => {
  const {
    selectedGrade,
    setGrade,
    activeProfile,
    navigateTo,
  } = useGame();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const grades: Grade[] = ['1.°', '2.°', '3.°', '4.°', '5.°', '6.°', '7.°'];

  return (
    <>
      <div className="min-h-screen bg-[#0E1C38] text-[#F8F5EE] flex flex-col justify-between p-5 sm:p-7 relative overflow-hidden select-none">
        {/* Background subtle architectural vignette */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_20%,#1B3363_0%,#0E1C38_80%)]" 
        />

        {/* Top subtle bar: Discreet territory indicator */}
        <header className="relative z-10 flex items-center justify-between text-xs tracking-wider uppercase text-[#C4BDAE] border-b border-[#243963]/60 pb-3">
          <span className="font-semibold tracking-widest text-[11px] text-[#DF9A28]">
            Escuela Primaria
          </span>
          <span className="text-[11px] text-[#A6B4CE]">
            Territorio de Letras
          </span>
        </header>

        {/* Main Asymmetric Adventure Scene */}
        <main className="relative z-10 flex-1 flex flex-col justify-center max-w-sm sm:max-w-md mx-auto w-full py-3 space-y-4">
          
          {/* Editorial Storybook Header */}
          <div className="text-left space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#DF9A28]">
              Aventura lingüística
            </p>
            <h1 className="text-4xl sm:text-5xl font-editorial font-bold tracking-tight text-[#FAF6EC] leading-[1.08]">
              Ortografía <br />
              <span className="italic font-normal text-[#F4CA78]">Mágica</span>
            </h1>
            <p className="text-sm text-[#C4CFE4] font-normal pt-1 max-w-xs leading-relaxed">
              Un viaje ilustrado para descubrir los secretos de las palabras, acentos y signos.
            </p>
          </div>

          {/* Hero Character: Archival framed window */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#D9CDB8]/30 shadow-[0_16px_36px_rgba(4,10,24,0.6)] bg-[#142344]">
            <img
              src="/assets/fox_mascot.jpg"
              alt="Félix, el zorro explorador"
              className="w-full h-full object-cover object-[center_28%]"
            />
            {/* Subtle bottom vignette with character plate */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1C38] via-[#0E1C38]/80 to-transparent p-3 flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#DF9A28] font-bold block">
                  Guía de expedición
                </span>
                <span className="font-editorial text-sm font-semibold text-[#FAF6EC]">
                  Félix el Zorro
                </span>
              </div>
              <span className="text-[11px] text-[#A6B4CE] bg-[#1A2E56]/90 px-2.5 py-0.5 rounded border border-[#2B467D]/60 font-medium">
                4 Mundos abiertos
              </span>
            </div>
          </div>

          {/* Active Profile Pill with Profile Switcher */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#14254A]/90 border border-[#243B6A] text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">{activeProfile.avatar}</span>
              <div className="text-left min-w-0">
                <span className="font-editorial font-bold text-[#FAF6EC] block leading-tight truncate">
                  {activeProfile.nickname}
                </span>
                <span className="text-[10px] text-[#A6B4CE]">
                  Nivel {activeProfile.level} · {activeProfile.currentXp} XP · Racha {activeProfile.streakDays}d
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#DF9A28] hover:text-[#F4CA78] bg-[#1A315E] hover:bg-[#213E75] border border-[#2B467D] transition-colors cursor-pointer shrink-0"
            >
              <Users size={12} />
              <span>Cambiar</span>
            </button>
          </div>

          {/* Compact Integrated Grade Selector */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-xs text-[#A6B4CE]">
              <span className="font-medium">Año escolar activo:</span>
              <span className="font-semibold text-[#F4CA78]">{selectedGrade} grado</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-1 bg-[#14254A] border border-[#243B6A] rounded-xl">
              {grades.map((grade) => {
                const isSelected = selectedGrade === grade;
                return (
                  <button
                    key={grade}
                    onClick={() => setGrade(grade)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C88214] text-[#0E1C38] shadow-sm font-editorial text-sm'
                        : 'text-[#C4CFE4] hover:bg-[#1D3568] hover:text-white'
                    }`}
                    aria-pressed={isSelected}
                    title={`Grado ${grade}`}
                  >
                    {grade}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-1">
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-3.5 px-6 rounded-xl btn-editorial-primary text-base flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Comenzar aventura</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </main>

        {/* Footer subtle brand signature */}
        <footer className="relative z-10 pt-2 text-center text-[11px] text-[#7E8DAA] border-t border-[#243963]/40">
          Sin registro ni contraseñas · Cuaderno interactivo de ortografía para primaria
        </footer>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
