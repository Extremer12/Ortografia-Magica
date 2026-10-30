import type { Grade, Badge, ActivityType } from '../types';
import { BADGES } from '../data/curriculumData';

export const STORAGE_KEY = 'ortografia_magica_v1';
export const STORAGE_VERSION = 1;

export interface TopicProgress {
  attempts: number;
  correct: number;
  lastPracticed: string; // YYYY-MM-DD
  masteryBonusAwarded?: boolean;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  grade: Grade;
  createdAt: string;
  lastActiveDate: string; // YYYY-MM-DD
  level: number;
  currentXp: number;
  nextLevelXp: number;
  stars: number;
  streakDays: number;
  lastStreakDate: string; // YYYY-MM-DD
  completedLessons: string[];
  worldLevels: Record<string, number>;
  totalAttempts: number;
  totalCorrect: number;
  activitiesCompleted: number;
  dailyActivityCounts: Record<string, number>; // key: "YYYY-MM-DD:worldId"
  topics: Record<string, TopicProgress>;
  unlockedBadges: Record<string, { unlockedAt: string }>;
}

export interface AppStorageData {
  version: number;
  activeProfileId: string;
  profiles: UserProfile[];
  updatedAt: string;
}

export const AVATAR_OPTIONS = [
  { id: 'fox', emoji: '🦊', name: 'Félix el Zorro', role: 'Explorador' },
  { id: 'owl', emoji: '🦉', name: 'Olivia la Lechuza', role: 'Sabia' },
  { id: 'lion', emoji: '🦁', name: 'Leo el Puma', role: 'Valiente' },
  { id: 'cat', emoji: '🐱', name: 'Mía la Gata', role: 'Curiosa' },
  { id: 'bear', emoji: '🐻', name: 'Simón el Oso', role: 'Constante' },
  { id: 'rabbit', emoji: '🐰', name: 'Clara la Liebre', role: 'Ágil' },
  { id: 'dolphin', emoji: '🐬', name: 'Dante el Delfín', role: 'Alegre' },
  { id: 'unicorn', emoji: '🦄', name: 'Sol el Unicornio', role: 'Mágico' },
  { id: 'eagle', emoji: '🦅', name: 'Cóndor Tomás', role: 'Andino' },
  { id: 'koala', emoji: '🐨', name: 'Mateo el Koala', role: 'Tranquilo' },
];

/**
 * Helper to get YYYY-MM-DD local date string
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to get yesterday's YYYY-MM-DD local date string
 */
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

/**
 * Format a date string for display (e.g. "Hoy", "Ayer", "28 oct 2026")
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  if (dateStr === today) return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';

  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${months[monthIdx] || ''} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate level and thresholds from total XP
 * Smooth progressive curve: Level N requires (200 + (N-1)*150) cumulative XP
 */
export function calculateLevelInfo(currentXp: number): {
  level: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
} {
  let level = 1;
  let prevThreshold = 0;
  let nextThreshold = 200; // Level 1 -> 2 requires 200 XP

  while (currentXp >= nextThreshold && level < 50) {
    level += 1;
    prevThreshold = nextThreshold;
    nextThreshold = prevThreshold + 200 + (level - 1) * 150;
  }

  const xpInCurrentLevel = Math.max(0, currentXp - prevThreshold);
  const xpNeededForNextLevel = Math.max(1, nextThreshold - prevThreshold);
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    level,
    currentLevelBaseXp: prevThreshold,
    nextLevelXp: nextThreshold,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}

/**
 * Anti-farming reward rule:
 * Evita que repetir infinitamente una actividad permita acumular recompensas sin límite.
 * 1.ª vez hoy: 100% de XP
 * 2.ª vez hoy: 60% de XP
 * 3.ª vez hoy: 30% de XP
 * 4.ª+ vez hoy: 10% de XP simbólica (mínimo 5 XP)
 */
export function calculateXpReward(
  correctCount: number,
  _totalCount: number,
  todayRepetitions: number
): {
  baseXp: number;
  xpEarned: number;
  multiplier: number;
  isReduced: boolean;
  reductionLabel?: string;
} {
  const baseXp = correctCount * 20 + 20; // +20 completion bonus

  let multiplier = 1.0;
  let reductionLabel: string | undefined = undefined;

  if (todayRepetitions === 1) {
    multiplier = 0.6;
    reductionLabel = 'Práctica reiterada hoy (-40%)';
  } else if (todayRepetitions === 2) {
    multiplier = 0.3;
    reductionLabel = 'Práctica reiterada hoy (-70%)';
  } else if (todayRepetitions >= 3) {
    multiplier = 0.1;
    reductionLabel = 'Límite diario de repetición alcanzado';
  }

  const calculated = Math.round(baseXp * multiplier);
  const xpEarned = Math.max(todayRepetitions >= 3 ? 5 : 10, calculated);

  return {
    baseXp,
    xpEarned,
    multiplier,
    isReduced: multiplier < 1.0,
    reductionLabel,
  };
}

/**
 * Create default initial profile
 */
export function createDefaultProfile(
  nickname: string = 'Luna',
  grade: Grade = '3.°',
  avatar: string = '🦊'
): UserProfile {
  const today = getLocalDateString();
  const id = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  return {
    id,
    nickname: nickname.trim() || 'Estudiante',
    avatar: avatar || '🦊',
    grade,
    createdAt: new Date().toISOString(),
    lastActiveDate: today,
    level: 1,
    currentXp: 0,
    nextLevelXp: 200,
    stars: 0,
    streakDays: 1,
    lastStreakDate: today,
    completedLessons: [],
    worldLevels: {
      bosque: 0,
      castillo: 0,
      montana: 0,
      biblioteca: 0,
    },
    totalAttempts: 0,
    totalCorrect: 0,
    activitiesCompleted: 0,
    dailyActivityCounts: {},
    topics: {},
    unlockedBadges: {},
  };
}

/**
 * Safely validate and sanitize a user profile from unknown storage
 */
export function validateProfile(raw: any): UserProfile {
  const defaultProf = createDefaultProfile();
  if (!raw || typeof raw !== 'object') return defaultProf;

  const validGrades: Grade[] = ['1.°', '2.°', '3.°', '4.°', '5.°', '6.°', '7.°'];
  const grade: Grade = validGrades.includes(raw.grade) ? raw.grade : '3.°';

  const currentXp = typeof raw.currentXp === 'number' && !isNaN(raw.currentXp) && raw.currentXp >= 0
    ? Math.floor(raw.currentXp)
    : 0;

  const levelInfo = calculateLevelInfo(currentXp);

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : defaultProf.id,
    nickname: typeof raw.nickname === 'string' && raw.nickname.trim() ? raw.nickname.trim().slice(0, 24) : 'Estudiante',
    avatar: typeof raw.avatar === 'string' && raw.avatar ? raw.avatar : '🦊',
    grade,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : defaultProf.createdAt,
    lastActiveDate: typeof raw.lastActiveDate === 'string' ? raw.lastActiveDate : getLocalDateString(),
    level: levelInfo.level,
    currentXp,
    nextLevelXp: levelInfo.nextLevelXp,
    stars: typeof raw.stars === 'number' && !isNaN(raw.stars) ? Math.max(0, Math.floor(raw.stars)) : 0,
    streakDays: typeof raw.streakDays === 'number' && !isNaN(raw.streakDays) ? Math.max(0, Math.floor(raw.streakDays)) : 1,
    lastStreakDate: typeof raw.lastStreakDate === 'string' ? raw.lastStreakDate : getLocalDateString(),
    completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons.filter((l: any) => typeof l === 'string') : [],
    worldLevels: typeof raw.worldLevels === 'object' && raw.worldLevels !== null ? { ...raw.worldLevels } : { bosque: 0, castillo: 0, montana: 0, biblioteca: 0 },
    totalAttempts: typeof raw.totalAttempts === 'number' && !isNaN(raw.totalAttempts) ? Math.max(0, Math.floor(raw.totalAttempts)) : 0,
    totalCorrect: typeof raw.totalCorrect === 'number' && !isNaN(raw.totalCorrect) ? Math.max(0, Math.floor(raw.totalCorrect)) : 0,
    activitiesCompleted: typeof raw.activitiesCompleted === 'number' && !isNaN(raw.activitiesCompleted) ? Math.max(0, Math.floor(raw.activitiesCompleted)) : 0,
    dailyActivityCounts: typeof raw.dailyActivityCounts === 'object' && raw.dailyActivityCounts !== null ? { ...raw.dailyActivityCounts } : {},
    topics: typeof raw.topics === 'object' && raw.topics !== null ? sanitizeTopics(raw.topics) : {},
    unlockedBadges: typeof raw.unlockedBadges === 'object' && raw.unlockedBadges !== null ? { ...raw.unlockedBadges } : {},
  };
}

function sanitizeTopics(rawTopics: any): Record<string, TopicProgress> {
  const result: Record<string, TopicProgress> = {};
  for (const [key, val] of Object.entries(rawTopics)) {
    if (val && typeof val === 'object') {
      const v = val as any;
      result[key] = {
        attempts: typeof v.attempts === 'number' && !isNaN(v.attempts) ? Math.max(0, v.attempts) : 0,
        correct: typeof v.correct === 'number' && !isNaN(v.correct) ? Math.max(0, v.correct) : 0,
        lastPracticed: typeof v.lastPracticed === 'string' ? v.lastPracticed : getLocalDateString(),
        masteryBonusAwarded: Boolean(v.masteryBonusAwarded),
      };
    }
  }
  return result;
}

/**
 * Validate and sanitize full storage state
 */
export function validateAppData(raw: any): AppStorageData {
  const defaultProf = createDefaultProfile('Luna', '3.°', '🦊');
  const defaultState: AppStorageData = {
    version: STORAGE_VERSION,
    activeProfileId: defaultProf.id,
    profiles: [defaultProf],
    updatedAt: new Date().toISOString(),
  };

  if (!raw || typeof raw !== 'object') {
    return defaultState;
  }

  let profiles: UserProfile[] = [];
  if (Array.isArray(raw.profiles) && raw.profiles.length > 0) {
    profiles = raw.profiles.map(validateProfile);
  }

  if (profiles.length === 0) {
    profiles = [defaultProf];
  }

  let activeProfileId = typeof raw.activeProfileId === 'string' ? raw.activeProfileId : profiles[0].id;
  if (!profiles.some(p => p.id === activeProfileId)) {
    activeProfileId = profiles[0].id;
  }

  return {
    version: STORAGE_VERSION,
    activeProfileId,
    profiles,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

/**
 * Safe local storage loader with corruption handling
 */
export function loadAppData(): AppStorageData {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return validateAppData(null);
    }

    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) {
      const initial = validateAppData(null);
      saveAppData(initial);
      return initial;
    }

    const parsed = JSON.parse(item);
    return validateAppData(parsed);
  } catch (error) {
    console.warn('[Ortografía Mágica] Error al leer localStorage. Creando datos seguros por defecto.', error);
    const fallback = validateAppData(null);
    return fallback;
  }
}

/**
 * Safe local storage saver
 */
export function saveAppData(data: AppStorageData): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const cleanData: AppStorageData = {
      ...data,
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
    return true;
  } catch (error) {
    console.error('[Ortografía Mágica] Error al escribir en localStorage.', error);
    return false;
  }
}

/**
 * Verifiable Badges Evaluator
 * Tests criteria against real profile statistics and returns newly unlocked badges
 */
export function evaluateBadges(
  profile: UserProfile,
  quizContext?: {
    worldId: string;
    topic: string;
    correctCount: number;
    totalCount: number;
    mistakesCount: number;
    activityType?: ActivityType;
  }
): Badge[] {
  const newlyUnlocked: Badge[] = [];
  const today = getLocalDateString();
  const displayToday = formatDisplayDate(today);

  // Helper to test if a topic title or key matches
  const getTopicStats = (keywords: string[]) => {
    let attempts = 0;
    let correct = 0;
    for (const [topicName, stats] of Object.entries(profile.topics)) {
      const lower = topicName.toLowerCase();
      if (keywords.some(k => lower.includes(k.toLowerCase()))) {
        attempts += stats.attempts;
        correct += stats.correct;
      }
    }
    return { attempts, correct };
  };

  const unlockBadge = (badgeId: string) => {
    if (!profile.unlockedBadges[badgeId]) {
      profile.unlockedBadges[badgeId] = { unlockedAt: displayToday };
      const found = BADGES.find(b => b.id === badgeId);
      if (found) {
        newlyUnlocked.push({
          ...found,
          unlocked: true,
          dateUnlocked: displayToday,
        });
      }
    }
  };

  // 1. b1: Cazador de tildes -> Acentuación correcta >= 10
  const tildes = getTopicStats(['acento', 'tilde', 'aguda', 'grave', 'esdrújula']);
  if (tildes.correct >= 10) {
    unlockBadge('b1');
  }

  // 2. b2: Maestro de la B -> B y V con al menos 10 aciertos y >= 75% precisión
  const bStats = getTopicStats(['b y v', 'uso de b', 'reglas de b', 'mb', '-aba']);
  if (bStats.correct >= 8 && (bStats.correct / Math.max(1, bStats.attempts)) >= 0.75) {
    unlockBadge('b2');
  }

  // 3. b3: Experto en puntuación -> Puntuación o signos con >= 8 aciertos
  const puntStats = getTopicStats(['puntuación', 'signos', 'coma', 'dos puntos', 'entonación']);
  if (puntStats.correct >= 8) {
    unlockBadge('b3');
  }

  // 4. b4: Guardián del Diccionario -> Racha activa de 3 o más días
  if (profile.streakDays >= 3) {
    unlockBadge('b4');
  }

  // 5. b5: Ojo de Halcón Ortográfico -> Ronda impecable (0 errores) con al menos 5 preguntas
  if (quizContext && quizContext.totalCount >= 5 && quizContext.mistakesCount === 0) {
    unlockBadge('b5');
  }

  // 6. b6: Sabio de la Biblioteca -> Nivel de biblioteca >= 2 o >= 15 aciertos totales en Biblioteca
  if ((profile.worldLevels['biblioteca'] || 0) >= 2 || profile.totalCorrect >= 35) {
    unlockBadge('b6');
  }

  return newlyUnlocked;
}

/**
 * Export JSON backup
 */
export function generateExportJSON(data: AppStorageData, profileId?: string): string {
  const exportPayload = {
    app: 'OrtografiaMagica',
    schemaVersion: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    isSingleProfile: Boolean(profileId),
    data: profileId
      ? {
          activeProfileId: profileId,
          profiles: data.profiles.filter(p => p.id === profileId),
        }
      : data,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Validate and import JSON backup
 */
export function parseAndValidateImportJSON(
  jsonText: string
): { success: true; importedProfiles: UserProfile[]; activeId?: string } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'El archivo no contiene un formato JSON válido.' };
    }

    // Accept either direct AppStorageData or wrapped export payload
    const rawData = parsed.data || parsed;

    if (!rawData.profiles && !Array.isArray(rawData.profiles) && !rawData.id) {
      return { success: false, error: 'No se encontraron perfiles de Ortografía Mágica en este archivo.' };
    }

    let profileList: any[] = [];
    if (Array.isArray(rawData.profiles)) {
      profileList = rawData.profiles;
    } else if (rawData.id && rawData.nickname) {
      profileList = [rawData];
    }

    if (profileList.length === 0) {
      return { success: false, error: 'La lista de perfiles está vacía.' };
    }

    const validated = profileList.map(validateProfile);
    const activeId = rawData.activeProfileId && validated.some(p => p.id === rawData.activeProfileId)
      ? rawData.activeProfileId
      : validated[0].id;

    return {
      success: true,
      importedProfiles: validated,
      activeId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Error de sintaxis: el archivo JSON está corrupto o mal formado.',
    };
  }
}
