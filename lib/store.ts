import { create } from 'zustand';

/** Nombre total d'étapes du quiz d'onboarding. */
export const TOTAL_ONBOARDING_STEPS = 14;

/** Objectif principal choisi à l'étape 1. */
export type Goal = 'taller' | 'posture' | 'back-pain' | 'presence';

/**
 * Réponses du quiz — une clé par écran.
 * Les clés suivantes s'ajouteront au fil des écrans validés.
 */
export type QuizAnswers = {
  goal?: Goal;
};

type OnboardingState = {
  answers: QuizAnswers;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  answers: {},
  setAnswer: (key, value) =>
    set((state) => ({ answers: { ...state.answers, [key]: value } })),
  reset: () => set({ answers: {} }),
}));
