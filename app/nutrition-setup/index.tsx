import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useOnboardingStore } from '@/lib/store';
import { colors, fontWeight, radius, spacing } from '@/lib/theme';

const MIN_KG = 30;
const MAX_KG = 250;

const webNoOutline: TextStyle | null =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

/** Setup nutrition 1/4 — poids. */
export default function WeightScreen() {
  const router = useRouter();
  const draft = useOnboardingStore((state) => state.nutritionDraft);
  const setNutritionDraft = useOnboardingStore((state) => state.setNutritionDraft);
  const [raw, setRaw] = useState(draft.poidsKg ? String(draft.poidsKg) : '');

  const parsed = Number.parseInt(raw, 10);
  const isValid = Number.isFinite(parsed) && parsed >= MIN_KG && parsed <= MAX_KG;

  const handleContinue = () => {
    if (!isValid) return;
    setNutritionDraft({ poidsKg: parsed });
    router.push('/nutrition-setup/objectif');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <OnboardingProgress step={1} total={4} />
        <Text style={styles.title}>Ton poids ?</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, webNoOutline]}
            value={raw}
            onChangeText={(text) => setRaw(text.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="72"
            placeholderTextColor={colors.textMuted}
            maxLength={3}
            autoFocus
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Continuer" disabled={!isValid} onPress={handleContinue} />
        </View>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xxl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 24,
    fontWeight: fontWeight.medium,
    paddingVertical: 18,
  },
  unit: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: fontWeight.regular,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
});
