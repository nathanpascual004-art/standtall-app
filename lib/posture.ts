/**
 * Estimation basée sur des facteurs posturaux déclarés.
 * Ne mesure pas la longueur osseuse.
 *
 * Calcul PERSONNALISÉ et DÉTERMINISTE (jamais aléatoire) : les mêmes
 * réponses du quiz produisent toujours exactement le même résultat.
 */
import type { QuizAnswers } from './store';

export type PostureResult = {
  /** Score de posture, 0 à 100. */
  postureScore: number;
  /** Perte de stature estimée en cm, 0.3 à 4.0. */
  heightLossCm: number;
  /** Taille saisie + heightLossCm (arrondi à 0.1). */
  correctedHeightCm: number;
  level: 'bonne' | 'moyenne' | 'à corriger';
};

/** Barème additif, en points de « perte » (max ~10, ratio borné à 1). */
const MAX_POINTS = 10;
const MIN_LOSS_CM = 0.3;
const MAX_LOSS_CM = 4.0;

const SITTING_POINTS: Record<NonNullable<QuizAnswers['sittingHours']>, number> = {
  'moins-4': 0,
  '4-8': 1,
  '8-plus': 2,
};

const POSTURE_POINTS: Record<NonNullable<QuizAnswers['postureType']>, number> = {
  droit: 0,
  'legerement-voute': 1.5,
  'tres-voute': 3,
};

/** Téléphone/écran par jour — même signal que la tête en avant. */
const PHONE_POINTS: Record<NonNullable<QuizAnswers['phoneHours']>, number> = {
  'moins-2': 0,
  '2-5': 1,
  '5-plus': 2,
};

/** Ancien flow (profils existants) — mêmes poids que phone/tensions. */
const FORWARD_HEAD_POINTS: Record<NonNullable<QuizAnswers['forwardHead']>, number> = {
  jamais: 0,
  parfois: 1,
  souvent: 2,
};

const PAIN_POINTS: Record<NonNullable<QuizAnswers['pain']>, number> = {
  aucune: 0,
  parfois: 1,
  regulieres: 2,
};

const SHOULDERS_POINTS: Record<NonNullable<QuizAnswers['roundedShoulders']>, number> = {
  non: 0,
  'un-peu': 1,
  oui: 2,
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Somme des points de perte selon les réponses (réponse manquante = 0).
 * Nouveau flow : assis + téléphone + tenue + tensions + perception.
 * Ancien flow : les clés historiques (tête en avant, douleurs, épaules)
 * servent de repli pour les profils déjà en base.
 */
function computeLossPoints(answers: QuizAnswers): number {
  let points = 0;
  if (answers.sittingHours) points += SITTING_POINTS[answers.sittingHours];
  if (answers.postureType) points += POSTURE_POINTS[answers.postureType];

  if (answers.phoneHours) points += PHONE_POINTS[answers.phoneHours];
  else if (answers.forwardHead) points += FORWARD_HEAD_POINTS[answers.forwardHead];

  if (answers.tensions) {
    // 0 zone → 0 pt, 1 zone → 1 pt, 2-3 zones → 2 pts.
    points += Math.min(2, answers.tensions.length);
  } else if (answers.pain) {
    points += PAIN_POINTS[answers.pain];
  }

  // Perception « je me trouve plus petit » (0-3) — poids léger (max 1).
  if (answers.feelSmaller !== undefined) points += answers.feelSmaller / 3;
  else if (answers.roundedShoulders) points += SHOULDERS_POINTS[answers.roundedShoulders];

  return points;
}

export function computePostureResult(answers: QuizAnswers): PostureResult {
  const points = computeLossPoints(answers);
  const ratio = Math.min(1, points / MAX_POINTS);

  const heightLossCm = round1(MIN_LOSS_CM + ratio * (MAX_LOSS_CM - MIN_LOSS_CM));
  const postureScore = Math.round(100 - ratio * 100);

  let level: PostureResult['level'];
  if (postureScore > 75) level = 'bonne';
  else if (postureScore >= 40) level = 'moyenne';
  else level = 'à corriger';

  const correctedHeightCm = round1((answers.heightCm ?? 0) + heightLossCm);

  return { postureScore, heightLossCm, correctedHeightCm, level };
}

/* Test rapide (dev uniquement) : deux profils opposés doivent donner
   des résultats bien différents. */
declare const __DEV__: boolean | undefined;
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const slouched: QuizAnswers = {
    heightCm: 175,
    sittingHours: '8-plus',
    postureType: 'tres-voute',
    forwardHead: 'souvent',
    pain: 'regulieres',
    roundedShoulders: 'oui',
  };
  const upright: QuizAnswers = {
    heightCm: 175,
    sittingHours: 'moins-4',
    postureType: 'droit',
    forwardHead: 'jamais',
    pain: 'aucune',
    roundedShoulders: 'non',
  };
  console.log('[posture] très voûté + 8h assis :', computePostureResult(slouched));
  console.log('[posture] droit + actif        :', computePostureResult(upright));
}
