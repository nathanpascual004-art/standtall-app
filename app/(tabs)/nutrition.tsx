import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontWeight, spacing } from '@/lib/theme';

/** Onglet Nutrition — placeholder. */
export default function NutritionScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.hint}>Bientôt.</Text>
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
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    marginTop: spacing.md,
  },
});
