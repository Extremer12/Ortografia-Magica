import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type {
  Grade,
  Screen,
  WorldInfo,
  Badge,
  StudentProgress,
  QuizQuestion,
  QuizResultData,
  QuizResultMistake,
} from '../types';
import {
  WORLDS,
  BADGES,
  QUIZ_QUESTIONS,
  LESSONS_BY_GRADE,
} from '../data/curriculumData';
import { sound } from '../utils/sound';
import {
  type UserProfile,
  type AppStorageData,
  loadAppData,
  saveAppData,
  createDefaultProfile,
  getLocalDateString,
  getYesterdayDateString,
  calculateLevelInfo,
  calculateXpReward,
  evaluateBadges,
  generateExportJSON,
  parseAndValidateImportJSON,
} from '../utils/storage';

export type { QuizResultData };

interface GameContextType {
  currentScreen: Screen;
  selectedGrade: Grade;
  progress: StudentProgress;
  worlds: WorldInfo[];
  badges: Badge[];
  activeWorldId: string;
  activeQuestions: QuizQuestion[];
  lastQuizResult: QuizResultData | null;
  soundEnabled: boolean;
  deviceFrame: 'mobile' | 'tablet' | 'desktop';
  
  // Multi-profile state and methods
  activeProfile: UserProfile;
  allProfiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  createProfile: (nickname: string, grade: Grade, avatar: string) => UserProfile;
  updateActiveProfile: (updates: Partial<UserProfile>) => void;
  deleteProfile: (profileId: string) => boolean;
  resetActiveProfileProgress: () => void;
  markLessonCompleted: (lessonId: string) => void;
  exportProgressJSON: (singleProfile?: boolean) => string;
  importProgressJSON: (jsonText: string) => { success: boolean; error?: string };

  // Core navigation and gameplay
  navigateTo: (screen: Screen) => void;
  setGrade: (grade: Grade) => void;
  setActiveWorldId: (worldId: string) => void;
  startWorldAdventure: (worldId: string) => void;
  startLesson: (worldId?: string) => void;
  startQuiz: (worldId?: string) => void;
  finishQuiz: (correctCount: number, totalCount: number, mistakes?: QuizResultMistake[]) => void;
  toggleSound: () => void;
  setDeviceFrame: (frame: 'mobile' | 'tablet' | 'desktop') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareQuestionOptions(q: QuizQuestion): QuizQuestion {
  return {
    ...q,
    options: q.options ? shuffleArray(q.options) : q.options,
    fillOptions: q.fillOptions ? shuffleArray(q.fillOptions) : q.fillOptions,
    correctionOptions: q.correctionOptions ? shuffleArray(q.correctionOptions) : q.correctionOptions,
  };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent storage on initialization
  const [appData, setAppData] = useState<AppStorageData>(() => loadAppData());
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [activeWorldId, setActiveWorldId] = useState<string>('castillo');
  const [lastQuizResult, setLastQuizResult] = useState<QuizResultData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Active profile reference
  const activeProfile = useMemo<UserProfile>(() => {
    const found = appData.profiles.find(p => p.id === appData.activeProfileId);
    return found || appData.profiles[0] || createDefaultProfile('Luna', '3.°', '🦊');
  }, [appData]);

  // Current selected grade tracks activeProfile.grade
  const selectedGrade = activeProfile.grade;

  // Persist storage whenever appData changes
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Helper: Filter questions matching grade and optional world, with shuffled options
  const getQuestionsForGrade = useCallback((grade: Grade, worldId?: string): QuizQuestion[] => {
    const gradeQuestions = QUIZ_QUESTIONS.filter(q => q.grade === grade);
    const defaultWorldForGrade = LESSONS_BY_GRADE[grade]?.worldId;

    // If a specific world is requested and differs from the grade's default world, prioritize that world's topic
    if (worldId && worldId !== defaultWorldForGrade) {
      const worldAndGrade = gradeQuestions.filter(q => q.worldId === worldId);
      if (worldAndGrade.length >= 5) {
        return worldAndGrade.slice(0, 10).map(prepareQuestionOptions);
      }
      const otherWorldQuestions = QUIZ_QUESTIONS.filter(q => q.worldId === worldId && q.grade !== grade);
      const combined = [...worldAndGrade, ...otherWorldQuestions].slice(0, 10);
      if (combined.length > 0) {
        return combined.map(prepareQuestionOptions);
      }
    }

    const baseList = gradeQuestions.length > 0 ? gradeQuestions.slice(0, 10) : QUIZ_QUESTIONS.slice(0, 8);
    return baseList.map(prepareQuestionOptions);
  }, []);

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(() =>
    getQuestionsForGrade(activeProfile.grade, 'castillo')
  );

  // Compute worlds dynamically reflecting active profile levels
  const worlds = useMemo<WorldInfo[]>(() => {
    return WORLDS.map(w => ({
      ...w,
      completedLevels: Math.min(w.totalLevels, activeProfile.worldLevels[w.id] || 0),
    }));
  }, [activeProfile.worldLevels]);

  // Compute badges dynamically reflecting active profile unlocks
  const badges = useMemo<Badge[]>(() => {
    return BADGES.map(b => {
      const unlockInfo = activeProfile.unlockedBadges[b.id];
      return {
        ...b,
        unlocked: Boolean(unlockInfo),
        dateUnlocked: unlockInfo ? unlockInfo.unlockedAt : undefined,
      };
    });
  }, [activeProfile.unlockedBadges]);

  // Derive student progress statistics for legacy components
  const progress = useMemo<StudentProgress>(() => {
    const totalAttempts = activeProfile.totalAttempts;
    const totalCorrect = activeProfile.totalCorrect;
    const accuracyRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    const topicEntries = Object.entries(activeProfile.topics);
    let topicMastery: StudentProgress['topicMastery'];

    if (topicEntries.length > 0) {
      const palette = ['#1F5F46', '#C27D16', '#16284F', '#D9483B', '#5A3E91', '#0E7490'];
      topicMastery = topicEntries.map(([topic, stats], idx) => {
        const pct = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
        return {
          topic,
          percentage: pct,
          color: palette[idx % palette.length],
        };
      });
    } else {
      // Default curriculum topics initialized at 0%
      topicMastery = [
        { topic: 'B y V', percentage: 0, color: '#1F5F46' },
        { topic: 'Tildes y acentos', percentage: 0, color: '#C27D16' },
        { topic: 'Signos de puntuación', percentage: 0, color: '#16284F' },
        { topic: 'C, S y Z', percentage: 0, color: '#D9483B' },
      ];
    }

    return {
      name: activeProfile.nickname,
      avatar: activeProfile.avatar,
      level: activeProfile.level,
      currentXp: activeProfile.currentXp,
      nextLevelXp: activeProfile.nextLevelXp,
      stars: activeProfile.stars,
      streakDays: activeProfile.streakDays,
      lessonsCompleted: activeProfile.completedLessons.length,
      activitiesCompleted: activeProfile.activitiesCompleted,
      accuracyRate,
      topicMastery,
    };
  }, [activeProfile]);

  // Navigation helper
  const navigateTo = (screen: Screen) => {
    sound.playClick();
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Grade switcher updates the active profile
  const setGrade = (grade: Grade) => {
    sound.playClick();
    const defaultWorld = LESSONS_BY_GRADE[grade]?.worldId || activeWorldId;
    setActiveWorldId(defaultWorld);
    setAppData(prev => {
      const updatedProfiles = prev.profiles.map(p => {
        if (p.id === prev.activeProfileId) {
          return { ...p, grade };
        }
        return p;
      });
      return {
        ...prev,
        profiles: updatedProfiles,
      };
    });
    setActiveQuestions(getQuestionsForGrade(grade, defaultWorld));
  };

  // Multi-profile methods
  const switchProfile = (profileId: string) => {
    const target = appData.profiles.find(p => p.id === profileId);
    if (!target) return;
    sound.playClick();
    const defaultWorld = LESSONS_BY_GRADE[target.grade]?.worldId || activeWorldId;
    setActiveWorldId(defaultWorld);
    setAppData(prev => ({
      ...prev,
      activeProfileId: profileId,
    }));
    setActiveQuestions(getQuestionsForGrade(target.grade, defaultWorld));
  };

  const createProfile = (nickname: string, grade: Grade, avatar: string): UserProfile => {
    const newProf = createDefaultProfile(nickname, grade, avatar);
    sound.playClick();
    const defaultWorld = LESSONS_BY_GRADE[grade]?.worldId || activeWorldId;
    setActiveWorldId(defaultWorld);
    setAppData(prev => ({
      ...prev,
      activeProfileId: newProf.id,
      profiles: [...prev.profiles, newProf],
    }));
    setActiveQuestions(getQuestionsForGrade(grade, defaultWorld));
    return newProf;
  };

  const updateActiveProfile = (updates: Partial<UserProfile>) => {
    setAppData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => {
        if (p.id === prev.activeProfileId) {
          return { ...p, ...updates };
        }
        return p;
      }),
    }));
  };

  const deleteProfile = (profileId: string): boolean => {
    if (appData.profiles.length <= 1) {
      return false; // Can't delete the only profile
    }
    sound.playClick();
    setAppData(prev => {
      const filtered = prev.profiles.filter(p => p.id !== profileId);
      const nextActiveId = prev.activeProfileId === profileId ? filtered[0].id : prev.activeProfileId;
      return {
        ...prev,
        activeProfileId: nextActiveId,
        profiles: filtered,
      };
    });
    return true;
  };

  const resetActiveProfileProgress = () => {
    sound.playClick();
    const today = getLocalDateString();
    setAppData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => {
        if (p.id === prev.activeProfileId) {
          return {
            ...p,
            level: 1,
            currentXp: 0,
            nextLevelXp: 200,
            stars: 0,
            streakDays: 1,
            lastStreakDate: today,
            lastActiveDate: today,
            completedLessons: [],
            worldLevels: { bosque: 0, castillo: 0, montana: 0, biblioteca: 0 },
            totalAttempts: 0,
            totalCorrect: 0,
            activitiesCompleted: 0,
            dailyActivityCounts: {},
            topics: {},
            unlockedBadges: {},
          };
        }
        return p;
      }),
    }));
  };

  const markLessonCompleted = (lessonId: string) => {
    if (activeProfile.completedLessons.includes(lessonId)) return;
    const updatedLessons = [...activeProfile.completedLessons, lessonId];
    // Reward +30 XP for reading a new lesson
    const newXp = activeProfile.currentXp + 30;
    const levelInfo = calculateLevelInfo(newXp);
    
    updateActiveProfile({
      completedLessons: updatedLessons,
      currentXp: newXp,
      level: levelInfo.level,
      nextLevelXp: levelInfo.nextLevelXp,
      lastActiveDate: getLocalDateString(),
    });
    sound.playCorrect();
  };

  const exportProgressJSON = (singleProfile: boolean = false): string => {
    return generateExportJSON(appData, singleProfile ? activeProfile.id : undefined);
  };

  const importProgressJSON = (jsonText: string): { success: boolean; error?: string } => {
    const result = parseAndValidateImportJSON(jsonText);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    sound.playFanfare();
    setAppData(prev => {
      // Merge or replace profiles
      const importedMap = new Map<string, UserProfile>();
      result.importedProfiles.forEach(p => importedMap.set(p.id, p));

      // Keep profiles not in import
      const existingKept = prev.profiles.filter(p => !importedMap.has(p.id));
      const finalProfiles = [...existingKept, ...result.importedProfiles];
      const finalActiveId = result.activeId || finalProfiles[0].id;

      return {
        ...prev,
        activeProfileId: finalActiveId,
        profiles: finalProfiles,
      };
    });

    return { success: true };
  };

  // World and Adventure actions
  const startWorldAdventure = (worldId: string) => {
    sound.playClick();
    setActiveWorldId(worldId);
    setActiveQuestions(getQuestionsForGrade(selectedGrade, worldId));
    setCurrentScreen('map');
  };

  const startLesson = (worldId?: string) => {
    sound.playClick();
    if (worldId) {
      setActiveWorldId(worldId);
    }
    setCurrentScreen('learn');
  };

  const startQuiz = (worldId?: string) => {
    sound.playClick();
    const targetWorld = worldId || activeWorldId;
    setActiveWorldId(targetWorld);
    const questions = getQuestionsForGrade(selectedGrade, targetWorld);
    setActiveQuestions(questions);
    setCurrentScreen('game');
  };

  // Completion logic with Anti-farming, Verifiable Badges, Topic Mastery Bonus, and Streaks
  const finishQuiz = (
    correctCount: number,
    totalCount: number,
    mistakes?: QuizResultMistake[]
  ) => {
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    // Determine target topic
    const activeTopic = activeQuestions[0]?.topic || 'Ortografía general';

    // Anti-farming check for repeated activities today
    const repKey = `${today}:${activeWorldId}`;
    const todayRepetitions = activeProfile.dailyActivityCounts[repKey] || 0;
    const { xpEarned, isReduced: isXpReduced, reductionLabel } = calculateXpReward(
      correctCount,
      totalCount,
      todayRepetitions
    );

    // Topic mastery check
    const currentTopicData = activeProfile.topics[activeTopic] || {
      attempts: 0,
      correct: 0,
      lastPracticed: today,
      masteryBonusAwarded: false,
    };
    const updatedTopicAttempts = currentTopicData.attempts + totalCount;
    const updatedTopicCorrect = currentTopicData.correct + correctCount;
    const topicAccuracy = updatedTopicAttempts > 0 ? (updatedTopicCorrect / updatedTopicAttempts) : 0;

    let masteryBonusGained = 0;
    let masteryBonusAwarded = currentTopicData.masteryBonusAwarded;
    // Award +100 XP once upon achieving >= 80% with at least 6 questions on the topic
    if (updatedTopicAttempts >= 6 && topicAccuracy >= 0.8 && !masteryBonusAwarded) {
      masteryBonusGained = 100;
      masteryBonusAwarded = true;
    }

    const totalXpToAdd = xpEarned + masteryBonusGained;
    const newTotalXp = activeProfile.currentXp + totalXpToAdd;
    const levelInfo = calculateLevelInfo(newTotalXp);
    const levelUp = levelInfo.level > activeProfile.level;

    // Streak logic
    let newStreak = activeProfile.streakDays;
    if (activeProfile.lastStreakDate === today) {
      // already counted today
    } else if (activeProfile.lastStreakDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    // World level progress
    const isHighAccuracy = totalCount > 0 && correctCount >= Math.ceil(totalCount * 0.7);
    const currentWorldLevel = activeProfile.worldLevels[activeWorldId] || 0;
    const nextWorldLevel = isHighAccuracy ? Math.min(10, currentWorldLevel + 1) : currentWorldLevel;

    // Prepare updated profile copy
    const updatedProfile: UserProfile = {
      ...activeProfile,
      lastActiveDate: today,
      lastStreakDate: today,
      streakDays: newStreak,
      currentXp: newTotalXp,
      level: levelInfo.level,
      nextLevelXp: levelInfo.nextLevelXp,
      stars: activeProfile.stars + (isHighAccuracy ? 3 : 1),
      totalAttempts: activeProfile.totalAttempts + totalCount,
      totalCorrect: activeProfile.totalCorrect + correctCount,
      activitiesCompleted: activeProfile.activitiesCompleted + 1,
      dailyActivityCounts: {
        ...activeProfile.dailyActivityCounts,
        [repKey]: todayRepetitions + 1,
      },
      topics: {
        ...activeProfile.topics,
        [activeTopic]: {
          attempts: updatedTopicAttempts,
          correct: updatedTopicCorrect,
          lastPracticed: today,
          masteryBonusAwarded,
        },
      },
      worldLevels: {
        ...activeProfile.worldLevels,
        [activeWorldId]: nextWorldLevel,
      },
    };

    // Evaluate verifiable badges
    const errorsCount = Math.max(0, totalCount - correctCount);
    const newBadges = evaluateBadges(updatedProfile, {
      worldId: activeWorldId,
      topic: activeTopic,
      correctCount,
      totalCount,
      mistakesCount: errorsCount,
      activityType: activeQuestions[0]?.type,
    });

    // Save profile into state & localStorage
    setAppData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => (p.id === updatedProfile.id ? updatedProfile : p)),
    }));

    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    const resultData: QuizResultData = {
      total: totalCount,
      correct: correctCount,
      errors: errorsCount,
      xpGained: totalXpToAdd,
      newStreak,
      accuracy,
      mistakes: mistakes || [],
      isXpReduced,
      reductionLabel,
      masteryBonusGained: masteryBonusGained > 0 ? masteryBonusGained : undefined,
      newBadges: newBadges.length > 0 ? newBadges : undefined,
      worldId: activeWorldId,
      topic: activeTopic,
      levelUp,
      newLevel: levelInfo.level,
    };

    setLastQuizResult(resultData);
    sound.playFanfare();
    setCurrentScreen('results');
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sound.setSoundEnabled(newState);
    if (newState) sound.playClick();
  };

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        selectedGrade,
        progress,
        worlds,
        badges,
        activeWorldId,
        activeQuestions,
        lastQuizResult,
        soundEnabled,
        deviceFrame,
        activeProfile,
        allProfiles: appData.profiles,
        switchProfile,
        createProfile,
        updateActiveProfile,
        deleteProfile,
        resetActiveProfileProgress,
        markLessonCompleted,
        exportProgressJSON,
        importProgressJSON,
        navigateTo,
        setGrade,
        setActiveWorldId,
        startWorldAdventure,
        startLesson,
        startQuiz,
        finishQuiz,
        toggleSound,
        setDeviceFrame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
