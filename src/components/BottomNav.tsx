import React from 'react';
import { useGame } from '../context/GameContext';
import type { Screen } from '../types';
import { Compass, Map, BookOpen, PenTool, Bookmark } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo, startQuiz } = useGame();

  const navItems: Array<{ screen: Screen; label: string; icon: React.FC<{ size?: number; className?: string }> }> = [
    { screen: 'home', label: 'Inicio', icon: Compass },
    { screen: 'map', label: 'Mapa', icon: Map },
    { screen: 'learn', label: 'Aprender', icon: BookOpen },
    { screen: 'game', label: 'Practicar', icon: PenTool },
    { screen: 'progress', label: 'Bitácora', icon: Bookmark },
  ];

  const handleNavClick = (screen: Screen) => {
    if (screen === 'game') {
      startQuiz();
    } else {
      navigateTo(screen);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xs border-t border-[#E2DAC8] py-1.5 px-3 shadow-md pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen;

          return (
            <button
              key={item.screen}
              onClick={() => handleNavClick(item.screen)}
              className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#16284F]'
                  : 'text-[#7E8DAA] hover:text-[#16284F]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 bg-[#C27D16] rounded-full" />
              )}
              
              <div className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-[#FAF6EC] text-[#C27D16]' : ''
              }`}>
                <Icon size={18} />
              </div>

              <span className={`text-[10px] tracking-tight font-semibold mt-0.5 ${
                isActive ? 'text-[#16284F] font-bold' : 'text-[#7E8DAA]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
