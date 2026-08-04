import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useOnboardingStore } from '@/lib/store';
import { borderWidth, color, radius, space, type, webNoOutline } from '@/theme/tokens';

const MIN_KG = 30;
const MAX_KG = 250;

/** Setup nutrition 1/4 — poids. */
export default function WeightScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
        <Text style={styles.title}>{t('nutrition.setupWeightTitle')}</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, webNoOutline]}
            value={raw}
            onChangeText={(text) => setRaw(text.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="72"
            placeholderTextColor={color.textMuted}
            selectionColor={color.accent}
            maxLength={3}
            autoFocus
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={t('common.continue')}
            disabled={!isValid}
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
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.sm,
  },
});
