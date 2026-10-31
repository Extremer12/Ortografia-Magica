import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { QuizResultMistake, ActivityType, QuizQuestion } from '../types';
import { X, Volume2, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { sound } from '../utils/sound';

import { ActivityMultipleChoice } from './activities/ActivityMultipleChoice';
import { ActivityFillWord } from './activities/ActivityFillWord';
import { ActivitySyllables } from './activities/ActivitySyllables';
import { ActivitySentenceFix } from './activities/ActivitySentenceFix';

export const ScreenGame: React.FC = () => {
  const { activeQuestions, finishQuiz, navigateTo } = useGame();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Synchronous ref to prevent any state lag on completion
  const resultsRef = useRef<{
    correctCount: number;
    mistakes: QuizResultMistake[];
  }>({
    correctCount: 0,
    mistakes: [],
  });

  // Reset counters when questions set changes
  useEffect(() => {
    resultsRef.current = { correctCount: 0, mistakes: [] };
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [activeQuestions]);

  const questions = activeQuestions.length > 0 ? activeQuestions : [
    {
      id: 'default-1',
      type: 'multiple_choice' as const,
      grade: '3.°' as const,
      worldId: 'castillo',
      topic: 'Ortografía',
      difficulty: 'Fácil' as const,
      prompt: 'Elegí la palabra correcta:',
      subPrompt: '¿Cuál de estas palabras está escrita correctamente?',
      options: ['bicicleta', 'bisicleta', 'biscicleta', 'visicleta'],
      correctAnswer: 'bicicleta',
      explanation: 'La palabra se escribe con B al inicio y con C: bicicleta.',
      audioWord: 'bicicleta',
    }
  ];

  const currentQ = questions[currentIndex] || questions[0];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  /**
   * Accurate orthographic comparison preserving diacritical accents (á, é, í, ó, ú, ü, ñ).
   * Stripping accents destroys the core pedagogical purpose (e.g., té vs te, más vs mas).
   */
  const checkAnswer = (selected: string, q: QuizQuestion): boolean => {
    const sel = selected.trim();
    const cor = q.correctAnswer.trim();
    const target = q.targetWord?.trim();

    // Exact string match
    if (sel === cor) return true;
    if (target && sel === target) return true;

    // Check if options contain case-sensitive distinctions (e.g. 'Argentina' vs 'argentina')
    const allOptions = q.options || q.fillOptions || q.correctionOptions || [];
    const hasCaseSensitiveDistinction = allOptions.some(
      opt => opt.trim() !== cor && opt.trim().toLowerCase() === cor.toLowerCase()
    );

    // If options don't differ by case alone, allow case-insensitive match WITHOUT stripping accents
    if (!hasCaseSensitiveDistinction) {
      if (sel.toLowerCase() === cor.toLowerCase()) return true;
      if (target && sel.toLowerCase() === target.toLowerCase()) return true;
    }

    return false;
  };

  const handleSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = checkAnswer(option, currentQ);

    if (isCorrect) {
      sound.playCorrect();
      resultsRef.current.correctCount += 1;
    } else {
      sound.playWrong();
      const mistakeRecord: QuizResultMistake = {
        prompt: currentQ.prompt,
        studentAnswer: option,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
      };
      resultsRef.current.mistakes.push(mistakeRecord);
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz(
        resultsRef.current.correctCount,
        questions.length,
        resultsRef.current.mistakes
      );
    }
  };

  const handlePronounce = () => {
    sound.playClick();
    if (currentQ.audioWord) {
      sound.speak(currentQ.audioWord);
    } else {
      sound.speak(currentQ.correctAnswer);
    }
  };

  const getActivityTypeLabel = (type?: ActivityType) => {
    switch (type) {
      case 'fill_word':
        return 'Completar palabra';
      case 'syllables':
        return 'Ordenar sílabas';
      case 'sentence_fix':
        return 'Corregir oración';
      case 'multiple_choice':
      default:
        return 'Opción múltiple';
    }
  };

  const renderActivityModality = () => {
    const actType = currentQ.type || 'multiple_choice';

    switch (actType) {
      case 'fill_word':
        return (
          <ActivityFillWord
            key={currentQ.id}
            question={currentQ}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            onSelect={handleSelect}
          />
        );
      case 'syllables':
        return (
          <ActivitySyllables
            key={currentQ.id}
            question={currentQ}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            onSelect={handleSelect}
          />
        );
      case 'sentence_fix':
        return (
          <ActivitySentenceFix
            key={currentQ.id}
            question={currentQ}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            onSelect={handleSelect}
          />
        );
      case 'multiple_choice':
      default:
        return (
          <ActivityMultipleChoice
            key={currentQ.id}
            question={currentQ}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            onSelect={handleSelect}
          />
        );
    }
  };

  const isCurrentAnswerCorrect =
    isAnswered && selectedOption !== null && checkAnswer(selectedOption, currentQ);

  return (
    <div className="min-h-screen pb-10 pt-4 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-between scene-fade-in text-[#16284F]">
      
      {/* Top Header: Navigation, Progress & Modality Tag */}
      <div>
        <header className="flex items-center justify-between gap-3 mb-3 border-b border-[#E2DAC8] pb-3">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="w-9 h-9 rounded-lg bg-[#FAF6EC] border border-[#D9CDB8] text-[#526079] hover:text-[#D9483B] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Salir del desafío"
            aria-label="Salir del ejercicio"
          >
            <X size={18} />
          </button>

          <div className="flex-1 max-w-xs text-center">
            <div className="flex items-center justify-between text-xs text-[#62718E] font-semibold mb-1 px-1">
              <span>Ejercicio {currentIndex + 1} de {questions.length}</span>
              <span className="text-[#C27D16]">{progressPercent}%</span>
            </div>
            <div
              className="w-full h-2 bg-[#E2DAC8] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-[#1F5F46] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C27D16] bg-[#FAF6EC] px-2 py-0.5 rounded border border-[#E2DAC8] hidden xs:inline">
              {getActivityTypeLabel(currentQ.type)}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F5F46] bg-[#EBF4F0] px-2.5 py-1 rounded border border-[#C6DFD5]">
              {currentQ.difficulty}
            </span>
          </div>
        </header>

        {/* Central Activity Sheet */}
        <main className="page-paper rounded-2xl p-5 sm:p-6 border border-[#D9CDB8] space-y-5 text-left shadow-xs">
          
          {/* Question Title & Audio Trigger */}
          <div className="flex items-start justify-between gap-3 border-b border-[#E8DFCF] pb-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                {currentQ.topic}
              </span>
              <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#16284F] leading-snug">
                {currentQ.prompt}
              </h2>
              {currentQ.subPrompt && (
                <p className="text-xs text-[#526079] pt-0.5 leading-relaxed">
                  {currentQ.subPrompt}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handlePronounce}
              className="p-2.5 rounded-lg bg-[#FAF6EC] hover:bg-[#FFFFFF] text-[#16284F] border border-[#D9CDB8] shadow-2xs shrink-0 transition-colors cursor-pointer"
              title="Escuchar pronunciación"
              aria-label="Escuchar pronunciación en audio"
            >
              <Volume2 size={18} className="text-[#C27D16]" />
            </button>
          </div>

          {/* Modality Specific Interactive Component */}
          {renderActivityModality()}

          {/* Integrated Pedagogical Feedback from Félix (Only shown after answering) */}
          {isAnswered && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 scene-fade-in ${
                isCurrentAnswerCorrect
                  ? 'bg-[#EBF4F0] border-[#C6DFD5]'
                  : 'bg-[#FAF6EC] border-[#E2DAC8]'
              }`}
              role="alert"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#D9CDB8] shrink-0 bg-[#EFECE0]">
                <img
                  src="/assets/fox_mascot.jpg"
                  alt="Félix el zorro"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="text-xs space-y-1 flex-1">
                <div className="flex items-center gap-1.5 font-bold">
                  {isCurrentAnswerCorrect ? (
                    <span className="text-[#1F5F46] flex items-center gap-1">
                      <Check size={14} className="stroke-[3]" />
                      ¡Respuesta correcta!
                    </span>
                  ) : (
                    <span className="text-[#C27D16] flex items-center gap-1">
                      <AlertCircle size={14} />
                      Atención al detalle pedagógico:
                    </span>
                  )}
                </div>

                <p className="text-[#2E3C54] leading-relaxed">
                  {currentQ.explanation}
                </p>

                {!isCurrentAnswerCorrect && (
                  <p className="text-[#14402F] font-semibold pt-0.5">
                    Respuesta esperada: <span className="underline decoration-[#1F5F46] decoration-2">{currentQ.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer: Advance Button */}
      <footer className="mt-4">
        <button
          type="button"
          disabled={!isAnswered}
          onClick={handleNext}
          className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            isAnswered
              ? 'btn-editorial-primary text-[#0E1C38] shadow-sm'
              : 'bg-[#E2DAC8] text-[#8C7F69] border border-[#D9CDB8] cursor-not-allowed opacity-60'
          }`}
        >
          <span>{currentIndex + 1 === questions.length ? 'Finalizar práctica' : 'Siguiente ejercicio'}</span>
          <ArrowRight size={16} />
        </button>
      </footer>

      {/* Modal confirmation when leaving early */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-[#0A1426]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#C8BDA5] rounded-2xl p-5 max-w-sm w-full text-left space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-[#C27D16]">
              <AlertCircle size={20} />
              <h3 className="font-editorial font-bold text-base text-[#16284F]">
                ¿Interrumpir el ejercicio?
              </h3>
            </div>
            <p className="text-xs text-[#526079] leading-relaxed">
              Si salís ahora, las respuestas de esta sesión no se registrarán en tu bitácora de viaje.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 px-3 rounded-lg btn-editorial-paper text-xs cursor-pointer"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  navigateTo('home');
                }}
                className="py-2.5 px-3 rounded-lg bg-[#D9483B] hover:bg-[#C03A2E] text-white font-semibold text-xs cursor-pointer"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
