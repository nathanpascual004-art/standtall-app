import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore } from '@/lib/store';
import { borderWidth, color, radius, space, type, webNoOutline } from '@/theme/tokens';

const MIN_CM = 100;
const MAX_CM = 230;

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
            placeholderTextColor={color.textMuted}
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
    backgroundColor: color.bg,
    paddingHorizontal: space.screen,
    paddingTop: space.md,
  },
  flex: {
    flex: 1,
  },
  title: {
    ...type.question,
    marginTop: space.xxl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.lg,
    marginTop: space.xxl,
  },
  input: {
    flex: 1,
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
    paddingVertical: space.lg,
  },
  unit: {
    ...type.body,
  },
  hint: {
    ...type.meta,
    marginTop: space.sm,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.sm,
  },
});
