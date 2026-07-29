import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { useOnboardingStore, type Gender } from '@/lib/store';
import { colors, fonts, radius, spacing } from '@/lib/theme';

const webNoOutline: TextStyle | null =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
];

/**
 * Setup nutrition — infos manquantes (affiché seulement si taille, âge ou
 * sexe n'ont pas été captés par le quiz d'onboarding).
 */
export default function ComplementScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const draft = useOnboardingStore((state) => state.nutritionDraft);
  const setNutritionDraft = useOnboardingStore((state) => state.setNutritionDraft);

  const needHeight = !answers.heightCm && !draft.tailleCm;
  const needAge = !answers.ageRange && !draft.age;
  const needGender = !answers.gender && !draft.sexe;

  const [taille, setTaille] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState<Gender | undefined>(undefined);

  const tailleValue = Number.parseInt(taille, 10);
  const ageValue = Number.parseInt(age, 10);
  const tailleOk = !needHeight || (tailleValue >= 100 && tailleValue <= 230);
  const ageOk = !needAge || (ageValue >= 13 && ageValue <= 100);
  const sexeOk = !needGender || sexe !== undefined;

  const handleContinue = () => {
    if (!tailleOk || !ageOk || !sexeOk) return;
    setNutritionDraft({
      ...(needHeight ? { tailleCm: tailleValue } : {}),
      ...(needAge ? { age: ageValue } : {}),
      ...(needGender && sexe ? { sexe } : {}),
    });
    router.push('/nutrition-setup/recap');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <OnboardingProgress step={3} total={4} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Encore quelques infos</Text>

          {needHeight ? (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, webNoOutline]}
                value={taille}
                onChangeText={(text) => setTaille(text.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="Taille"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
          ) : null}

          {needAge ? (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, webNoOutline]}
                value={age}
                onChangeText={(text) => setAge(text.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="Âge"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.unit}>ans</Text>
            </View>
          ) : null}

          {needGender ? (
            <View style={styles.options}>
              {GENDERS.map((gender) => (
                <QuizOption
                  key={gender.value}
                  label={gender.label}
                  selected={sexe === gender.value}
                  onPress={() => setSexe(gender.value)}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continuer"
            disabled={!tailleOk || !ageOk || !sexeOk}
            onPress={handleContinue}
          />
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
    marginTop: spacing.lg,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.medium,
    paddingVertical: 16,
  },
  unit: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  options: {
    marginTop: spacing.lg,
    gap: 10,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
