import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Mascot } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import type { MascotState } from '@/components/Mascot';
import { color, space, type } from '@/theme/tokens';

/** Dimensions locales (layout, pas des tokens de design). */
const CIRCLE_SIZE = 148;
const CIRCLE_STROKE = 10;
const MASCOT_SIZE = 88;
const TICK_MS = 50;

/**
 * Écran d'analyse générique : mascotte, étapes qui se cochent une à une,
 * barre (ou grand cercle 0→100 %) — timing théâtral, résultat réel
 * calculé par l'écran appelant. Navigue automatiquement à la fin.
 */
export function AnalysisScreen({
  steps,
  durationMs = 2200,
  nextHref,
  circle = false,
  footnote,
  mascotState = 'neutral',
}: {
  /** Étapes affichées puis cochées au fil de la progression. */
  steps: string[];
  durationMs?: number;
  nextHref: string;
  /** true = grand cercle 0→100 % (analyse finale) au lieu de la barre. */
  circle?: boolean;
  /** Micro-copy rassurante sous les étapes. */
  footnote?: string;
  mascotState?: MascotState;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const next = Math.min(1, (Date.now() - startedAt) / durationMs);
      setProgress(next);
      if (next >= 1) {
        clearInterval(interval);
        router.replace(nextHref as never);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [router, nextHref, durationMs]);

  // Une étape est « active » puis « cochée » au fil de la progression.
  const doneCount = Math.floor(progress * steps.length + 0.25);

  const radius = (CIRCLE_SIZE - CIRCLE_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Mascot state={mascotState} size={MASCOT_SIZE} />

        {circle ? (
          <View style={styles.circleWrap}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={radius}
                stroke={color.railOff}
                strokeWidth={CIRCLE_STROKE}
                fill="none"
              />
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={radius}
                stroke={color.accent}
                strokeWidth={CIRCLE_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={circumference * (1 - progress)}
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
              />
            </Svg>
            <Text style={styles.circleValue}>{Math.round(progress * 100)}%</Text>
          </View>
        ) : null}

        <View style={styles.steps}>
          {steps.map((step, index) => {
            const done = index < doneCount;
            const active = index === doneCount;
            return (
              <View key={step} style={styles.stepRow}>
                <Ionicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={done || active ? color.accent : color.border}
                />
                <Text style={[styles.step, (done || active) && styles.stepActive]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {circle ? null : <ProgressBar progress={progress} style={styles.bar} />}
        {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    paddingHorizontal: space.screen,
    paddingTop: space.md,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.xxl,
    paddingBottom: space.xxl,
  },
  circleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    ...type.statNumberSmall,
    position: 'absolute',
    fontVariant: ['tabular-nums'],
  },
  steps: {
    alignSelf: 'stretch',
    gap: space.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  step: {
    ...type.body,
    color: color.textMuted,
    flex: 1,
  },
  stepActive: {
    ...type.bodyMedium,
  },
  bar: {
    alignSelf: 'stretch',
  },
  footnote: {
    ...type.meta,
    textAlign: 'center',
  },
});
