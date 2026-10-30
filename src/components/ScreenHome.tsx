import React from 'react';
import { useGame } from '../context/GameContext';
import { LESSONS_BY_GRADE } from '../data/curriculumData';
import { ArrowRight, Compass, MapPin } from 'lucide-react';

export const ScreenHome: React.FC = () => {
  const {
    progress,
    selectedGrade,
    worlds,
    startWorldAdventure,
    startLesson,
    navigateTo,
  } = useGame();

  const currentLesson = LESSONS_BY_GRADE[selectedGrade];
  const nextMissionWorld = worlds.find(w => w.id === currentLesson.worldId) || worlds[0];

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-xl mx-auto space-y-6 scene-fade-in text-[#16284F]">
      
      {/* Discreet Expedition Header (Not a dashboard) */}
      <div className="flex items-center justify-between text-xs border-b border-[#E2DAC8] pb-2 text-[#4A5B7D]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1F5F46]" />
          <span className="font-semibold text-[#16284F]">
            Cuaderno de {progress.name}
          </span>
          <span className="text-[#8C7F69]">·</span>
          <span>{selectedGrade} grado</span>
        </div>

        <button
          onClick={() => navigateTo('map')}
          className="text-[#C27D16] hover:text-[#9A600B] font-semibold flex items-center gap-1 transition-colors"
        >
          <MapPin size={13} />
          <span>Ver mapa</span>
        </button>
      </div>

      {/* Main Chapter Focal Point: Open Illustrated Book Leaf */}
      <section className="page-paper rounded-2xl p-5 sm:p-6 space-y-4 relative overflow-hidden">
        {/* Subtle bookmark tag */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C27D16] flex items-center gap-1.5">
            <Compass size={14} className="text-[#C27D16]" />
            Misión activa
          </span>
          <span className="text-[11px] text-[#8C7F69] bg-[#EFECE0] px-2.5 py-0.5 rounded-full font-medium">
            Estación {nextMissionWorld.completedLevels + 1} de {nextMissionWorld.totalLevels}
          </span>
        </div>

        {/* Story Illustration & Heading */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="w-full sm:w-28 h-32 sm:h-28 rounded-xl overflow-hidden border border-[#D9CDB8] shrink-0 bg-[#EFECE0] shadow-sm">
            <img
              src={nextMissionWorld.image}
              alt={nextMissionWorld.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 text-left flex-1">
            <p className="text-xs uppercase font-semibold text-[#1F5F46] tracking-wide">
              {nextMissionWorld.name}
            </p>
            <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#16284F] leading-tight">
              {currentLesson.title}
            </h2>
            <p className="text-xs text-[#526079] leading-relaxed pt-0.5">
              {currentLesson.summary}
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 border-t border-[#E8DFCF] flex items-center justify-between gap-3">
          <span className="text-xs text-[#8C7F69] font-medium hidden sm:inline">
            Aventura adaptada a {selectedGrade} grado
          </span>

          <button
            onClick={() => startLesson(nextMissionWorld.id)}
            className="w-full sm:w-auto py-3 px-6 rounded-xl btn-editorial-primary text-sm flex items-center justify-center gap-2 cursor-pointer ml-auto"
          >
            <span>Abrir lección de viaje</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* The 4 Territories of Language (Asymmetric Map-like Cards) */}
      <section className="space-y-3 text-left">
        <div className="flex items-baseline justify-between px-1">
          <div>
            <h3 className="text-lg font-editorial font-bold text-[#16284F]">
              Territorios del lenguaje
            </h3>
            <p className="text-xs text-[#62718E]">
              Cuatro comarcas para explorar y perfeccionar la escritura.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {worlds.map((world, idx) => {
            const isCurrent = world.id === nextMissionWorld.id;
            return (
              <div
                key={world.id}
                onClick={() => startWorldAdventure(world.id)}
                className={`page-paper-warm rounded-xl p-3.5 border transition-all cursor-pointer flex gap-3.5 items-center group ${
                  isCurrent
                    ? 'border-[#C27D16] ring-1 ring-[#C27D16]/30 shadow-sm'
                    : 'border-[#E2DAC8] hover:border-[#B8A88E]'
                }`}
              >
                {/* World Stamp */}
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#D9CDB8] shrink-0 bg-[#E2DAC8]">
                  <img
                    src={world.image}
                    alt={world.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* World Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7F69]">
                      Mundo 0{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-[#1F5F46]">
                      {world.completedLevels}/{world.totalLevels} lecciones
                    </span>
                  </div>

                  <h4 className="font-editorial font-bold text-sm text-[#16284F] group-hover:text-[#1F5F46] transition-colors truncate">
                    {world.name}
                  </h4>
                  <p className="text-[11px] text-[#62718E] truncate">
                    {world.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guide Note from Félix (Bookplate Quote) */}
      <div className="p-4 rounded-xl border border-[#D9CDB8] bg-[#FDFBF7]/90 text-left flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#C8BDA5] shrink-0 bg-[#EFECE0]">
          <img
            src="/assets/fox_mascot.jpg"
            alt="Félix"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="space-y-0.5 text-xs">
          <span className="font-editorial font-bold text-[#C27D16] block">
            Bitácora de Félix:
          </span>
          <p className="text-[#4A5B7D] leading-relaxed italic">
            «La ortografía es el mapa que permite que otras personas entiendan tus ideas con claridad. Cada regla es un faro en el camino.»
          </p>
        </div>
      </div>
    </div>
  );
};
