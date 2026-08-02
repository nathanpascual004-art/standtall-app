import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
  const storedEmail = useOnboardingStore((state) => state.answers.email);
  const storedCode = useOnboardingStore((state) => state.referralCode);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const setReferralCode = useOnboardingStore((state) => state.setReferralCode);

  const [email, setEmail] = useState(storedEmail ?? '');
  const [codeOpen, setCodeOpen] = useState(Boolean(storedCode));
  const [rawCode, setRawCode] = useState(storedCode ?? '');
  const [codeState, setCodeState] = useState<'idle' | 'checking' | 'invalid'>('idle');

  const emailValid = EMAIL_PATTERN.test(email.trim());

  /** Traite le code éventuel puis avance — jamais bloquant. */
  const finish = async (saveEmail: boolean) => {
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
        <Text style={styles.title}>Sauvegarde tes résultats</Text>
        <Text style={styles.subtitle}>
          Où on t'envoie ton bilan complet ? Tu retrouveras ton plan et ta
          projection à tout moment.
        </Text>

        <TextInput
          style={[styles.input, webNoOutline]}
          value={email}
          onChangeText={setEmail}
          placeholder="ton@email.com"
          placeholderTextColor={color.textMuted}
          selectionColor={color.accent}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          accessibilityLabel="Adresse email"
        />

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
              selectionColor={color.accent}
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
            label={codeState === 'checking' ? 'Vérification…' : 'Recevoir mon bilan'}
            disabled={!emailValid || codeState === 'checking'}
            onPress={() => void finish(true)}
          />
          <Pressable
            onPress={() => void finish(false)}
            disabled={codeState === 'checking'}
            accessibilityRole="button"
            style={styles.skip}
          >
            <Text style={styles.skipLabel}>Passer</Text>
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
