/**
 * Habitudes quotidiennes — checklist HONNÊTE (posture / bien-être).
 * Jamais de « gummies de croissance » ni de « suspension pour grandir » :
 * on installe des réflexes de posture, pas des promesses de centimètres.
 */
import type { Ionicons } from '@expo/vector-icons';

import type { Localized } from './i18n';

export type Habit = {
  id: string;
  titre: Localized;
  description: Localized;
  icon: keyof typeof Ionicons.glyphMap;
};

export const HABITS: Habit[] = [
  {
    id: 'posture-check',
    titre: {
      fr: 'Corrige ta posture 3 fois',
      en: 'Fix your posture 3 times',
    },
    description: {
      fr: 'Épaules, menton, dos long.',
      en: 'Shoulders, chin, long spine.',
    },
    icon: 'body-outline',
  },
  {
    id: 'decompression',
    titre: {
      fr: '30 secondes de décompression',
      en: '30 seconds of decompression',
    },
    description: {
      fr: 'Bras levés ou suspension.',
      en: 'Arms overhead or a dead hang.',
    },
    icon: 'arrow-up-outline',
  },
  {
    id: 'eau',
    titre: {
      fr: "Bois 2 L d'eau",
      en: 'Drink 2 L of water',
    },
    description: {
      fr: 'Reste hydraté toute la journée.',
      en: 'Stay hydrated all day long.',
    },
    icon: 'water-outline',
  },
  {
    id: 'ecran-soir',
    titre: {
      fr: "Pas d'écran avant de dormir",
      en: 'No screens before bed',
    },
    description: {
      fr: 'Favorise un meilleur sommeil.',
      en: 'Sets you up for better sleep.',
    },
    icon: 'moon-outline',
  },
];

/** XP par habitude cochée (créditée une seule fois par jour et par habitude). */
export const HABIT_XP = 5;
