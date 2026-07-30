import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SectionLabel } from '@/components/SectionLabel';
import { color, radius, space, spring, type } from '@/theme/tokens';

const TICK_COUNT = 12;
const TICK_HEIGHT = 3;
const TICK_WIDTH = 18;
const TICK_WIDE = 28;
const MARKER_HEIGHT = 4;

type ToiseProps = {
  /** Score entre 0 et 100. */
  score: number;
  /** Delta affiché en pastille accent (ex. +4). Masqué si <= 0. */
  delta?: number;
  /** Label au-dessus du chiffre. */
  label?: string;
  /** Sous-texte honnête (ex. « Tu te tiens à 98 % de ta pleine hauteur. »). */
  subtext?: string;
  /** Hauteur de la colonne de graduations. */
  height?: number;
};

/** Compteur 0 → valeur (rAF), gelé si animations réduites. */
function useCountUp(target: number, enabled: boolean): number {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const durationMs = 800;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);

  return value;
}

/**
 * Toise — composant signature. Jauge verticale de graduations remplie du
 * bas vers le haut (spring), gros chiffre en compteur, delta en pastille.
 */
export function Toise({
  score,
  delta = 0,
  label = 'Score de stature',
  subtext,
  height = 168,
}: ToiseProps) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, score));
  const displayed = useCountUp(clamped, !reducedMotion);

  // Progression animée 0 → score/100 : pilote la hauteur du masque accent.
  const progress = useSharedValue(reducedMotion ? clamped / 100 : 0);
  useEffect(() => {
    progress.value = withSpring(clamped / 100, spring);
  }, [clamped, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    height: progress.value * height,
  }));
  const markerStyle = useAnimatedStyle(() => ({
    bottom: Math.max(0, progress.value * height - MARKER_HEIGHT / 2),
  }));

  const gap = (height - TICK_COUNT * TICK_HEIGHT) / (TICK_COUNT - 1);

  const ticks = (tickColor: string) => (
    <View style={[styles.ticksColumn, { height, gap }]}>
      {Array.from({ length: TICK_COUNT }, (_, index) => (
        <View
          key={index}
          style={[styles.tick, { backgroundColor: tickColor }]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.row}>
      <View style={[styles.gauge, { height }]}>
        {ticks(color.tickOff)}
        {/* Masque accent ancré en bas — hauteur animée = niveau atteint. */}
        <Animated.View style={[styles.fillMask, fillStyle]}>
          <View style={{ position: 'absolute', bottom: 0 }}>{ticks(color.accent)}</View>
        </Animated.View>
        {/* Tick courant, légèrement plus large. */}
        <Animated.View style={[styles.marker, markerStyle]} />
      </View>

      <View style={styles.body}>
        <SectionLabel>{label}</SectionLabel>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{displayed}</Text>
          {delta > 0 ? (
            <View style={styles.deltaPill}>
              <Text style={styles.deltaLabel}>+{delta}</Text>
            </View>
          ) : null}
        </View>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
  },
  gauge: {
    width: TICK_WIDE,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  ticksColumn: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  tick: {
    width: TICK_WIDTH,
    height: TICK_HEIGHT,
    borderRadius: TICK_HEIGHT / 2,
  },
  fillMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  marker: {
    position: 'absolute',
    left: 0,
    width: TICK_WIDE,
    height: MARKER_HEIGHT,
    borderRadius: MARKER_HEIGHT / 2,
    backgroundColor: color.accent,
  },
  body: {
    flex: 1,
    gap: space.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  score: {
    ...type.statNumber,
    fontVariant: ['tabular-nums'],
  },
  deltaPill: {
    backgroundColor: color.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  deltaLabel: {
    fontFamily: type.cardTitle.fontFamily,
    fontSize: 13,
    color: color.onAccent,
  },
  subtext: {
    ...type.body,
  },
});
