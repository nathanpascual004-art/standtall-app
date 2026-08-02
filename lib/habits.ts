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
    description: 'Trois rappels dans la journée : épaules, menton, dos long.',
    icon: 'body-outline',
  },
  {
    id: 'decompression',
    titre: '30 secondes de décompression',
    description: 'Bras levés ou suspension, épaules relâchées.',
    icon: 'arrow-up-outline',
  },
  {
    id: 'pause-ecran',
    titre: 'Une pause écran par heure',
    description: 'Lève-toi, marche, regarde loin.',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'eau',
    titre: "Bois de l'eau régulièrement",
    description: 'Un verre à chaque pause fait le job.',
    icon: 'water-outline',
  },
];

/** XP par habitude cochée (créditée une seule fois par jour et par habitude). */
export const HABIT_XP = 5;
