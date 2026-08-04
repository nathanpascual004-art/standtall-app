import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { useOnboardingStore, type Gender } from '@/lib/store';
import { borderWidth, color, radius, space, type, webNoOutline } from '@/theme/tokens';

const GENDERS: { value: Gender; labelKey: string }[] = [
  { value: 'homme', labelKey: 'onboarding.sexMale' },
  { value: 'femme', labelKey: 'onboarding.sexFemale' },
  { value: 'autre', labelKey: 'nutrition.setupGenderOther' },
];

/**
 * Setup nutrition — infos manquantes (affiché seulement si taille, âge ou
 * sexe n'ont pas été captés par le quiz d'onboarding).
 */
export default function ComplementScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
          <Text style={styles.title}>{t('nutrition.setupMoreInfo')}</Text>

          {needHeight ? (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, webNoOutline]}
                value={taille}
                onChangeText={(text) => setTaille(text.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder={t('profile.height')}
                placeholderTextColor={color.textMuted}
                selectionColor={color.accent}
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
                placeholder={t('nutrition.setupAgePlaceholder')}
                placeholderTextColor={color.textMuted}
                selectionColor={color.accent}
              />
              <Text style={styles.unit}>{t('nutrition.setupAgeUnit')}</Text>
            </View>
          ) : null}

          {needGender ? (
            <View style={styles.options}>
              {GENDERS.map((gender) => (
                <QuizOption
                  key={gender.value}
                  label={t(gender.labelKey)}
                  selected={sexe === gender.value}
                  onPress={() => setSexe(gender.value)}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={t('common.continue')}
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
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
    paddingVertical: space.lg,
  },
  unit: {
    ...type.body,
  },
  options: {
    marginTop: space.lg,
    gap: space.md,
  },
  footer: {
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
});
