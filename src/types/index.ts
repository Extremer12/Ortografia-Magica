export type Grade = '1.°' | '2.°' | '3.°' | '4.°' | '5.°' | '6.°' | '7.°';

export type Screen = 
  | 'splash'
  | 'home'
  | 'map'
  | 'learn'
  | 'game'
  | 'results'
  | 'progress';

export interface WorldInfo {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  completedLevels: number;
  totalLevels: number;
  badgeColor: string;
  gradeLevels: string;
}

export interface CommonMistake {
  incorrect: string;
  correct: string;
  reason: string;
}

export interface LessonContent {
  id: string;
  worldId: string;
  grade: Grade;
  topic: string;
  title: string;
  subtitle: string;
  summary: string;
  explanation: {
    heading: string;
    text: string;
    rememberAlert: string;
  };
  examples: Array<{
    category: string;
    words: string[];
    hint?: string;
  }>;
  commonMistakes: CommonMistake[];
  tricks: Array<{
    title: string;
    description: string;
  }>;
}

export type ActivityType = 
  | 'multiple_choice' 
  | 'fill_word' 
  | 'syllables' 
  | 'sentence_fix';

export interface QuizQuestion {
  id: string;
  type?: ActivityType;
  grade: Grade;
  worldId: string;
  topic: string;
  difficulty: 'Fácil' | 'Medio' | 'Desafío';
  prompt: string;
  subPrompt?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  audioWord?: string;

  // Modalidad: Completar una palabra (fill_word)
  wordTemplate?: string;       // Ej: "ca___allo" o "El pájaro vuela a su n___do"
  fillOptions?: string[];      // Opciones para rellenar, ej: ["b", "v"] o ["i", "e"]

  // Modalidad: Ordenar sílabas (syllables)
  syllables?: string[];        // Sílabas desordenadas, ej: ["cle", "bi", "ta"]
  targetWord?: string;         // Palabra objetivo ordenada

  // Modalidad: Detectar y corregir error en oración (sentence_fix)
  sentence?: string;           // Oración con el error, ej: "Ayer juagava en la plaza."
  errorWord?: string;          // La palabra incorrecta, ej: "juagava"
  correctionOptions?: string[];// Alternativas de corrección, ej: ["jugaba", "jugava", "iugaba"]
}

export interface QuizResultMistake {
  prompt: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface QuizResultData {
  total: number;
  correct: number;
  errors: number;
  xpGained: number;
  newStreak: number;
  accuracy: number;
  mistakes?: QuizResultMistake[];
  isXpReduced?: boolean;
  reductionLabel?: string;
  masteryBonusGained?: number;
  newBadges?: Badge[];
  worldId?: string;
  topic?: string;
  levelUp?: boolean;
  newLevel?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'oro' | 'plata' | 'bronce';
  unlocked: boolean;
  dateUnlocked?: string;
}

export interface StudentProgress {
  name: string;
  avatar: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  stars: number;
  streakDays: number;
  lessonsCompleted: number;
  activitiesCompleted: number;
  accuracyRate: number;
  topicMastery: Array<{
    topic: string;
    percentage: number;
    color: string;
  }>;
}


