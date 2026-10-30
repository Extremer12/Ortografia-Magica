import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, Compass, BookOpen, Check, ArrowRight } from 'lucide-react';
import type { WorldInfo } from '../types';

export const ScreenMap: React.FC = () => {
  const { worlds, startLesson, startQuiz, navigateTo, activeWorldId } = useGame();
  const [selectedWorld, setSelectedWorld] = useState<WorldInfo | null>(null);

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-between scene-fade-in text-[#16284F]">
      
      {/* Top Cartographic Header */}
      <header className="flex items-center justify-between border-b border-[#E2DAC8] pb-3">
        <button
          onClick={() => navigateTo('home')}
          className="w-9 h-9 rounded-lg bg-[#FAF6EC] border border-[#D9CDB8] text-[#16284F] hover:bg-[#FFFFFF] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          title="Volver a la bitácora"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
            Cartografía del Idioma
          </span>
          <h1 className="text-base font-editorial font-bold text-[#16284F]">
            Mapa de los Cuatro Reinos
          </h1>
        </div>

        <div className="w-9 h-9 rounded-lg bg-[#FAF6EC] border border-[#D9CDB8] text-[#C27D16] flex items-center justify-center">
          <Compass size={18} />
        </div>
      </header>

      {/* Main Cartographic Canvas / Map territory */}
      <main className="relative my-4 p-4 sm:p-6 bg-[#F8F5EE] border border-[#D9CDB8] rounded-2xl shadow-sm overflow-hidden text-left">
        
        {/* Cartographic subtle topographic background & grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="carto-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#D9CDB8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#carto-grid)" />
          </svg>
        </div>

        {/* Winding Inked Road connecting all 4 world stations */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
          viewBox="0 0 320 680"
        >
          {/* Broad route base */}
          <path
            d="M 70 600 C 130 520, 250 490, 220 390 C 190 290, 80 250, 110 160 C 130 90, 200 80, 230 40"
            fill="none"
            stroke="#E0D5C1"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Dashed trail line */}
          <path
            d="M 70 600 C 130 520, 250 490, 220 390 C 190 290, 80 250, 110 160 C 130 90, 200 80, 230 40"
            fill="none"
            stroke="#A3937A"
            strokeWidth="2.5"
            className="cartographic-path"
          />
        </svg>

        {/* 4 Illustrated World Waypoints arranged geographically */}
        <div className="relative z-10 space-y-6 py-2">
          {worlds.map((world, idx) => {
            const isLeft = idx % 2 === 0;
            const isSelected = selectedWorld?.id === world.id || activeWorldId === world.id;

            return (
              <div
                key={world.id}
                className={`flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  onClick={() => setSelectedWorld(world)}
                  className={`w-full max-w-[240px] page-paper rounded-xl p-3 border transition-all cursor-pointer group shadow-2xs ${
                    isSelected
                      ? 'border-[#C27D16] ring-2 ring-[#C27D16]/30 bg-[#FFFDF9]'
                      : 'border-[#D9CDB8] hover:border-[#B8A88E]'
                  }`}
                >
                  {/* Miniature territory illustration with parchment frame */}
                  <div className="w-full h-24 rounded-lg overflow-hidden border border-[#D9CDB8] relative mb-2 bg-[#EFECE0]">
                    <img
                      src={world.image}
                      alt={world.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Status badge integrated cleanly */}
                    <div className="absolute top-2 left-2 bg-[#0E1C38]/85 text-[#F8F5EE] text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                      <Check size={11} className="text-[#DF9A28]" />
                      <span>{world.completedLevels}/{world.totalLevels}</span>
                    </div>
                  </div>

                  {/* Waypoint details */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7F69] block">
                      Reino {idx + 1}
                    </span>
                    <h3 className="font-editorial font-bold text-sm text-[#16284F] group-hover:text-[#1F5F46] transition-colors leading-snug">
                      {world.name}
                    </h3>
                    <p className="text-[11px] text-[#62718E] pt-0.5 truncate">
                      {world.gradeLevels}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Territory Guide Sign at base */}
        <div className="relative z-10 mt-4 p-3 rounded-lg border border-[#D9CDB8] bg-[#FDFBF7] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#C8BDA5] shrink-0 bg-[#EFECE0]">
            <img
              src="/assets/fox_mascot.jpg"
              alt="Félix"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <p className="text-xs text-[#4A5B7D] leading-snug">
            Tocá cualquier reino para consultar el temario y continuar con la siguiente expedición.
          </p>
        </div>
      </main>

      {/* World Modal Leaf (Expedition Sheet) */}
      {selectedWorld && (
        <div className="fixed inset-0 z-50 bg-[#0A1426]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#C8BDA5] rounded-2xl p-5 max-w-sm w-full shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="w-full h-36 rounded-xl overflow-hidden border border-[#D9CDB8] bg-[#EFECE0]">
              <img
                src={selectedWorld.image}
                alt={selectedWorld.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                {selectedWorld.gradeLevels}
              </span>
              <h2 className="text-xl font-editorial font-bold text-[#16284F]">
                {selectedWorld.name}
              </h2>
              <p className="text-xs text-[#526079] leading-relaxed pt-1">
                {selectedWorld.description}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#F7F4EB] border border-[#E2DAC8] text-xs flex justify-between text-[#4A5B7D] font-medium">
              <span>Estado del recorrido:</span>
              <span className="font-bold text-[#16284F]">
                {selectedWorld.completedLevels} de {selectedWorld.totalLevels} lecciones aprobadas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  startLesson(selectedWorld.id);
                  setSelectedWorld(null);
                }}
                className="py-2.5 px-3 rounded-xl btn-editorial-paper text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen size={14} className="text-[#C27D16]" />
                <span>Ver lección</span>
              </button>

              <button
                onClick={() => {
                  startQuiz(selectedWorld.id);
                  setSelectedWorld(null);
                }}
                className="py-2.5 px-3 rounded-xl btn-editorial-primary text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ir al desafío</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <button
              onClick={() => setSelectedWorld(null)}
              className="w-full text-center text-xs text-[#7E8DAA] hover:text-[#16284F] font-semibold pt-1 cursor-pointer"
            >
              Cerrar hoja de mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
