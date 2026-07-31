import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandImage } from '@/components/BrandImage';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { setReferralAttribute } from '@/lib/purchases';
import { normalizeReferralCode, validateReferralCode } from '@/lib/referral';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore } from '@/lib/store';
import { borderWidth, color, radius, space, type, webNoOutline } from '@/theme/tokens';

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
  const storedCode = useOnboardingStore((state) => state.referralCode);
  const setReferralCode = useOnboardingStore((state) => state.setReferralCode);

  // Champ « code de parrainage » replié par défaut — optionnel, jamais bloquant.
  const [codeOpen, setCodeOpen] = useState(Boolean(storedCode));
  const [rawCode, setRawCode] = useState(storedCode ?? '');
  const [codeState, setCodeState] = useState<'idle' | 'checking' | 'invalid'>('idle');

  /** Valide le code éventuel puis avance. Ne bloque JAMAIS l'onboarding. */
  const goNext = async () => {
    const code = normalizeReferralCode(rawCode);
    if (!code || codeState === 'invalid') {
      // Champ vide, ou code déjà signalé inconnu : on continue sans code.
      setReferralCode(undefined);
      router.push('/onboarding/step11');
      return;
    }
    setCodeState('checking');
    const valid = await validateReferralCode(code);
    if (valid === false) {
      // Code inconnu : petit message, l'utilisateur corrige ou continue sans.
      setCodeState('invalid');
      return;
    }
    // valid === null (hors-ligne / non configuré) : on garde le code sans
    // bloquer — un code réellement inconnu sera ignoré par le serveur.
    setCodeState('idle');
    setReferralCode(code);
    void setReferralAttribute(code);
    router.push('/onboarding/step11');
  };

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

      {/* Code de parrainage (optionnel) — replié tant que non utilisé. */}
      {codeOpen ? (
        <View style={styles.referralBlock}>
          <Text style={styles.referralLabel}>Code de parrainage (optionnel)</Text>
          <TextInput
            style={[styles.referralInput, webNoOutline]}
            value={rawCode}
            onChangeText={(text) => {
              setRawCode(text.toUpperCase());
              setCodeState('idle');
            }}
            placeholder="EX. JULES23"
            placeholderTextColor={color.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={24}
            accessibilityLabel="Code de parrainage"
          />
          {codeState === 'invalid' ? (
            <Text style={styles.referralHint}>
              Code inconnu — corrige-le, ou continue sans.
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          onPress={() => setCodeOpen(true)}
          accessibilityRole="button"
          style={styles.referralToggle}
        >
          <Ionicons name="gift-outline" size={16} color={color.textSecond} />
          <Text style={styles.referralToggleLabel}>J'ai un code de parrainage</Text>
        </Pressable>
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label={codeState === 'checking' ? 'Vérification…' : 'Continuer'}
          disabled={!photoUri || codeState === 'checking'}
          onPress={goNext}
        />
        <Pressable
          onPress={goNext}
          disabled={codeState === 'checking'}
          accessibilityRole="button"
          style={styles.skip}
        >
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
  referralToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    marginTop: space.lg,
    paddingVertical: space.sm,
  },
  referralToggleLabel: {
    ...type.meta,
    color: color.textSecond,
  },
  referralBlock: {
    marginTop: space.lg,
    gap: space.xs,
  },
  referralLabel: {
    ...type.meta,
  },
  referralInput: {
    ...type.bodyMedium,
    backgroundColor: color.surface,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    letterSpacing: 1,
  },
  referralHint: {
    ...type.meta,
    color: color.danger,
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
