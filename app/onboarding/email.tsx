import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { setReferralAttribute } from '@/lib/purchases';
import { normalizeReferralCode, validateReferralCode } from '@/lib/referral';
import { useOnboardingStore } from '@/lib/store';
import { borderWidth, color, radius, space, type, webNoOutline } from '@/theme/tokens';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Écran 8 — capture email (sauvegarde du bilan) + code de parrainage
 * optionnel. Ne bloque jamais : « Passer » discret reste disponible.
 */
export default function EmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const storedEmail = useOnboardingStore((state) => state.answers.email);
  const storedName = useOnboardingStore((state) => state.answers.firstName);
  const storedCode = useOnboardingStore((state) => state.referralCode);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const setReferralCode = useOnboardingStore((state) => state.setReferralCode);

  const [firstName, setFirstName] = useState(storedName ?? '');
  const [email, setEmail] = useState(storedEmail ?? '');
  const [codeOpen, setCodeOpen] = useState(Boolean(storedCode));
  const [rawCode, setRawCode] = useState(storedCode ?? '');
  const [codeState, setCodeState] = useState<'idle' | 'checking' | 'invalid'>('idle');

  const emailValid = EMAIL_PATTERN.test(email.trim());

  /** Traite le code éventuel puis avance — jamais bloquant. */
  const finish = async (saveEmail: boolean) => {
    // Le prénom personnalise l'accueil/profil — gardé même en « Passer ».
    if (firstName.trim()) setAnswer('firstName', firstName.trim());
    if (saveEmail) setAnswer('email', email.trim());
    const code = normalizeReferralCode(rawCode);
    if (code && codeState !== 'invalid') {
      setCodeState('checking');
      const valid = await validateReferralCode(code);
      if (valid === false) {
        setCodeState('invalid');
        return; // l'utilisateur corrige, ou continue (le code sera ignoré)
      }
      setCodeState('idle');
      setReferralCode(code);
      void setReferralAttribute(code);
    } else if (!code) {
      setReferralCode(undefined);
    }
    router.push('/onboarding/resultat');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>{t('onboarding.emailTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.emailSubtitle')}</Text>

        <TextInput
          style={[styles.input, webNoOutline]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t('onboarding.firstNamePlaceholder')}
          placeholderTextColor={color.textMuted}
          selectionColor={color.accent}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="given-name"
          maxLength={30}
          accessibilityLabel={t('onboarding.firstNameA11y')}
        />

        <TextInput
          style={[styles.input, styles.inputEmail, webNoOutline]}
          value={email}
          onChangeText={setEmail}
          placeholder={t('onboarding.emailPlaceholder')}
          placeholderTextColor={color.textMuted}
          selectionColor={color.accent}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          accessibilityLabel={t('onboarding.emailA11y')}
        />

        {/* Code de parrainage (optionnel) — replié tant que non utilisé. */}
        {codeOpen ? (
          <View style={styles.referralBlock}>
            <Text style={styles.referralLabel}>{t('onboarding.referralLabel')}</Text>
            <TextInput
              style={[styles.referralInput, webNoOutline]}
              value={rawCode}
              onChangeText={(text) => {
                setRawCode(text.toUpperCase());
                setCodeState('idle');
              }}
              placeholder={t('onboarding.referralPlaceholder')}
              placeholderTextColor={color.textMuted}
              selectionColor={color.accent}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={24}
              accessibilityLabel={t('onboarding.referralA11y')}
            />
            {codeState === 'invalid' ? (
              <Text style={styles.referralHint}>{t('onboarding.referralInvalid')}</Text>
            ) : null}
          </View>
        ) : (
          <Pressable
            onPress={() => setCodeOpen(true)}
            accessibilityRole="button"
            style={styles.referralToggle}
          >
            <Ionicons name="gift-outline" size={16} color={color.textSecond} />
            <Text style={styles.referralToggleLabel}>{t('onboarding.referralToggle')}</Text>
          </Pressable>
        )}

        <View style={styles.footer}>
          <PrimaryButton
            label={
              codeState === 'checking'
                ? t('onboarding.emailChecking')
                : t('onboarding.emailCta')
            }
            disabled={!emailValid || codeState === 'checking'}
            onPress={() => void finish(true)}
          />
          <Pressable
            onPress={() => void finish(false)}
            disabled={codeState === 'checking'}
            accessibilityRole="button"
            style={styles.skip}
          >
            <Text style={styles.skipLabel}>{t('common.skip')}</Text>
          </Pressable>
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
  input: {
    ...type.bodyMedium,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    marginTop: space.xxl,
  },
  inputEmail: {
    marginTop: space.md,
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
