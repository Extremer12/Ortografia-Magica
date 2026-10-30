import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { calculateLevelInfo } from '../utils/storage';
import {
  ArrowLeft,
  RotateCcw,
  MapPin,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Award,
  Flame,
  Sparkles,
  ShieldAlert,
  Star,
} from 'lucide-react';

export const ScreenResults: React.FC = () => {
  const {
    lastQuizResult,
    activeProfile,
    startQuiz,
    startLesson,
    navigateTo,
    activeWorldId,
    worlds,
    selectedGrade,
  } = useGame();

  const [showMistakesReview, setShowMistakesReview] = useState(false);

  const currentWorld = worlds.find(w => w.id === activeWorldId) || worlds[0];

  const result = lastQuizResult || {
    total: 8,
    correct: 7,
    errors: 1,
    xpGained: 160,
    newStreak: 4,
    accuracy: 88,
    mistakes: [],
  };

  const errorsCount = result.errors !== undefined ? result.errors : Math.max(0, result.total - result.correct);
  const isHighAccuracy = result.correct >= Math.ceil(result.total * 0.7);

  // Level info
  const levelInfo = calculateLevelInfo(activeProfile.currentXp);

  return (
    <div className="min-h-screen pb-14 pt-4 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-between scene-fade-in text-[#16284F]">
      
      {/* Top Header */}
      <div>
        <header className="flex items-center justify-between border-b border-[#E2DAC8] pb-3">
          <button
            type="button"
            onClick={() => navigateTo('map')}
            className="w-9 h-9 rounded-lg bg-[#FAF6EC] border border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Volver al mapa"
            aria-label="Volver al mapa de expedición"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1F5F46] block">
              Bitácora de Viaje
            </span>
            <h1 className="text-sm font-editorial font-bold text-[#16284F]">
              Registro de Expedición
            </h1>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EFECE0] text-[#16284F] border border-[#D9CDB8]">
            {selectedGrade} grado
          </span>
        </header>

        {/* Main Archival Card */}
        <main className="page-paper rounded-2xl p-5 sm:p-6 border border-[#D9CDB8] space-y-4 text-left my-4 shadow-sm">
          
          {/* Level Up Celebration Banner */}
          {result.levelUp && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#DF9A28] to-[#C27D16] text-[#0E1C38] flex items-center gap-3 shadow-sm animate-bounce-subtle">
              <div className="w-10 h-10 rounded-lg bg-[#FAF6EC] text-[#C27D16] flex items-center justify-center shrink-0 font-bold shadow-2xs">
                <Star size={20} className="fill-[#C27D16]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold tracking-widest block text-[#16284F]">
                  ¡Ascenso de Nivel!
                </span>
                <h3 className="font-editorial font-bold text-sm text-[#0E1C38]">
                  {activeProfile.nickname} alcanzó la Etapa {result.newLevel || levelInfo.level}
                </h3>
              </div>
            </div>
          )}

          {/* Newly Unlocked Badges Celebration */}
          {result.newBadges && result.newBadges.length > 0 && (
            <div className="space-y-2">
              {result.newBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3.5 rounded-xl bg-[#FAF6EC] border-2 border-[#C27D16] flex items-center gap-3 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#16284F] text-[#F4CA78] flex items-center justify-center text-lg shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                      ¡Nueva insignia desbloqueada!
                    </span>
                    <h4 className="font-editorial font-bold text-sm text-[#16284F]">
                      {badge.name} ({badge.tier})
                    </h4>
                    <p className="text-[11px] text-[#526079] leading-tight">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Archival Seal & Title */}
          <div className="flex items-start gap-4 border-b border-[#E8DFCF] pb-4">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#C8BDA5] shrink-0 bg-[#EFECE0] shadow-2xs">
              <img
                src="/assets/fox_celebrating.jpg"
                alt="Félix celebrando el hito"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1 flex-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                {isHighAccuracy ? 'Hito alcanzado' : 'Práctica completada'}
              </span>
              <h2 className="text-xl font-editorial font-bold text-[#16284F] leading-tight">
                {isHighAccuracy ? '¡Lección dominada!' : 'Buen recorrido de práctica'}
              </h2>
              <p className="text-xs text-[#526079] leading-relaxed pt-0.5">
                Aventurero: <strong className="text-[#16284F]">{activeProfile.nickname}</strong> · {currentWorld.name}.
              </p>
            </div>
          </div>

          {/* Educational Assessment Metrics Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E8DAA] block">
              Resultados de la sesión:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. Aciertos */}
              <div className="p-3 rounded-xl bg-[#EBF4F0] border border-[#C6DFD5] space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#1F5F46] flex items-center gap-1">
                  <Check size={12} className="stroke-[3]" />
                  Aciertos
                </span>
                <p className="font-editorial text-2xl font-bold text-[#14402F]">
                  {result.correct} <span className="text-xs font-normal text-[#1F5F46]">/ {result.total}</span>
                </p>
                <span className="text-[10px] text-[#4A5B7D] block">
                  {result.accuracy}% precisión
                </span>
              </div>

              {/* 2. Errores */}
              <div className="p-3 rounded-xl bg-[#FDF1F0] border border-[#F5C2BE] space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#8F261C] flex items-center gap-1">
                  <X size={12} className="stroke-[3]" />
                  Errores
                </span>
                <p className="font-editorial text-2xl font-bold text-[#8F261C]">
                  {errorsCount}
                </p>
                <span className="text-[10px] text-[#4A5B7D] block">
                  {errorsCount === 0 ? '¡Ronda impecable!' : 'Para repasar'}
                </span>
              </div>

              {/* 3. XP Ganada */}
              <div className="p-3 rounded-xl bg-[#FAF6EC] border border-[#E2DAC8] space-y-0.5 relative">
                <span className="text-[10px] uppercase font-bold text-[#C27D16] flex items-center gap-1">
                  <Award size={12} />
                  XP Obtenida
                </span>
                <p className="font-editorial text-2xl font-bold text-[#C27D16]">
                  +{result.xpGained}
                </p>
                <span className="text-[10px] text-[#62718E] block leading-tight">
                  {result.isXpReduced ? (
                    <span className="text-[#8F261C] font-semibold">{result.reductionLabel}</span>
                  ) : (
                    'Puntos de aventura'
                  )}
                </span>
              </div>

              {/* 4. Racha */}
              <div className="p-3 rounded-xl bg-[#F7F4EB] border border-[#E2DAC8] space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#16284F] flex items-center gap-1">
                  <Flame size={12} className="text-[#C27D16]" />
                  Racha activa
                </span>
                <p className="font-editorial text-2xl font-bold text-[#16284F]">
                  {result.newStreak} <span className="text-xs font-normal">días</span>
                </p>
                <span className="text-[10px] text-[#62718E] block">
                  Constancia lectora
                </span>
              </div>
            </div>
          </div>

          {/* Mastery Bonus Banner (if awarded) */}
          {result.masteryBonusGained && (
            <div className="p-3 rounded-xl bg-[#EBF4F0] border border-[#A3D1BE] flex items-center gap-2.5 text-xs">
              <Sparkles size={16} className="text-[#1F5F46] shrink-0" />
              <div className="text-[#14402F]">
                <strong className="block font-bold">¡+{result.masteryBonusGained} XP Bono por Maestría!</strong>
                <span>Has demostrado dominio sobresaliente en este territorio de palabras.</span>
              </div>
            </div>
          )}

          {/* Anti-farming clarification note if XP was diminished */}
          {result.isXpReduced && (
            <div className="p-2.5 rounded-lg bg-[#FAF6EC] border border-[#E2DAC8] text-[11px] text-[#8C7F69] flex items-center gap-2">
              <ShieldAlert size={14} className="text-[#C27D16] shrink-0" />
              <span>
                Regla anti-farmeo activa: las repeticiones consecutivas de la misma actividad otorgan XP reducida para fomentar explorar nuevos temas.
              </span>
            </div>
          )}

          {/* Level Progress Indicator */}
          <div className="p-3 rounded-xl bg-[#FAF6EC] border border-[#E2DAC8] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#16284F]">
              <span className="font-bold">
                Progreso a Etapa {levelInfo.level + 1}
              </span>
              <span className="font-editorial text-xs text-[#C27D16] font-bold">
                {levelInfo.xpInCurrentLevel} / {levelInfo.xpNeededForNextLevel} XP ({levelInfo.progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E5DEC9] overflow-hidden">
              <div
                className="h-full bg-[#C27D16] transition-all duration-500 rounded-full"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Detailed Mistakes Review (if student made any errors) */}
          {errorsCount > 0 && result.mistakes && result.mistakes.length > 0 && (
            <div className="pt-2 border-t border-[#E8DFCF]">
              <button
                type="button"
                onClick={() => setShowMistakesReview(prev => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#16284F] hover:text-[#C27D16] p-2 rounded-lg bg-[#FAF6EC] border border-[#E2DAC8] cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <X size={14} className="text-[#D9483B]" />
                  Revisar los {errorsCount} ejercicios para repasar
                </span>
                {showMistakesReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showMistakesReview && (
                <div className="mt-2.5 space-y-2.5 scene-fade-in">
                  {result.mistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FDFBF7] border border-[#D9CDB8] text-xs space-y-1.5"
                    >
                      <p className="font-bold text-[#16284F]">
                        {idx + 1}. {m.prompt}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="bg-[#FDF1F0] text-[#8F261C] border border-[#F5C2BE] px-2 py-0.5 rounded">
                          Tu respuesta: <strong>{m.studentAnswer}</strong>
                        </span>
                        <span className="bg-[#EBF4F0] text-[#14402F] border border-[#C6DFD5] px-2 py-0.5 rounded">
                          Correcto: <strong>{m.correctAnswer}</strong>
                        </span>
                      </div>
                      <p className="text-[#4A5B7D] text-[11px] leading-relaxed pt-0.5 italic">
                        {m.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Narrative Guidance */}
          <div className="p-3.5 rounded-xl bg-[#FAF6EC] border border-[#E2DAC8] space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
              Consejo de Félix:
            </span>
            <p className="text-xs text-[#2E3C54] leading-relaxed">
              {isHighAccuracy
                ? '¡Excelente precisión! Tu agudeza visual te permite avanzar con solidez hacia la siguiente estación cartográfica.'
                : 'Cada duda es un trampolín de aprendizaje. Te sugiero repasar la regla y los ejemplos antes de repetir la actividad.'}
            </p>
          </div>
        </main>
      </div>

      {/* Action Footer: Repeat, Review Lesson, Return to Map */}
      <footer className="space-y-2.5 mt-2">
        <button
          type="button"
          onClick={() => startQuiz(activeWorldId)}
          className="w-full py-3.5 px-6 rounded-xl btn-editorial-primary text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <RotateCcw size={16} />
          <span>Repetir actividad (nueva ronda)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => startLesson(activeWorldId)}
            className="py-2.5 px-4 rounded-xl btn-editorial-paper text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold"
          >
            <BookOpen size={14} className="text-[#1F5F46]" />
            <span>Repasar lección</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('map')}
            className="py-2.5 px-4 rounded-xl btn-editorial-paper text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold"
          >
            <MapPin size={14} className="text-[#C27D16]" />
            <span>Volver al mapa</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
