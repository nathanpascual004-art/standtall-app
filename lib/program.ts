/**
 * Contenu du programme — séances de posture et de mobilité.
 * Exercices classiques et sûrs (décompression, ouverture, mobilité) ;
 * aucun contenu « pour grandir » : on travaille le redressement.
 */

export const PROGRAM_DISCLAIMER =
  'Programme de posture et de mobilité. En cas de douleur, consulte un professionnel de santé.';

export type Exercise = {
  id: string;
  nom: string;
  durationSec: number;
  description: string;
  /** Zone travaillée : nuque, épaules, dos, hanches… */
  cible: string;
  /** Illustration du mouvement (require) — placeholder si absente. */
  image?: number;
};

export type Session = {
  id: string;
  titre: string;
  durationMin: number;
  exercises: Exercise[];
};

export const SESSIONS: Session[] = [
  {
    id: 'redressement-base',
    titre: 'Redressement de base',
    durationMin: 10,
    exercises: [
      {
        id: 'rb-retraction-menton',
        nom: 'Rétraction du menton',
        durationSec: 60,
        description:
          'Debout ou assis, recule doucement le menton en gardant le regard horizontal, puis relâche. Répète lentement.',
        cible: 'nuque',
        image: require('@/assets/images/exo-retraction-menton.webp'),
      },
      {
        id: 'rb-pectoraux-mur',
        nom: 'Étirement des pectoraux au mur',
        durationSec: 90,
        description:
          "Avant-bras contre l'encadrement d'une porte, avance légèrement le buste jusqu'à sentir l'ouverture de la poitrine. Change de côté à mi-temps.",
        cible: 'épaules',
        image: require('@/assets/images/exo-etirement-pecs-mur.webp'),
      },
      {
        id: 'rb-extension-thoracique',
        nom: 'Extension thoracique sur chaise',
        durationSec: 90,
        description:
          'Mains derrière la nuque, laisse le haut du dos s’étendre sur le dossier, sans cambrer les lombaires.',
        cible: 'haut du dos',
        image: require('@/assets/images/exo-extension-thoracique.webp'),
      },
      {
        id: 'rb-chat-vache',
        nom: 'Chat-vache',
        durationSec: 120,
        description:
          'À quatre pattes, alterne lentement dos rond et dos creux en suivant ta respiration.',
        cible: 'dos',
        image: require('@/assets/images/exo-chat-vache.webp'),
      },
      {
        id: 'rb-decompression',
        nom: 'Suspension ou étirement bras levés',
        durationSec: 90,
        description:
          'Suspends-toi à une barre ou étire les bras vers le plafond, épaules relâchées, pour décomprimer la colonne.',
        cible: 'colonne',
        image: require('@/assets/images/exo-suspension-bras-leves.webp'),
      },
      {
        id: 'rb-alignement-mur',
        nom: 'Alignement dos au mur',
        durationSec: 150,
        description:
          'Talons, bassin, haut du dos et tête au contact du mur, menton rentré. Respire profondément en tenant la position.',
        cible: 'posture globale',
        image: require('@/assets/images/exo-alignement-dos-mur.webp'),
      },
    ],
  },
  {
    id: 'anti-tete-avant',
    titre: 'Anti-tête en avant',
    durationMin: 8,
    exercises: [
      {
        id: 'ata-retraction-menton',
        nom: 'Rétraction du menton',
        durationSec: 90,
        description:
          'Recule doucement le menton en gardant le regard horizontal, tiens 3 secondes, relâche. Répète.',
        cible: 'nuque',
        image: require('@/assets/images/exo-retraction-menton.webp'),
      },
      {
        id: 'ata-trapezes',
        nom: 'Étirement des trapèzes supérieurs',
        durationSec: 90,
        description:
          'Incline doucement la tête sur le côté, main opposée relâchée vers le sol. Change de côté à mi-temps.',
        cible: 'nuque',
        image: require('@/assets/images/exo-trapezes-superieurs.webp'),
      },
      {
        id: 'ata-isometrie-menton',
        nom: 'Menton rentré isométrique',
        durationSec: 60,
        description:
          'Menton rentré, presse légèrement deux doigts contre le menton et résiste 5 secondes, relâche, répète.',
        cible: 'nuque',
        image: require('@/assets/images/exo-menton-isometrique.webp'),
      },
      {
        id: 'ata-anges-mur',
        nom: 'Anges au mur (Y–W)',
        durationSec: 120,
        description:
          'Dos au mur, fais glisser lentement les bras entre la position Y et la position W, sans décoller le bas du dos.',
        cible: 'haut du dos',
        image: require('@/assets/images/exo-anges-mur.webp'),
      },
      {
        id: 'ata-extension-thoracique',
        nom: 'Extension thoracique',
        durationSec: 120,
        description:
          'Mains derrière la nuque, ouvre la poitrine vers le plafond en étendant le haut du dos, sans cambrer les lombaires.',
        cible: 'haut du dos',
        image: require('@/assets/images/exo-extension-thoracique.webp'),
      },
    ],
  },
  {
    id: 'mobilite-complete',
    titre: 'Mobilité complète',
    durationMin: 15,
    exercises: [
      {
        id: 'mc-chien-tete-bas',
        nom: 'Chien tête en bas',
        durationSec: 120,
        description:
          'Depuis quatre pattes, pousse les hanches vers le haut et l’arrière, jambes légèrement fléchies si besoin.',
        cible: 'chaîne postérieure',
        image: require('@/assets/images/exo-chien-tete-en-bas.webp'),
      },
      {
        id: 'mc-ischio',
        nom: 'Étirement des ischio-jambiers',
        durationSec: 120,
        description:
          'Assis, une jambe tendue, penche-toi vers l’avant en gardant le dos long, sans l’arrondir. Change de jambe à mi-temps.',
        cible: 'chaîne postérieure',
        image: require('@/assets/images/exo-ischio-jambiers.webp'),
      },
      {
        id: 'mc-fente-psoas',
        nom: 'Fente basse — psoas',
        durationSec: 180,
        description:
          'Genou arrière au sol, avance doucement le bassin en gardant le buste droit. Tu dois sentir l’avant de la hanche. Change de côté à mi-temps.',
        cible: 'hanches',
        image: require('@/assets/images/exo-fente-psoas.webp'),
      },
      {
        id: 'mc-figure-4',
        nom: 'Figure 4 allongé',
        durationSec: 180,
        description:
          'Allongé sur le dos, cheville sur le genou opposé, ramène la cuisse vers toi. Change de côté à mi-temps.',
        cible: 'hanches',
        image: require('@/assets/images/exo-figure-4.webp'),
      },
      {
        id: 'mc-rotation-thoracique',
        nom: 'Rotation thoracique à quatre pattes',
        durationSec: 120,
        description:
          'Une main derrière la tête, ouvre le coude vers le plafond en suivant du regard, puis reviens. Alterne les côtés.',
        cible: 'haut du dos',
        image: require('@/assets/images/exo-rotation-thoracique.webp'),
      },
      {
        id: 'mc-enfant',
        nom: 'Posture de l’enfant',
        durationSec: 180,
        description:
          'Assis sur les talons, bras allongés devant, front vers le sol. Relâche complètement le dos et respire.',
        cible: 'dos',
        image: require('@/assets/images/exo-posture-enfant.webp'),
      },
    ],
  },
];

export function getSession(id: string | undefined): Session | undefined {
  return SESSIONS.find((session) => session.id === id);
}

/** « 90 » → « 1 min 30 », « 60 » → « 1 min », « 45 » → « 45 s ». */
export function formatExerciseDuration(sec: number): string {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  if (minutes === 0) return `${seconds} s`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${String(seconds).padStart(2, '0')}`;
}
