/**
 * Habitudes quotidiennes — checklist HONNÊTE (posture / bien-être).
 * Jamais de « gummies de croissance » ni de « suspension pour grandir » :
 * on installe des réflexes de posture, pas des promesses de centimètres.
 */
import type { Ionicons } from '@expo/vector-icons';

export type Habit = {
  id: string;
  titre: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const HABITS: Habit[] = [
  {
    id: 'posture-check',
    titre: 'Corrige ta posture 3 fois',
    description: 'Épaules, menton, dos long.',
    icon: 'body-outline',
  },
  {
    id: 'decompression',
    titre: '30 secondes de décompression',
    description: 'Bras levés ou suspension.',
    icon: 'arrow-up-outline',
  },
  {
    id: 'eau',
    titre: "Bois 2 L d'eau",
    description: 'Reste hydraté toute la journée.',
    icon: 'water-outline',
  },
  {
    id: 'ecran-soir',
    titre: "Pas d'écran avant de dormir",
    description: 'Favorise un meilleur sommeil.',
    icon: 'moon-outline',
  },
];

/** XP par habitude cochée (créditée une seule fois par jour et par habitude). */
export const HABIT_XP = 5;
