import React from 'react';
import type { QuizQuestion } from '../../types';
import { Check, X } from 'lucide-react';

interface Props {
  question: QuizQuestion;
  selectedOption: string | null;
  isAnswered: boolean;
  onSelect: (option: string) => void;
}

export const ActivityMultipleChoice: React.FC<Props> = ({
  question,
  selectedOption,
  isAnswered,
  onSelect,
}) => {
  return (
    <div className="space-y-2.5 pt-1" role="radiogroup" aria-label={question.prompt}>
      {question.options.map((option, idx) => {
        const isSelected = selectedOption === option;
        const isCorrect = option === question.correctAnswer;

        let optionStyle =
          'bg-[#FDFBF7] border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] hover:border-[#B8A88E]';
        let badgeStyle = 'bg-[#FAF6EC] border-[#D9CDB8] text-[#8C7F69]';

        if (isAnswered) {
          if (isCorrect) {
            optionStyle =
              'bg-[#EBF4F0] border-[#1F5F46] text-[#14402F] font-bold shadow-2xs ring-2 ring-[#1F5F46]';
            badgeStyle = 'bg-[#1F5F46] border-[#1F5F46] text-[#FAF6EC] font-bold';
          } else if (isSelected) {
            optionStyle =
              'bg-[#FDF1F0] border-[#D9483B] text-[#8F261C] font-bold ring-2 ring-[#D9483B]';
            badgeStyle = 'bg-[#D9483B] border-[#D9483B] text-[#FAF6EC] font-bold';
          } else {
            optionStyle = 'bg-[#F7F4EB] border-[#E2DAC8] text-[#8C7F69] opacity-50';
          }
        }

        return (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isAnswered}
            onClick={() => onSelect(option)}
            className={`w-full min-h-[54px] p-3.5 sm:p-4 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${optionStyle}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`font-editorial text-xs font-bold w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${badgeStyle}`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-base sm:text-lg font-bold tracking-wide">
                {option}
              </span>
            </div>

            {isAnswered && isCorrect && (
              <span className="flex items-center gap-1 text-xs font-bold text-[#14402F] bg-[#D4E8DE] px-2 py-1 rounded-md border border-[#1F5F46]">
                <Check size={14} className="stroke-[3]" />
                <span className="hidden xs:inline">Correcta</span>
              </span>
            )}
            {isAnswered && isSelected && !isCorrect && (
              <span className="flex items-center gap-1 text-xs font-bold text-[#8F261C] bg-[#FAD9D6] px-2 py-1 rounded-md border border-[#D9483B]">
                <X size={14} className="stroke-[3]" />
                <span className="hidden xs:inline">Tu respuesta</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
