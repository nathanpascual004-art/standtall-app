import { create } from 'zustand';

/** Nombre total d'étapes du quiz d'onboarding. */
export const TOTAL_ONBOARDING_STEPS = 14;

/** Objectif principal choisi à l'étape 1. */
export type Goal = 'taller' | 'posture' | 'back-pain' | 'presence';

export type Gender = 'homme' | 'femme' | 'autre';

export type AgeRange = '13-17' | '18-24' | '25-34' | '35-44' | '45+';

/** Heures assis / devant un écran par jour. */
export type SittingHours = 'moins-4' | '4-8' | '8-plus';

/** Tenue spontanée (étape 6). */
export type PostureType = 'droit' | 'legerement-voute' | 'tres-voute';

/** Tête qui part en avant (étape 7). */
export type ForwardHead = 'jamais' | 'parfois' | 'souvent';

/** Douleurs dos / nuque / épaules (étape 8). */
export type PainFrequency = 'aucune' | 'parfois' | 'regulieres';

/** Épaules enroulées vers l'avant (étape 9). */
export type ShoulderRoll = 'non' | 'un-peu' | 'oui';

/** Minutes par jour consacrées au programme (étape 12). */
export type DailyMinutes = 5 | 10 | 15;

/**
 * Réponses du quiz — une clé par écran.
 */
export type QuizAnswers = {
  goal?: Goal;
  gender?: Gender;
  ageRange?: AgeRange;
  /** Taille actuelle en cm (étape 4). */
  heightCm?: number;
  sittingHours?: SittingHours;
  postureType?: PostureType;
  forwardHead?: ForwardHead;
  pain?: PainFrequency;
  roundedShoulders?: ShoulderRoll;
  /** URI locale de la photo de profil (étape 10) — analyse à venir. */
  profilePhotoUri?: string;
  dailyMinutes?: DailyMinutes;
};

type OnboardingState = {
  answers: QuizAnswers;
  /** Passe à true à la fin du flow (reveal/paywall) — débloque les tabs. */
  onboardingDone: boolean;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  answers: {},
  onboardingDone: false,
  setAnswer: (key, value) =>
    set((state) => ({ answers: { ...state.answers, [key]: value } })),
  completeOnboarding: () => set({ onboardingDone: true }),
  reset: () => set({ answers: {}, onboardingDone: false }),
}));
