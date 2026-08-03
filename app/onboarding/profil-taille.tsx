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
import { hasPosture, questionCount, questionStep, routeAfterTaille } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';
import { borderWidth, color, radius, space, type, webNoOutline } from '@/theme/tokens';

const MIN_CM = 100;
const MAX_CM = 230;

/** Écran 5 — taille en cm : la référence du personnage pour la projection. */
export default function TailleScreen() {
  const router = useRouter();
  const intention = useOnboardingStore((state) => state.answers.intention);
  const storedHeight = useOnboardingStore((state) => state.answers.heightCm);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const [raw, setRaw] = useState(storedHeight ? String(storedHeight) : '');

  const parsed = Number.parseInt(raw, 10);
  const isValid = Number.isFinite(parsed) && parsed >= MIN_CM && parsed <= MAX_CM;

  const handleContinue = () => {
    if (!isValid) return;
    setAnswer('heightCm', parsed);
    router.push(routeAfterTaille(intention));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <OnboardingProgress
          step={questionStep(intention, 'taille')}
          total={questionCount(intention)}
        />

        <Text style={styles.title}>Ta taille ?</Text>
        <Text style={styles.subtitle}>
          {hasPosture(intention)
            ? "C'est la référence de ton personnage — on mesure ensuite les cm que ta posture te vole."
            : "Elle sert au calcul de tes besoins nutritionnels réels."}
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, webNoOutline]}
            value={raw}
            onChangeText={(text) => setRaw(text.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="175"
            placeholderTextColor={color.textMuted}
            selectionColor={color.accent}
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
  subtitle: {
    ...type.body,
    marginTop: space.sm,
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
    minWidth: 0,
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
