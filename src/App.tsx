import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ScreenSplash } from './components/ScreenSplash';
import { ScreenHome } from './components/ScreenHome';
import { ScreenMap } from './components/ScreenMap';
import { ScreenLearn } from './components/ScreenLearn';
import { ScreenGame } from './components/ScreenGame';
import { ScreenResults } from './components/ScreenResults';
import { ScreenProgress } from './components/ScreenProgress';

const AppContent: React.FC = () => {
  const { currentScreen } = useGame();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <ScreenSplash />;
      case 'home':
        return (
          <>
            <Header />
            <ScreenHome />
            <BottomNav />
          </>
        );
      case 'map':
        return (
          <>
            <Header />
            <ScreenMap />
            <BottomNav />
          </>
        );
      case 'learn':
        return (
          <>
            <Header />
            <ScreenLearn />
            <BottomNav />
          </>
        );
      case 'game':
        return <ScreenGame />;
      case 'results':
        return <ScreenResults />;
      case 'progress':
        return (
          <>
            <Header />
            <ScreenProgress />
            <BottomNav />
          </>
        );
      default:
        return <ScreenSplash />;
    }
  };

  const getScreenBg = () => {
    switch (currentScreen) {
      case 'splash':
        return 'bg-[#0E1C38]';
      default:
        return 'bg-[#F7F4EB]';
    }
  };

  return (
    <div
      className={`min-h-screen w-full ${getScreenBg()} text-[#16284F] overflow-x-hidden relative flex flex-col`}
    >
      {renderScreen()}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
