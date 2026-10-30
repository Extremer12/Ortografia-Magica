import React, { useState } from 'react';
import type { QuizQuestion } from '../../types';
import { Check, X, Sparkles } from 'lucide-react';

interface Props {
  question: QuizQuestion;
  selectedOption: string | null;
  isAnswered: boolean;
  onSelect: (option: string) => void;
}

export const ActivityFillWord: React.FC<Props> = ({
  question,
  selectedOption,
  isAnswered,
  onSelect,
}) => {
  const [tentativeChoice, setTentativeChoice] = useState<string | null>(null);

  const fillOptions =
    question.fillOptions && question.fillOptions.length > 0
      ? question.fillOptions
      : question.options;

  const template = question.wordTemplate || question.prompt.replace(/.*[:“"]/, '').replace(/["”]/, '').trim() || '___';

  const parts = template.includes('___')
    ? template.split('___')
    : [template.slice(0, Math.floor(template.length / 2)), template.slice(Math.floor(template.length / 2))];

  const currentDisplayValue = isAnswered ? selectedOption : tentativeChoice;

  const handlePickCandidate = (opt: string) => {
    if (isAnswered) return;
    setTentativeChoice(opt);
  };

  const handleConfirm = () => {
    if (!tentativeChoice || isAnswered) return;
    onSelect(tentativeChoice);
  };

  const isCorrect = isAnswered && selectedOption?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

  return (
    <div className="space-y-6 pt-2">
      {/* Template Card: Large letter blocks or sentence with slot */}
      <div className="p-6 rounded-2xl bg-[#F7F4EB] border-2 border-[#D9CDB8] text-center shadow-xs space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C27D16] block">
          Completá el espacio en blanco:
        </span>

        <div className="inline-flex items-center justify-center flex-wrap gap-2 text-2xl sm:text-3xl font-editorial font-bold text-[#16284F] tracking-wide">
          <span>{parts[0]}</span>
          <span
            className={`min-w-[56px] h-12 px-3 rounded-xl border-2 flex items-center justify-center transition-all ${
              currentDisplayValue
                ? isAnswered
                  ? isCorrect
                    ? 'bg-[#EBF4F0] border-[#1F5F46] text-[#14402F] shadow-xs'
                    : 'bg-[#FDF1F0] border-[#D9483B] text-[#8F261C] shadow-xs'
                  : 'bg-[#FAF6EC] border-[#C27D16] text-[#16284F] ring-2 ring-[#C27D16]/30'
                : 'bg-[#EFECE0] border-dashed border-[#A3937A] text-[#8C7F69]'
            }`}
          >
            {currentDisplayValue ? (
              <span className="font-bold underline decoration-[#C27D16] decoration-2">
                {currentDisplayValue}
              </span>
            ) : (
              <span className="text-sm font-normal text-[#8C7F69] tracking-normal">?</span>
            )}
          </span>
          <span>{parts[1] || ''}</span>
        </div>
      </div>

      {/* Interactive Options Bank */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#62718E]">
          <span>Elegí la letra o sílaba correcta:</span>
          {tentativeChoice && !isAnswered && (
            <span className="text-[#C27D16] flex items-center gap-1 font-bold">
              <Sparkles size={12} />
              Seleccionado: {tentativeChoice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {fillOptions.map((opt, idx) => {
            const isTentative = tentativeChoice === opt;
            const isFinalSelected = selectedOption === opt;
            const isThisCorrect = opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

            let btnStyle =
              'bg-[#FDFBF7] border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] hover:border-[#B8A88E]';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle =
                  'bg-[#EBF4F0] border-[#1F5F46] text-[#14402F] font-bold ring-2 ring-[#1F5F46]';
              } else if (isFinalSelected) {
                btnStyle =
                  'bg-[#FDF1F0] border-[#D9483B] text-[#8F261C] font-bold ring-2 ring-[#D9483B]';
              } else {
                btnStyle = 'bg-[#F7F4EB] border-[#E2DAC8] text-[#8C7F69] opacity-50';
              }
            } else if (isTentative) {
              btnStyle =
                'bg-[#FAF6EC] border-2 border-[#C27D16] text-[#16284F] font-bold shadow-sm ring-2 ring-[#C27D16]/20';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handlePickCandidate(opt)}
                className={`h-14 sm:h-16 rounded-xl border flex items-center justify-center text-xl sm:text-2xl font-bold font-editorial transition-all cursor-pointer ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isThisCorrect && (
                  <Check size={16} className="ml-1 text-[#1F5F46] stroke-[3]" />
                )}
                {isAnswered && isFinalSelected && !isThisCorrect && (
                  <X size={16} className="ml-1 text-[#D9483B] stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Action Button before final reveal */}
      {!isAnswered && (
        <button
          type="button"
          disabled={!tentativeChoice}
          onClick={handleConfirm}
          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            tentativeChoice
              ? 'btn-editorial-primary text-[#0E1C38] shadow-xs'
              : 'bg-[#E2DAC8] text-[#8C7F69] border border-[#D9CDB8] cursor-not-allowed opacity-60'
          }`}
        >
          <span>Confirmar respuesta</span>
        </button>
      )}
    </div>
  );
};
