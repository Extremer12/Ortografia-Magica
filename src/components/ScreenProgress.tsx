import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { calculateLevelInfo, formatDisplayDate } from '../utils/storage';
import { ProfileModal } from './ProfileModal';
import { ConfirmModal } from './ConfirmModal';
import {
  ArrowLeft,
  Check,
  BookOpen,
  Feather,
  Crown,
  Shield,
  Eye,
  Award,
  Users,
  Flame,
  RotateCcw,
  Play,
  Star,
  Target,
} from 'lucide-react';

export const ScreenProgress: React.FC = () => {
  const {
    activeProfile,
    selectedGrade,
    badges,
    startQuiz,
    resetActiveProfileProgress,
    navigateTo,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'progreso' | 'sellos'>('progreso');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Level info calculation
  const levelInfo = calculateLevelInfo(activeProfile.currentXp);

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'feather':
        return <Feather size={20} />;
      case 'crown':
        return <Crown size={20} />;
      case 'shield':
        return <Shield size={20} />;
      case 'eye':
        return <Eye size={20} />;
      case 'book-open':
        return <BookOpen size={20} />;
      default:
        return <Award size={20} />;
    }
  };

  // Categorize topics dynamically from real activeProfile.topics
  const topicEntries = Object.entries(activeProfile.topics);

  const masteredTopics = topicEntries.filter(
    ([, stats]) => stats.attempts >= 4 && (stats.correct / stats.attempts) >= 0.75
  );

  const inProgressTopics = topicEntries.filter(
    ([, stats]) => stats.attempts > 0 && (stats.correct / stats.attempts) >= 0.5 && (stats.correct / stats.attempts) < 0.75
  );

  const needsPracticeTopics = topicEntries.filter(
    ([, stats]) => stats.attempts >= 2 && (stats.correct / stats.attempts) < 0.5
  );

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-between scene-fade-in text-[#16284F]">
      
      {/* Top Header */}
      <div>
        <header className="flex items-center justify-between border-b border-[#E2DAC8] pb-3 mb-4">
          <button
            onClick={() => navigateTo('home')}
            className="w-9 h-9 rounded-lg bg-[#FAF6EC] border border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Volver a la bitácora"
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
              Expedición Escolar
            </span>
            <h1 className="text-sm font-editorial font-bold text-[#16284F]">
              Bitácora de {activeProfile.nickname}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EFECE0] text-[#16284F] border border-[#D9CDB8] hover:bg-[#FAF6EC] flex items-center gap-1 cursor-pointer transition-colors"
            title="Gestionar perfiles"
          >
            <Users size={12} className="text-[#C27D16]" />
            <span>{selectedGrade} grado</span>
          </button>
        </header>

        {/* Student Dossier Header Leaf */}
        <section className="page-paper rounded-2xl p-5 border border-[#D9CDB8] mb-4 text-left space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#16284F] text-[#FAF6EC] font-editorial font-bold text-2xl flex items-center justify-center border border-[#0D1A33] shadow-xs shrink-0">
                {activeProfile.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-editorial font-bold text-[#16284F] truncate">
                    {activeProfile.nickname}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="text-[10px] bg-[#FAF6EC] hover:bg-[#EFECE0] text-[#62718E] px-2 py-0.5 rounded border border-[#D9CDB8] font-bold cursor-pointer transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
                <p className="text-xs text-[#62718E]">
                  Estudiante de {selectedGrade} grado de primaria
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7F69] block">
                Nivel de avance
              </span>
              <span className="font-editorial text-lg font-bold text-[#C27D16] flex items-center justify-end gap-1">
                <Star size={16} className="fill-[#C27D16]" />
                <span>Etapa {levelInfo.level}</span>
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1 pt-1 border-t border-[#E8DFCF]">
            <div className="flex items-center justify-between text-[11px] text-[#62718E]">
              <span className="font-semibold text-[#16284F]">
                Experiencia: {activeProfile.currentXp} XP totales
              </span>
              <span className="font-editorial text-[#C27D16] font-bold">
                {levelInfo.xpInCurrentLevel} / {levelInfo.xpNeededForNextLevel} XP para Etapa {levelInfo.level + 1}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E5DEC9] overflow-hidden">
              <div
                className="h-full bg-[#C27D16] rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8DFCF] text-center">
            <div className="p-2 rounded-lg bg-[#FAF6EC] border border-[#E2DAC8]">
              <span className="text-[10px] text-[#8C7F69] uppercase font-bold block">
                Racha activa
              </span>
              <span className="font-editorial text-base font-bold text-[#16284F] flex items-center justify-center gap-1">
                <Flame size={14} className="text-[#C27D16]" />
                {activeProfile.streakDays} días
              </span>
              <span className="text-[9px] text-[#7E8DAA] block">
                Última: {formatDisplayDate(activeProfile.lastActiveDate)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#FAF6EC] border border-[#E2DAC8]">
              <span className="text-[10px] text-[#8C7F69] uppercase font-bold block">
                Actividades
              </span>
              <span className="font-editorial text-base font-bold text-[#16284F]">
                {activeProfile.activitiesCompleted}
              </span>
              <span className="text-[9px] text-[#7E8DAA] block">
                {activeProfile.completedLessons.length} lecciones
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#FAF6EC] border border-[#E2DAC8]">
              <span className="text-[10px] text-[#8C7F69] uppercase font-bold block">
                Precisión real
              </span>
              <span className="font-editorial text-base font-bold text-[#1F5F46]">
                {activeProfile.totalAttempts > 0
                  ? Math.round((activeProfile.totalCorrect / activeProfile.totalAttempts) * 100)
                  : 0}
                %
              </span>
              <span className="text-[9px] text-[#7E8DAA] block">
                {activeProfile.totalCorrect}/{activeProfile.totalAttempts} aciertos
              </span>
            </div>
          </div>
        </section>

        {/* Section Switcher Tabs */}
        <nav className="flex border-b border-[#E2DAC8] text-xs font-semibold mb-4 gap-1">
          <button
            onClick={() => setActiveTab('progreso')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'progreso'
                ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
            }`}
          >
            Mi Progreso (Temas)
          </button>

          <button
            onClick={() => setActiveTab('sellos')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sellos'
                ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
            }`}
          >
            Insignias ({badges.filter(b => b.unlocked).length}/{badges.length})
          </button>
        </nav>

        {/* TAB 1: MI PROGRESO (Temas dominados, en exploración, y necesitando práctica) */}
        {activeTab === 'progreso' && (
          <div className="space-y-4 text-left scene-fade-in">
            
            {/* Empty state if student has not played yet */}
            {activeProfile.activitiesCompleted === 0 && (
              <div className="p-4 rounded-xl bg-[#FAF6EC] border border-[#E2DAC8] text-center space-y-2">
                <Target size={24} className="text-[#C27D16] mx-auto" />
                <h4 className="font-editorial font-bold text-sm text-[#16284F]">
                  ¡Comenzá tu primera expedición ortográfica!
                </h4>
                <p className="text-xs text-[#526079] max-w-sm mx-auto leading-relaxed">
                  Resolvé las actividades en los mundos de letras para registrar aquí tus temas dominados y áreas para repasar.
                </p>
                <button
                  type="button"
                  onClick={() => startQuiz()}
                  className="py-2 px-4 rounded-lg btn-editorial-primary text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-1"
                >
                  <Play size={13} />
                  <span>Empezar primera práctica</span>
                </button>
              </div>
            )}

            {/* Temas que necesitan más práctica (priority warning) */}
            {needsPracticeTopics.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B9382C]" />
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#8F261C]">
                    Temas que necesitan más práctica ({needsPracticeTopics.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {needsPracticeTopics.map(([topic, stats]) => {
                    const pct = Math.round((stats.correct / stats.attempts) * 100);
                    return (
                      <div
                        key={topic}
                        className="p-3.5 rounded-xl bg-[#FDF1F0] border border-[#F5C2BE] flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-editorial font-bold text-sm text-[#8F261C] truncate">
                            {topic}
                          </h4>
                          <p className="text-xs text-[#5C1610]">
                            {stats.correct} de {stats.attempts} aciertos ({pct}% precisión)
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => startQuiz()}
                          className="px-3 py-1.5 rounded-lg bg-[#8F261C] hover:bg-[#721A12] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Play size={12} />
                          <span>Practicar</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Temas Dominados */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F5F46]" />
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#1F5F46]">
                  Temas dominados con solidez ({masteredTopics.length})
                </h3>
              </div>

              {masteredTopics.length > 0 ? (
                <div className="space-y-2">
                  {masteredTopics.map(([topic, stats]) => {
                    const pct = Math.round((stats.correct / stats.attempts) * 100);
                    return (
                      <div
                        key={topic}
                        className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#D9CDB8] flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-editorial font-bold text-sm text-[#16284F]">
                            {topic}
                          </h4>
                          <p className="text-xs text-[#62718E] pt-0.5">
                            {stats.correct} aciertos en {stats.attempts} ejercicios ({pct}% precisión) · Última: {formatDisplayDate(stats.lastPracticed)}
                          </p>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-[#EBF4F0] text-[#1F5F46] flex items-center justify-center shrink-0 border border-[#C6DFD5]">
                          <Check size={14} className="stroke-[3]" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E2DAC8] text-xs text-[#62718E]">
                  Resolvé al menos 4 ejercicios con 75% o más de precisión en un tema para consolidarlo como dominado.
                </div>
              )}
            </div>

            {/* En Exploración Activa */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C27D16]" />
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#C27D16]">
                  En exploración activa ({inProgressTopics.length})
                </h3>
              </div>

              {inProgressTopics.length > 0 ? (
                <div className="space-y-2">
                  {inProgressTopics.map(([topic, stats]) => {
                    const pct = Math.round((stats.correct / stats.attempts) * 100);
                    return (
                      <div
                        key={topic}
                        className="p-3.5 rounded-xl bg-[#FAF6EC] border border-[#E8BF73]/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-editorial font-bold text-sm text-[#16284F]">
                            {topic}
                          </h4>
                          <span className="text-[11px] font-bold text-[#C27D16] bg-[#FDF6E9] px-2 py-0.5 rounded border border-[#E8BF73]/50">
                            {pct}% de dominio
                          </span>
                        </div>
                        <p className="text-xs text-[#526079]">
                          {stats.correct} aciertos de {stats.attempts} preguntas respondidas.
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-[#E8DFCF] overflow-hidden">
                          <div
                            className="h-full bg-[#C27D16] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E2DAC8] text-xs text-[#62718E]">
                  A medida que practiques diferentes lecciones, tus progresos aparecerán en esta sección.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SELLOS E INSIGNIAS */}
        {activeTab === 'sellos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left scene-fade-in">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  badge.unlocked
                    ? 'page-paper border-[#D9CDB8] shadow-2xs'
                    : 'bg-[#F7F4EB] border-[#E2DAC8] opacity-65'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  badge.unlocked
                    ? 'bg-[#FAF6EC] border-[#C8BDA5] text-[#C27D16]'
                    : 'bg-[#EFECE0] border-[#D9CDB8] text-[#8C7F69]'
                }`}>
                  {getBadgeIcon(badge.icon)}
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-editorial font-bold text-sm text-[#16284F] truncate">
                      {badge.name}
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7F69]">
                      {badge.tier}
                    </span>
                  </div>
                  <p className="text-xs text-[#526079] leading-snug">
                    {badge.description}
                  </p>
                  {badge.unlocked && badge.dateUnlocked ? (
                    <span className="text-[10px] text-[#1F5F46] font-semibold block pt-1">
                      ✓ Desbloqueado: {badge.dateUnlocked}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#8C7F69] italic block pt-1">
                      Pendiente de completar criterio
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide signoff & simple reset */}
      <footer className="mt-5 space-y-3">
        <div className="p-3 rounded-lg border border-[#E2DAC8] bg-[#FAF6EC] text-xs text-[#62718E] flex items-center justify-between gap-2">
          <span>El progreso se guarda automáticamente en este dispositivo.</span>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-xs font-bold text-[#8F261C] hover:text-[#5C1610] inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reiniciar</span>
          </button>
        </div>
      </footer>

      {/* Profile Management Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={confirmReset}
        title="¿Reiniciar progreso?"
        message={`Se restablecerán a cero los puntos de XP, nivel, racha, estrellas y lecciones completadas del perfil de ${activeProfile.nickname}.`}
        confirmLabel="Sí, reiniciar progreso"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          resetActiveProfileProgress();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};
