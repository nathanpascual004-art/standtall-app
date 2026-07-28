import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontWeight, spacing } from '@/lib/theme';

/** Paywall — placeholder, à construire après l'onboarding. */
export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Text style={styles.title}>StandTall Pro</Text>
      <Text style={styles.hint}>Paywall à construire.</Text>
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
