import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore } from '@/lib/store';
import { colors, fonts, radius, spacing } from '@/lib/theme';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
};

/**
 * Étape 10/14 — photo de profil (optionnel).
 * On stocke uniquement l'URI pour l'instant ; l'analyse de courbure vient plus tard.
 */
export default function ProfilePhotoScreen() {
  const router = useRouter();
  const photoUri = useOnboardingStore((state) => state.answers.profilePhotoUri);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  const goNext = () => router.push('/onboarding/step11');

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      setAnswer('profilePhotoUri', result.assets[0].uri);
    }
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      setAnswer('profilePhotoUri', result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={10} total={TOTAL_ONBOARDING_STEPS} />

      <Text style={styles.title}>Photo de profil (optionnel)</Text>
      <Text style={styles.subtitle}>On analyse ta courbure. Tu peux passer.</Text>

      <View style={styles.options}>
        <QuizOption
          label="Prendre une photo de côté"
          icon={<Ionicons name="camera-outline" size={22} color={colors.textMuted} />}
          onPress={handleTakePhoto}
        />
        <QuizOption
          label="Importer une photo"
          icon={<Ionicons name="image-outline" size={22} color={colors.textMuted} />}
          onPress={handlePickPhoto}
        />
      </View>

      {photoUri ? (
        <View style={styles.previewCard}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Text style={styles.previewLabel}>Photo ajoutée</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton label="Continuer" disabled={!photoUri} onPress={goNext} />
        <Pressable onPress={goNext} accessibilityRole="button" style={styles.skip}>
          <Text style={styles.skipLabel}>Passer</Text>
        </Pressable>
      </View>
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
    lineHeight: 34,
    fontFamily: fonts.display,
    marginTop: spacing.xxl,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
    marginTop: spacing.sm,
  },
  options: {
    marginTop: spacing.xxl,
    gap: 10,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  previewLabel: {
    color: colors.accentLight,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fonts.body,
  },
});
