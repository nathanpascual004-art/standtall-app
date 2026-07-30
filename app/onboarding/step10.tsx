import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandImage } from '@/components/BrandImage';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore } from '@/lib/store';
import { color, space, type } from '@/theme/tokens';

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
          icon={<Ionicons name="camera-outline" size={22} color={color.textSecond} />}
          onPress={handleTakePhoto}
        />
        <QuizOption
          label="Importer une photo"
          icon={<Ionicons name="image-outline" size={22} color={color.textSecond} />}
          onPress={handlePickPhoto}
        />
      </View>

      {/* Zone d'aperçu : placeholder caméra tant qu'aucune photo n'est prise. */}
      <BrandImage
        source={photoUri ? { uri: photoUri } : null}
        icon="camera-outline"
        scrim={Boolean(photoUri)}
        style={styles.preview}
      >
        {photoUri ? <Text style={styles.previewLabel}>Photo ajoutée</Text> : null}
      </BrandImage>

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
    backgroundColor: color.bg,
    paddingHorizontal: space.screen,
    paddingTop: space.md,
  },
  title: {
    ...type.question,
    marginTop: space.xxl,
  },
  subtitle: {
    ...type.body,
    marginTop: space.sm,
  },
  options: {
    marginTop: space.xxl,
    gap: space.md,
  },
  preview: {
    marginTop: space.lg,
  },
  previewLabel: {
    ...type.bodyMedium,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.sm,
    gap: space.sm,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: space.md,
  },
  skipLabel: {
    ...type.body,
  },
});
