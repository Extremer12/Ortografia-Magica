import React, { useState } from 'react';
import type { QuizQuestion } from '../../types';
import { Check, X, Search, Sparkles } from 'lucide-react';

interface Props {
  question: QuizQuestion;
  selectedOption: string | null;
  isAnswered: boolean;
  onSelect: (chosenCorrection: string) => void;
}

export const ActivitySentenceFix: React.FC<Props> = ({
  question,
  selectedOption,
  isAnswered,
  onSelect,
}) => {
  const sentence = question.sentence || question.prompt;
  const rawWords = sentence.split(/\s+/);

  // Clean words for matching (stripping punctuation like dots or commas)
  const cleanWord = (w: string) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '').trim();

  const [tappedWordIndex, setTappedWordIndex] = useState<number | null>(null);
  const [chosenCorrection, setChosenCorrection] = useState<string | null>(null);

  const options =
    question.correctionOptions && question.correctionOptions.length > 0
      ? question.correctionOptions
      : question.options;

  const targetErrorWord = question.errorWord ? cleanWord(question.errorWord).toLowerCase() : '';

  const isTappedWordTheError =
    tappedWordIndex !== null &&
    (!targetErrorWord || cleanWord(rawWords[tappedWordIndex]).toLowerCase() === targetErrorWord);

  const handleWordTap = (idx: number) => {
    if (isAnswered) return;
    setTappedWordIndex(idx);
    setChosenCorrection(null);
  };

  const handleCorrectionSelect = (opt: string) => {
    if (isAnswered) return;
    setChosenCorrection(opt);
  };

  const handleSubmit = () => {
    if (!chosenCorrection || isAnswered) return;
    onSelect(chosenCorrection);
  };

  const isCorrect = isAnswered && selectedOption?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

  return (
    <div className="space-y-6 pt-1">
      {/* Sentence interactive container */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F4EB] border-2 border-[#D9CDB8] space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[#62718E]">
          <span className="flex items-center gap-1.5 text-[#C27D16] font-bold uppercase tracking-wider text-[11px]">
            <Search size={13} />
            {isAnswered
              ? 'Análisis de la oración:'
              : 'Paso 1: Tocá la palabra con error ortográfico:'}
          </span>
          {tappedWordIndex !== null && !isAnswered && (
            <span className="text-[#1F5F46] font-bold text-xs">
              Palabra señalada: &ldquo;{cleanWord(rawWords[tappedWordIndex])}&rdquo;
            </span>
          )}
        </div>

        {/* Word Chips in Sentence */}
        <div className="flex flex-wrap items-center gap-2 text-lg sm:text-xl font-editorial leading-relaxed">
          {rawWords.map((rawWord, idx) => {
            const isTapped = tappedWordIndex === idx;
            const isTheActualError =
              targetErrorWord && cleanWord(rawWord).toLowerCase() === targetErrorWord;

            let wordClass =
              'px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ';

            if (isAnswered) {
              if (isTheActualError) {
                wordClass += isCorrect
                  ? 'bg-[#EBF4F0] border-[#1F5F46] text-[#14402F] line-through decoration-[#D9483B] decoration-2 font-bold ring-1 ring-[#1F5F46]'
                  : 'bg-[#FDF1F0] border-[#D9483B] text-[#8F261C] font-bold ring-2 ring-[#D9483B]';
              } else {
                wordClass += 'bg-transparent border-transparent text-[#16284F] opacity-75';
              }
            } else if (isTapped) {
              wordClass +=
                'bg-[#FAF6EC] border-2 border-[#C27D16] text-[#16284F] font-bold shadow-xs ring-2 ring-[#C27D16]/30';
            } else {
              wordClass +=
                'bg-[#FDFBF7] border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] hover:border-[#B8A88E]';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleWordTap(idx)}
                className={wordClass}
              >
                {rawWord}
              </button>
            );
          })}
        </div>

        {/* Post-answer comparison preview */}
        {isAnswered && (
          <div className="pt-2 border-t border-[#E8DFCF] flex items-center gap-2 text-xs font-semibold">
            {isCorrect ? (
              <span className="text-[#1F5F46] flex items-center gap-1.5 bg-[#EBF4F0] px-3 py-1 rounded-lg border border-[#C6DFD5]">
                <Check size={14} className="stroke-[3]" />
                ¡Identificaste el error y elegiste la corrección correcta!
              </span>
            ) : (
              <span className="text-[#8F261C] flex items-center gap-1.5 bg-[#FDF1F0] px-3 py-1 rounded-lg border border-[#F5C2BE]">
                <X size={14} className="stroke-[3]" />
                La forma correcta es: <strong className="text-[#16284F] ml-1">{question.correctAnswer}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Feedback when tapping a word that has no error */}
      {!isAnswered && tappedWordIndex !== null && !isTappedWordTheError && (
        <div className="p-3.5 rounded-xl bg-[#FAF6EC] border border-[#E2DAC8] text-xs text-[#62718E] flex items-center gap-2 scene-fade-in">
          <Sparkles size={14} className="text-[#C27D16] shrink-0" />
          <span>
            La palabra <strong className="text-[#16284F]">&ldquo;{cleanWord(rawWords[tappedWordIndex])}&rdquo;</strong> está bien escrita. ¡Tocá otra palabra de la oración para encontrar el error!
          </span>
        </div>
      )}

      {/* Step 2: Choose the replacement word (Only if the error word is tapped and not yet answered) */}
      {!isAnswered && isTappedWordTheError && (
        <div className="space-y-3 scene-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-[#62718E]">
            <span className="text-[#16284F] font-bold flex items-center gap-1">
              <Sparkles size={13} className="text-[#C27D16]" />
              Paso 2: ¿Cuál es la forma correcta de escribirla?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {options.map((opt, optIdx) => {
              const isSelected = chosenCorrection === opt;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleCorrectionSelect(opt)}
                  className={`p-3 rounded-xl border text-base font-bold font-editorial text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF6EC] border-2 border-[#1F5F46] text-[#14402F] shadow-xs ring-2 ring-[#1F5F46]/20'
                      : 'bg-[#FDFBF7] border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] hover:border-[#B8A88E]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!chosenCorrection}
              onClick={handleSubmit}
              className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                chosenCorrection
                  ? 'btn-editorial-primary text-[#0E1C38] shadow-xs'
                  : 'bg-[#E2DAC8] text-[#8C7F69] border border-[#D9CDB8] cursor-not-allowed opacity-60'
              }`}
            >
              <span>Aplicar corrección</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
