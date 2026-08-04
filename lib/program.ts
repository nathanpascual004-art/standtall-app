/**
 * Contenu du programme — séances de posture et de mobilité.
 * Exercices classiques et sûrs (décompression, ouverture, mobilité) ;
 * aucun contenu « pour grandir » : on travaille le redressement.
 */
import type { Localized } from './i18n';

export const PROGRAM_DISCLAIMER: Localized = {
  fr: 'Programme de posture et de mobilité. En cas de douleur, consulte un professionnel de santé.',
  en: 'Posture and mobility program. If anything hurts, check with a health professional.',
};

export type Exercise = {
  id: string;
  nom: Localized;
  durationSec: number;
  description: Localized;
  /** Zone travaillée : nuque, épaules, dos, hanches… */
  cible: Localized;
  /** Illustration du mouvement (require) — placeholder si absente. */
  image?: number;
};

export type Session = {
  id: string;
  titre: Localized;
  durationMin: number;
  exercises: Exercise[];
};

export const SESSIONS: Session[] = [
  {
    id: 'redressement-base',
    titre: { fr: 'Redressement de base', en: 'Stand-tall basics' },
    durationMin: 10,
    exercises: [
      {
        id: 'rb-retraction-menton',
        nom: { fr: 'Rétraction du menton', en: 'Chin tuck' },
        durationSec: 60,
        description: {
          fr: 'Debout ou assis, recule doucement le menton en gardant le regard horizontal, puis relâche. Répète lentement.',
          en: 'Standing or seated, gently draw your chin back while keeping your gaze level, then release. Repeat slowly.',
        },
        cible: { fr: 'nuque', en: 'neck' },
        image: require('@/assets/images/exo-retraction-menton.webp'),
      },
      {
        id: 'rb-pectoraux-mur',
        nom: { fr: 'Étirement des pectoraux au mur', en: 'Wall chest stretch' },
        durationSec: 90,
        description: {
          fr: "Avant-bras contre l'encadrement d'une porte, avance légèrement le buste jusqu'à sentir l'ouverture de la poitrine. Change de côté à mi-temps.",
          en: 'Forearm against a door frame, lean your torso slightly forward until you feel your chest open. Switch sides halfway through.',
        },
        cible: { fr: 'épaules', en: 'shoulders' },
        image: require('@/assets/images/exo-etirement-pecs-mur.webp'),
      },
      {
        id: 'rb-extension-thoracique',
        nom: { fr: 'Extension thoracique sur chaise', en: 'Thoracic extension over a chair' },
        durationSec: 90,
        description: {
          fr: 'Mains derrière la nuque, laisse le haut du dos s’étendre sur le dossier, sans cambrer les lombaires.',
          en: 'Hands behind your neck, let your upper back extend over the backrest without arching your lower back.',
        },
        cible: { fr: 'haut du dos', en: 'upper back' },
        image: require('@/assets/images/exo-extension-thoracique.webp'),
      },
      {
        id: 'rb-chat-vache',
        nom: { fr: 'Chat-vache', en: 'Cat-cow' },
        durationSec: 120,
        description: {
          fr: 'À quatre pattes, alterne lentement dos rond et dos creux en suivant ta respiration.',
          en: 'On all fours, slowly alternate between rounding and arching your back, following your breath.',
        },
        cible: { fr: 'dos', en: 'back' },
        image: require('@/assets/images/exo-chat-vache.webp'),
      },
      {
        id: 'rb-decompression',
        nom: { fr: 'Suspension ou étirement bras levés', en: 'Dead hang or overhead reach' },
        durationSec: 90,
        description: {
          fr: 'Suspends-toi à une barre ou étire les bras vers le plafond, épaules relâchées, pour décomprimer la colonne.',
          en: 'Hang from a bar or reach your arms toward the ceiling, shoulders relaxed, to decompress your spine.',
        },
        cible: { fr: 'colonne', en: 'spine' },
        image: require('@/assets/images/exo-suspension-bras-leves.webp'),
      },
      {
        id: 'rb-alignement-mur',
        nom: { fr: 'Alignement dos au mur', en: 'Wall alignment' },
        durationSec: 150,
        description: {
          fr: 'Talons, bassin, haut du dos et tête au contact du mur, menton rentré. Respire profondément en tenant la position.',
          en: 'Heels, pelvis, upper back and head touching the wall, chin tucked. Breathe deeply while holding the position.',
        },
        cible: { fr: 'posture globale', en: 'whole posture' },
        image: require('@/assets/images/exo-alignement-dos-mur.webp'),
      },
    ],
  },
  {
    id: 'anti-tete-avant',
    titre: { fr: 'Anti-tête en avant', en: 'Forward-head fix' },
    durationMin: 8,
    exercises: [
      {
        id: 'ata-retraction-menton',
        nom: { fr: 'Rétraction du menton', en: 'Chin tuck' },
        durationSec: 90,
        description: {
          fr: 'Recule doucement le menton en gardant le regard horizontal, tiens 3 secondes, relâche. Répète.',
          en: 'Gently draw your chin back while keeping your gaze level, hold for 3 seconds, release. Repeat.',
        },
        cible: { fr: 'nuque', en: 'neck' },
        image: require('@/assets/images/exo-retraction-menton.webp'),
      },
      {
        id: 'ata-trapezes',
        nom: { fr: 'Étirement des trapèzes supérieurs', en: 'Upper-trap stretch' },
        durationSec: 90,
        description: {
          fr: 'Incline doucement la tête sur le côté, main opposée relâchée vers le sol. Change de côté à mi-temps.',
          en: 'Gently tilt your head to the side, opposite hand relaxed toward the floor. Switch sides halfway through.',
        },
        cible: { fr: 'nuque', en: 'neck' },
        image: require('@/assets/images/exo-trapezes-superieurs.webp'),
      },
      {
        id: 'ata-isometrie-menton',
        nom: { fr: 'Menton rentré isométrique', en: 'Isometric chin tuck' },
        durationSec: 60,
        description: {
          fr: 'Menton rentré, presse légèrement deux doigts contre le menton et résiste 5 secondes, relâche, répète.',
          en: 'Chin tucked, press two fingers lightly against your chin and resist for 5 seconds, release, repeat.',
        },
        cible: { fr: 'nuque', en: 'neck' },
        image: require('@/assets/images/exo-menton-isometrique.webp'),
      },
      {
        id: 'ata-anges-mur',
        nom: { fr: 'Anges au mur (Y–W)', en: 'Wall angels (Y–W)' },
        durationSec: 120,
        description: {
          fr: 'Dos au mur, fais glisser lentement les bras entre la position Y et la position W, sans décoller le bas du dos.',
          en: 'Back against the wall, slowly slide your arms between the Y and W positions, keeping your lower back on the wall.',
        },
        cible: { fr: 'haut du dos', en: 'upper back' },
        image: require('@/assets/images/exo-anges-mur.webp'),
      },
      {
        id: 'ata-extension-thoracique',
        nom: { fr: 'Extension thoracique', en: 'Thoracic extension' },
        durationSec: 120,
        description: {
          fr: 'Mains derrière la nuque, ouvre la poitrine vers le plafond en étendant le haut du dos, sans cambrer les lombaires.',
          en: 'Hands behind your neck, open your chest toward the ceiling by extending your upper back, without arching your lower back.',
        },
        cible: { fr: 'haut du dos', en: 'upper back' },
        image: require('@/assets/images/exo-extension-thoracique.webp'),
      },
    ],
  },
  {
    id: 'mobilite-complete',
    titre: { fr: 'Mobilité complète', en: 'Full mobility' },
    durationMin: 15,
    exercises: [
      {
        id: 'mc-chien-tete-bas',
        nom: { fr: 'Chien tête en bas', en: 'Downward dog' },
        durationSec: 120,
        description: {
          fr: 'Depuis quatre pattes, pousse les hanches vers le haut et l’arrière, jambes légèrement fléchies si besoin.',
          en: 'From all fours, push your hips up and back, knees slightly bent if needed.',
        },
        cible: { fr: 'chaîne postérieure', en: 'posterior chain' },
        image: require('@/assets/images/exo-chien-tete-en-bas.webp'),
      },
      {
        id: 'mc-ischio',
        nom: { fr: 'Étirement des ischio-jambiers', en: 'Hamstring stretch' },
        durationSec: 120,
        description: {
          fr: 'Assis, une jambe tendue, penche-toi vers l’avant en gardant le dos long, sans l’arrondir. Change de jambe à mi-temps.',
          en: 'Seated with one leg extended, hinge forward keeping your spine long, without rounding it. Switch legs halfway through.',
        },
        cible: { fr: 'chaîne postérieure', en: 'posterior chain' },
        image: require('@/assets/images/exo-ischio-jambiers.webp'),
      },
      {
        id: 'mc-fente-psoas',
        nom: { fr: 'Fente basse — psoas', en: 'Low lunge — hip flexors' },
        durationSec: 180,
        description: {
          fr: 'Genou arrière au sol, avance doucement le bassin en gardant le buste droit. Tu dois sentir l’avant de la hanche. Change de côté à mi-temps.',
          en: 'Back knee on the floor, gently shift your pelvis forward keeping your torso upright. You should feel the front of your hip. Switch sides halfway through.',
        },
        cible: { fr: 'hanches', en: 'hips' },
        image: require('@/assets/images/exo-fente-psoas.webp'),
      },
      {
        id: 'mc-figure-4',
        nom: { fr: 'Figure 4 allongé', en: 'Lying figure four' },
        durationSec: 180,
        description: {
          fr: 'Allongé sur le dos, cheville sur le genou opposé, ramène la cuisse vers toi. Change de côté à mi-temps.',
          en: 'Lying on your back, ankle over the opposite knee, draw your thigh toward you. Switch sides halfway through.',
        },
        cible: { fr: 'hanches', en: 'hips' },
        image: require('@/assets/images/exo-figure-4.webp'),
      },
      {
        id: 'mc-rotation-thoracique',
        nom: { fr: 'Rotation thoracique à quatre pattes', en: 'Quadruped thoracic rotation' },
        durationSec: 120,
        description: {
          fr: 'Une main derrière la tête, ouvre le coude vers le plafond en suivant du regard, puis reviens. Alterne les côtés.',
          en: 'One hand behind your head, open your elbow toward the ceiling following it with your gaze, then return. Alternate sides.',
        },
        cible: { fr: 'haut du dos', en: 'upper back' },
        image: require('@/assets/images/exo-rotation-thoracique.webp'),
      },
      {
        id: 'mc-enfant',
        nom: { fr: 'Posture de l’enfant', en: 'Child’s pose' },
        durationSec: 180,
        description: {
          fr: 'Assis sur les talons, bras allongés devant, front vers le sol. Relâche complètement le dos et respire.',
          en: 'Sitting on your heels, arms stretched forward, forehead toward the floor. Fully relax your back and breathe.',
        },
        cible: { fr: 'dos', en: 'back' },
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
