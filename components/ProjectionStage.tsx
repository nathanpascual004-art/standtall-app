import { StyleSheet, Text, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { formatDecimal, useAppLanguage, type AppLanguage } from '@/lib/i18n';
import { color, font, space, type } from '@/theme/tokens';

/** Dimensions locales du visuel (layout, pas des tokens). */
const STAGE_HEIGHT = 280;
const RULER_WIDTH = 34;
const TICK_STEP = 14;
/** Part de la hauteur de scène occupée par le personnage avachi. */
const MIN_CHARACTER_RATIO = 0.82;

const formatCm = (value: number, lang: AppLanguage) => `${formatDecimal(value, 1, lang)} cm`;

/**
 * Scène de projection : toise graduée + personnage.
 * `ratio` 0 → aujourd'hui (avachi, plus petit) ; 1 → pleine hauteur
 * (redressé). Le VISUEL amplifie le redressement pour être lisible ;
 * les CHIFFRES affichés restent les vrais (taille → taille + cm volés).
 */
export function ProjectionStage({
  heightCm,
  fullHeightCm,
  postureScore,
  ratio,
}: {
  heightCm: number;
  fullHeightCm: number;
  /** Score initial — pilote la posture du personnage à ratio 0. */
  postureScore: number;
  /** 0 = aujourd'hui, 1 = pleine hauteur (animable). */
  ratio: number;
}) {
  const lang = useAppLanguage();
  const clamped = Math.max(0, Math.min(1, ratio));
  const characterRatio = MIN_CHARACTER_RATIO + (1 - MIN_CHARACTER_RATIO) * clamped;
  const characterHeight = STAGE_HEIGHT * characterRatio;
  // Posture : du score réel (voûté) vers 100 (droit).
  const score = postureScore + (100 - postureScore) * clamped;
  // Chiffre honnête : taille actuelle → pleine hauteur.
  const shownCm = heightCm + (fullHeightCm - heightCm) * clamped;

  const ticks = Array.from(
    { length: Math.floor(STAGE_HEIGHT / TICK_STEP) + 1 },
    (_, i) => i * TICK_STEP,
  );

  return (
    <View style={styles.stage}>
      {/* Toise graduée. */}
      <View style={styles.ruler}>
        {ticks.map((offset) => (
          <View
            key={offset}
            style={[
              styles.tick,
              { bottom: offset },
              offset % (TICK_STEP * 5) === 0 && styles.tickMajor,
            ]}
          />
        ))}
      </View>

      {/* Personnage, ancré au sol. */}
      <View style={styles.characterArea}>
        <View style={{ height: characterHeight, justifyContent: 'flex-end' }}>
          <Mascot score={score} size={characterHeight} />
        </View>
      </View>

      {/* Marqueur au sommet du personnage + chiffre réel. */}
      <View pointerEvents="none" style={[styles.marker, { bottom: characterHeight }]}>
        <View style={styles.markerLine} />
        <Text style={styles.markerLabel}>{formatCm(shownCm, lang)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: STAGE_HEIGHT,
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  ruler: {
    width: RULER_WIDTH,
    height: STAGE_HEIGHT,
  },
  tick: {
    position: 'absolute',
    left: 0,
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: color.tickOff,
  },
  tickMajor: {
    width: 20,
    backgroundColor: color.railOff,
  },
  characterArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  marker: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  markerLine: {
    flex: 1,
    height: 1,
    backgroundColor: color.accent,
    opacity: 0.7,
  },
  markerLabel: {
    ...type.bodyMedium,
    color: color.accent,
    fontFamily: font.bold,
    fontVariant: ['tabular-nums'],
  },
});
