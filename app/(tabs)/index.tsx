import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { ScoreGauge } from '@/components/ScoreGauge';
import { StatCard } from '@/components/StatCard';
import { colors, fontWeight, spacing } from '@/lib/theme';

/**
 * Onglet Stature — dashboard principal.
 * Contenu placeholder : aperçu des composants de base en attendant
 * la construction du vrai dashboard (après le quiz).
 */
export default function StatureScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Stature</Text>

      <Card style={styles.gaugeCard}>
        <ScoreGauge value={72} label="Score de posture" />
      </Card>

      <View style={styles.row}>
        <StatCard label="TAILLE PERÇUE" value="+1,8 cm" style={styles.flex} />
        <StatCard label="SÉRIE" value="12 j" style={styles.flex} />
      </View>

      <Card style={styles.progressCard}>
        <Text style={styles.progressLabel}>Programme du jour</Text>
        <ProgressBar progress={0.4} />
      </Card>

      <Text style={styles.hint}>Dashboard placeholder — à construire.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.lg,
  },
  gaugeCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  flex: {
    flex: 1,
  },
  progressCard: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: fontWeight.regular,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: fontWeight.regular,
    marginTop: spacing.lg,
  },
});
