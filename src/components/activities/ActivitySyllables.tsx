import React, { useState } from 'react';
import type { QuizQuestion } from '../../types';
import { Check, X, RotateCcw, ArrowRight } from 'lucide-react';

interface Props {
  question: QuizQuestion;
  selectedOption: string | null;
  isAnswered: boolean;
  onSelect: (assembledWord: string) => void;
}

export const ActivitySyllables: React.FC<Props> = ({
  question,
  selectedOption,
  isAnswered,
  onSelect,
}) => {
  // Syllables pool
  const initialSyllables = question.syllables && question.syllables.length > 0
    ? question.syllables
    : question.options;

  // Track which syllable indices from initialSyllables have been placed into slots
  const [placedIndices, setPlacedIndices] = useState<number[]>([]);

  const handlePlace = (originalIndex: number) => {
    if (isAnswered) return;
    if (placedIndices.includes(originalIndex)) return;
    setPlacedIndices(prev => [...prev, originalIndex]);
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    if (isAnswered) return;
    setPlacedIndices(prev => prev.filter((_, idx) => idx !== slotIndex));
  };

  const handleReset = () => {
    if (isAnswered) return;
    setPlacedIndices([]);
  };

  const assembledWord = placedIndices.map(i => initialSyllables[i]).join('');
  const allPlaced = placedIndices.length === initialSyllables.length;

  const handleVerify = () => {
    if (!allPlaced || isAnswered) return;
    onSelect(assembledWord);
  };

  const normalize = (w: string) => w.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const isCorrect = isAnswered && (
    normalize(selectedOption || '') === normalize(question.correctAnswer) ||
    normalize(selectedOption || '') === normalize(question.targetWord || '')
  );

  return (
    <div className="space-y-6 pt-1">
      {/* Target Word Slots */}
      <div className="p-5 rounded-2xl bg-[#F7F4EB] border-2 border-[#D9CDB8] space-y-3 text-center">
        <div className="flex items-center justify-between text-xs text-[#62718E] font-semibold">
          <span>Palabra armada:</span>
          {!isAnswered && placedIndices.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[#C27D16] hover:text-[#9A600B] flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reiniciar</span>
            </button>
          )}
        </div>

        {/* Syllable Slots */}
        <div className="flex items-center justify-center flex-wrap gap-2 min-h-[56px] py-1">
          {initialSyllables.map((_, slotIdx) => {
            const placedOriginalIdx = placedIndices[slotIdx];
            const hasSyllable = placedOriginalIdx !== undefined;
            const syllableText = hasSyllable ? initialSyllables[placedOriginalIdx] : '';

            let slotStyle = 'border-dashed border-[#A3937A] bg-[#EFECE0] text-[#8C7F69]';

            if (hasSyllable) {
              if (isAnswered) {
                slotStyle = isCorrect
                  ? 'border-2 border-[#1F5F46] bg-[#EBF4F0] text-[#14402F] font-bold shadow-2xs'
                  : 'border-2 border-[#D9483B] bg-[#FDF1F0] text-[#8F261C] font-bold shadow-2xs';
              } else {
                slotStyle =
                  'border-2 border-[#C27D16] bg-[#FAF6EC] text-[#16284F] font-bold shadow-xs hover:border-[#D9483B] cursor-pointer';
              }
            }

            return (
              <button
                key={slotIdx}
                type="button"
                disabled={isAnswered || !hasSyllable}
                onClick={() => handleRemoveFromSlot(slotIdx)}
                className={`min-w-[58px] h-13 sm:h-14 px-3 rounded-xl border flex items-center justify-center text-lg sm:text-xl font-editorial font-bold transition-all ${slotStyle}`}
                title={hasSyllable && !isAnswered ? 'Tocá para quitar esta sílaba' : undefined}
              >
                {hasSyllable ? (
                  <span>{syllableText}</span>
                ) : (
                  <span className="text-xs font-normal text-[#A3937A]">
                    {slotIdx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Result indication on slots */}
        {isAnswered && (
          <div className="pt-2 text-xs font-bold flex items-center justify-center gap-1.5">
            {isCorrect ? (
              <span className="text-[#1F5F46] flex items-center gap-1 bg-[#EBF4F0] px-3 py-1 rounded-full border border-[#C6DFD5]">
                <Check size={14} className="stroke-[3]" />
                ¡Palabra ordenada a la perfección!
              </span>
            ) : (
              <span className="text-[#8F261C] flex items-center gap-1 bg-[#FDF1F0] px-3 py-1 rounded-full border border-[#F5C2BE]">
                <X size={14} className="stroke-[3]" />
                Orden esperado: <strong className="ml-1 text-[#16284F]">{question.correctAnswer}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Syllables Bank to Pick From */}
      {!isAnswered && (
        <div className="space-y-3">
          <p className="text-xs text-[#62718E] font-semibold text-center">
            Tocá las sílabas en orden para formar la palabra:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {initialSyllables.map((syl, idx) => {
              const isAlreadyPlaced = placedIndices.includes(idx);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAlreadyPlaced}
                  onClick={() => handlePlace(idx)}
                  className={`min-w-[64px] h-13 sm:h-14 px-4 rounded-xl border text-lg sm:text-xl font-editorial font-bold transition-all ${
                    isAlreadyPlaced
                      ? 'bg-[#EFECE0] border-[#E2DAC8] text-[#B8A88E] opacity-40 cursor-not-allowed scale-95'
                      : 'bg-[#FDFBF7] border-2 border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] hover:border-[#C27D16] hover:scale-105 active:scale-95 shadow-2xs cursor-pointer'
                  }`}
                >
                  {syl}
                </button>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!allPlaced}
              onClick={handleVerify}
              className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                allPlaced
                  ? 'btn-editorial-primary text-[#0E1C38] shadow-xs'
                  : 'bg-[#E2DAC8] text-[#8C7F69] border border-[#D9CDB8] cursor-not-allowed opacity-60'
              }`}
            >
              <span>Comprobar palabra armada</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
