import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { Grade } from '../types';
import { Volume2, VolumeX, ChevronDown, Check, Users } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

export const Header: React.FC = () => {
  const {
    progress,
    selectedGrade,
    setGrade,
    soundEnabled,
    toggleSound,
  } = useGame();

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const grades: Grade[] = ['1.°', '2.°', '3.°', '4.°', '5.°', '6.°', '7.°'];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xs border-b border-[#E2DAC8] text-[#16284F] px-4 py-2.5 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          
          {/* Student seal & Grade badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-8 h-8 rounded-lg bg-[#16284F] text-[#FAF6EC] font-editorial font-bold text-xs flex items-center justify-center border border-[#0D1A33] shadow-2xs hover:bg-[#213E75] transition-colors cursor-pointer"
              title="Cambiar aventurero / Gestionar perfiles"
              aria-label="Abrir gestión de perfiles"
            >
              <span>{progress.avatar}</span>
            </button>

            <div className="flex items-center gap-2 text-left">
              <button
                onClick={() => setShowProfileModal(true)}
                className="font-editorial font-bold text-xs text-[#16284F] hover:text-[#C27D16] transition-colors cursor-pointer flex items-center gap-1"
                title="Cambiar aventurero"
              >
                <span>{progress.name}</span>
                <ChevronDown size={11} className="text-[#8C7F69]" />
              </button>

              <span className="text-[#C8BDA5]">|</span>

              {/* Quiet Grade Switcher Pill */}
              <button
                onClick={() => setShowGradeModal(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#62718E] hover:text-[#16284F] bg-[#FAF6EC] border border-[#D9CDB8] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Cambiar año escolar"
              >
                <span>{selectedGrade} grado</span>
                <ChevronDown size={11} className="text-[#8C7F69]" />
              </button>
            </div>
          </div>

          {/* Right side: Profile Switcher icon & Audio toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-1.5 rounded-lg text-[#62718E] hover:text-[#16284F] hover:bg-[#F2ECE0] border border-transparent hover:border-[#D9CDB8] transition-colors cursor-pointer"
              title="Aventureros y Perfiles"
              aria-label="Ver lista de perfiles"
            >
              <Users size={16} />
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-[#62718E] hover:text-[#16284F] hover:bg-[#F2ECE0] border border-transparent hover:border-[#D9CDB8] transition-colors cursor-pointer"
              title={soundEnabled ? 'Silenciar sonidos' : 'Habilitar sonidos'}
              aria-label={soundEnabled ? 'Silenciar sonidos' : 'Habilitar sonidos'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-[#A3937A]" />}
            </button>
          </div>
        </div>

        {/* Grade Selector Modal Sheet */}
        {showGradeModal && (
          <div className="fixed inset-0 z-50 bg-[#0A1426]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FDFBF7] border border-[#C8BDA5] rounded-2xl p-5 max-w-sm w-full shadow-2xl text-left space-y-3 animate-in zoom-in-95">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                  Nivel escolar
                </span>
                <h3 className="text-base font-editorial font-bold text-[#16284F]">
                  Seleccioná tu año de primaria
                </h3>
                <p className="text-xs text-[#62718E] pt-0.5 leading-relaxed">
                  Los desafíos y vocabulario se ajustan a la currícula argentina.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {grades.map((grade) => {
                  const isSelected = selectedGrade === grade;
                  return (
                    <button
                      key={grade}
                      onClick={() => {
                        setGrade(grade);
                        setShowGradeModal(false);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF6EC] border-2 border-[#C27D16] text-[#16284F] font-bold shadow-2xs'
                          : 'bg-[#FDFBF7] border border-[#E2DAC8] text-[#526079] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <span>{grade} grado de primaria</span>
                      {isSelected && <Check size={14} className="text-[#C27D16] stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowGradeModal(false)}
                className="w-full text-center text-xs text-[#7E8DAA] hover:text-[#16284F] font-semibold pt-1 cursor-pointer"
              >
                Mantener actual
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Profile Management Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
