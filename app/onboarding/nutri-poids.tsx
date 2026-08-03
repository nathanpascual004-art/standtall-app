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
import { questionCount, questionStep, routeAfterPoids } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';
import { borderWidth, color, radius, space, type, webNoOutline } from '@/theme/tokens';

const MIN_KG = 30;
const MAX_KG = 250;

/** Nutrition — poids actuel (kg) pour Mifflin-St Jeor + poids cible optionnel. */
export default function NutriPoidsScreen() {
  const router = useRouter();
  const intention = useOnboardingStore((state) => state.answers.intention);
  const stored = useOnboardingStore((state) => state.answers.poidsKg);
  const storedCible = useOnboardingStore((state) => state.answers.poidsCibleKg);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const [raw, setRaw] = useState(stored ? String(stored) : '');
  const [rawCible, setRawCible] = useState(storedCible ? String(storedCible) : '');

  const parsed = Number.parseInt(raw, 10);
  const isValid = Number.isFinite(parsed) && parsed >= MIN_KG && parsed <= MAX_KG;

  const parsedCible = Number.parseInt(rawCible, 10);
  const cibleValid =
    Number.isFinite(parsedCible) && parsedCible >= MIN_KG && parsedCible <= MAX_KG;

  const handleContinue = () => {
    if (!isValid) return;
    setAnswer('poidsKg', parsed);
    setAnswer('poidsCibleKg', cibleValid ? parsedCible : undefined);
    router.push(routeAfterPoids(intention));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <OnboardingProgress
          step={questionStep(intention, 'poids')}
          total={questionCount(intention)}
        />

        <Text style={styles.title}>Ton poids actuel ?</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, webNoOutline]}
            value={raw}
            onChangeText={(text) => setRaw(text.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="70"
            placeholderTextColor={color.textMuted}
            selectionColor={color.accent}
            maxLength={3}
            autoFocus
            accessibilityLabel="Poids actuel"
          />
          <Text style={styles.unit}>kg</Text>
        </View>
        {raw.length >= 3 && !isValid ? (
          <Text style={styles.hint}>
            Entre un poids entre {MIN_KG} et {MAX_KG} kg.
          </Text>
        ) : null}

        <Text style={styles.cibleLabel}>Poids cible (optionnel)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, webNoOutline]}
            value={rawCible}
            onChangeText={(text) => setRawCible(text.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="—"
            placeholderTextColor={color.textMuted}
            selectionColor={color.accent}
            maxLength={3}
            accessibilityLabel="Poids cible optionnel"
          />
          <Text style={styles.unit}>kg</Text>
        </View>
        <Text style={styles.cibleHint}>
          Juste pour situer ton cap — aucun rythme ni résultat promis.
        </Text>

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
    marginTop: space.lg,
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
  cibleLabel: {
    ...type.sectionLabel,
    marginTop: space.xl,
  },
  cibleHint: {
    ...type.meta,
    marginTop: space.sm,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.sm,
  },
});
