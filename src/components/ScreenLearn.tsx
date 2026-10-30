import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getLessonForWorldAndGrade } from '../data/curriculumData';
import { ArrowLeft, Volume2, ArrowRight, AlertTriangle, Check, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export const ScreenLearn: React.FC = () => {
  const {
    selectedGrade,
    activeWorldId,
    worlds,
    startQuiz,
    navigateTo,
    activeProfile,
    markLessonCompleted,
  } = useGame();
  const [activeTab, setActiveTab] = useState<'explicacion' | 'ejemplos' | 'errores' | 'trucos'>('explicacion');

  const lesson = getLessonForWorldAndGrade(selectedGrade, activeWorldId);
  const world = worlds.find(w => w.id === lesson.worldId) || worlds[0];
  const isLessonRead = activeProfile.completedLessons.includes(lesson.id);

  const handleSpeak = (word: string) => {
    sound.playClick();
    sound.speak(word);
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-between scene-fade-in text-[#16284F]">
      
      {/* Top Editorial Book Header */}
      <div>
        <header className="flex items-center justify-between border-b border-[#E2DAC8] pb-3 mb-4">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="w-9 h-9 rounded-lg bg-[#FAF6EC] border border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Volver a la bitácora"
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1F5F46] block">
              {world.name}
            </span>
            <h1 className="text-sm font-editorial font-bold text-[#16284F]">
              Página de Aprendizaje
            </h1>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EFECE0] text-[#16284F] border border-[#D9CDB8]">
            {selectedGrade} grado
          </span>
        </header>

        {/* Main Book Page Container */}
        <article className="page-paper rounded-2xl p-5 sm:p-6 space-y-5 text-left border border-[#D9CDB8] shadow-xs">
          
          {/* Chapter Heading & Topic */}
          <div className="space-y-1 border-b border-[#E8DFCF] pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C27D16]">
              {lesson.topic}
            </span>
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#16284F] leading-tight">
              {lesson.title}
            </h2>
            <p className="text-xs text-[#526079] leading-relaxed pt-1">
              {lesson.summary}
            </p>
          </div>

          {/* Book Tabs Navigation */}
          <nav className="flex border-b border-[#E2DAC8] text-xs font-semibold overflow-x-auto gap-1" aria-label="Secciones de la lección">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('explicacion');
              }}
              className={`pb-2 px-2.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'explicacion'
                  ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                  : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
              }`}
            >
              Regla
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('ejemplos');
              }}
              className={`pb-2 px-2.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'ejemplos'
                  ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                  : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
              }`}
            >
              Ejemplos
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('errores');
              }}
              className={`pb-2 px-2.5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'errores'
                  ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                  : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
              }`}
            >
              <span>Errores frecuentes</span>
              {lesson.commonMistakes?.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#E2DAC8] text-[#16284F] text-[10px] flex items-center justify-center font-bold">
                  {lesson.commonMistakes.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('trucos');
              }}
              className={`pb-2 px-2.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'trucos'
                  ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                  : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
              }`}
            >
              Apunte de Félix
            </button>
          </nav>

          {/* Tab 1: Explicación de la regla */}
          {activeTab === 'explicacion' && (
            <div className="space-y-4 pt-1 scene-fade-in">
              <div className="space-y-2">
                <h3 className="font-editorial font-bold text-base text-[#16284F]">
                  {lesson.explanation.heading}
                </h3>
                <p className="text-sm text-[#2E3C54] leading-relaxed whitespace-pre-line font-normal">
                  {lesson.explanation.text}
                </p>
              </div>

              {/* Callout Rule (Bordered margin note) */}
              <div className="p-4 rounded-xl bg-[#F7F4EB] border-l-4 border-l-[#1F5F46] border border-[#E2DAC8] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1F5F46] block">
                  Regla de oro:
                </span>
                <p className="text-xs font-semibold text-[#14402F] leading-snug">
                  {lesson.explanation.rememberAlert}
                </p>
              </div>

              {/* Fast word inspection */}
              {lesson.examples[0] && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E8DAA] block mb-2">
                    Palabras de referencia (tocá para escuchar):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {lesson.examples[0].words.map((word, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSpeak(word)}
                        className="inline-flex items-center gap-1.5 bg-[#FAF6EC] hover:bg-[#FFFFFF] text-[#16284F] font-semibold text-xs py-1.5 px-3 rounded-lg border border-[#D9CDB8] transition-colors cursor-pointer"
                      >
                        <span>{word}</span>
                        <Volume2 size={12} className="text-[#C27D16]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Ejemplos comentados */}
          {activeTab === 'ejemplos' && (
            <div className="space-y-4 pt-1 scene-fade-in">
              <div className="space-y-1">
                <h3 className="font-editorial font-bold text-base text-[#16284F]">
                  Vocabulario de aplicación y lectura
                </h3>
                <p className="text-xs text-[#62718E]">
                  Pronunciá cada palabra y prestá atención a la sílaba o letra destacada.
                </p>
              </div>

              <div className="space-y-3">
                {lesson.examples.map((category, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F7F4EB] border border-[#E2DAC8] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#16284F]">
                        {category.category}
                      </h4>
                      {category.hint && (
                        <span className="text-[11px] text-[#7E8DAA] italic">
                          {category.hint}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {category.words.map((w, wIdx) => (
                        <button
                          key={wIdx}
                          type="button"
                          onClick={() => handleSpeak(w)}
                          className="bg-[#FAF6EC] hover:bg-[#FFFFFF] text-[#16284F] font-bold text-xs py-1.5 px-3 rounded-lg border border-[#D9CDB8] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>{w}</span>
                          <Volume2 size={12} className="text-[#C27D16]" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Errores frecuentes */}
          {activeTab === 'errores' && (
            <div className="space-y-4 pt-1 scene-fade-in">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF6EC] border border-[#E2DAC8]">
                <div className="w-8 h-8 rounded-lg bg-[#FAF6EC] border border-[#D9CDB8] text-[#C27D16] flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-editorial font-bold text-sm text-[#16284F]">
                    Dudas y tropiezos habituales
                  </h3>
                  <p className="text-xs text-[#62718E] pt-0.5">
                    Compará cómo suele escribirse con error y cuál es la solución explicada.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {lesson.commonMistakes?.map((item, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-4 rounded-xl bg-[#FDFBF7] border border-[#D9CDB8] space-y-2.5 shadow-2xs"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {/* Incorrect Side */}
                      <div className="p-2.5 rounded-lg bg-[#FDF1F0] border border-[#F5C2BE] space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-[#8F261C] flex items-center gap-1">
                          <X size={12} className="stroke-[3]" />
                          Incorrecto
                        </span>
                        <p className="font-editorial text-sm font-bold text-[#8F261C] line-through decoration-[#8F261C]/50">
                          {item.incorrect}
                        </p>
                      </div>

                      {/* Correct Side */}
                      <div className="p-2.5 rounded-lg bg-[#EBF4F0] border border-[#C6DFD5] space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-[#1F5F46] flex items-center gap-1">
                          <Check size={12} className="stroke-[3]" />
                          Forma correcta
                        </span>
                        <p className="font-editorial text-sm font-bold text-[#14402F]">
                          {item.correct}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-[#4A5B7D] bg-[#F7F4EB] p-2.5 rounded-lg border border-[#E2DAC8] space-y-0.5">
                      <span className="font-bold text-[#16284F] block">
                        Fundamento pedagógico:
                      </span>
                      <p className="leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Apunte mnemotécnico de Félix */}
          {activeTab === 'trucos' && (
            <div className="space-y-4 pt-1 scene-fade-in">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F4EB] border border-[#D9CDB8]">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#C8BDA5] shrink-0 bg-[#EFECE0]">
                  <img
                    src="/assets/fox_mascot.jpg"
                    alt="Félix el zorro"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-editorial font-bold text-sm text-[#16284F] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#C27D16]" />
                    Consejo mnemotécnico de Félix
                  </h4>
                  <p className="text-xs text-[#526079]">
                    Técnicas sencillas para recordar la regla en tus redacciones escolares.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {lesson.tricks.map((trick, tIdx) => (
                  <div key={tIdx} className="p-4 rounded-xl bg-[#FAF6EC] border border-[#E2DAC8] space-y-1">
                    <h5 className="font-editorial font-bold text-sm text-[#C27D16]">
                      {trick.title}
                    </h5>
                    <p className="text-xs text-[#2E3C54] leading-relaxed">
                      {trick.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Action Footer: Practice Button & Lesson Completion */}
      <footer className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          {isLessonRead ? (
            <span className="text-[#1F5F46] font-semibold flex items-center gap-1.5">
              <Check size={14} className="stroke-[3]" />
              <span>Lección registrada en la bitácora</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => markLessonCompleted(lesson.id)}
              className="text-[#C27D16] hover:text-[#9A600B] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles size={14} />
              <span>Completar lectura (+30 XP)</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            markLessonCompleted(lesson.id);
            startQuiz(lesson.worldId);
          }}
          className="w-full py-3.5 px-6 rounded-xl btn-editorial-primary text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
        >
          <span>Practicar este tema ({selectedGrade} grado)</span>
          <ArrowRight size={18} />
        </button>
      </footer>
    </div>
  );
};
