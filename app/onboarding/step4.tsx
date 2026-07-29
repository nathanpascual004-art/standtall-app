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
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore } from '@/lib/store';
import { colors, fonts, radius, spacing } from '@/lib/theme';

const MIN_CM = 100;
const MAX_CM = 230;

/** Neutralise le focus ring du navigateur (web uniquement). */
const webNoOutline: TextStyle | null =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

/** Étape 4/14 — taille actuelle en cm (clavier numérique). */
export default function HeightScreen() {
  const router = useRouter();
  const storedHeight = useOnboardingStore((state) => state.answers.heightCm);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const [raw, setRaw] = useState(storedHeight ? String(storedHeight) : '');

  const parsed = Number.parseInt(raw, 10);
  const isValid = Number.isFinite(parsed) && parsed >= MIN_CM && parsed <= MAX_CM;

  const handleContinue = () => {
    if (!isValid) return;
    setAnswer('heightCm', parsed);
    router.push('/onboarding/step5');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <OnboardingProgress step={4} total={TOTAL_ONBOARDING_STEPS} />

        <Text style={styles.title}>Ta taille actuelle ?</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, webNoOutline]}
            value={raw}
            onChangeText={(text) => setRaw(text.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="175"
            placeholderTextColor={colors.textMuted}
            maxLength={3}
            autoFocus
          />
          <Text style={styles.unit}>cm</Text>
        </View>
        {raw.length >= 3 && !isValid ? (
          <Text style={styles.hint}>
            Entre une taille entre {MIN_CM} et {MAX_CM} cm.
          </Text>
        ) : null}

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
    fontFamily: fonts.display,
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
    fontFamily: fonts.medium,
    paddingVertical: 18,
  },
  unit: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: spacing.sm,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
});
