import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/lib/config';
import type { ActivityLevel, NutritionGoal } from '@/lib/nutrition';
import { restorePurchases, useEntitlement } from '@/lib/purchases';
import { useOnboardingStore } from '@/lib/store';
import { colors, fonts, spacing } from '@/lib/theme';

const GOAL_LABELS: Record<NutritionGoal, string> = {
  masse: 'Prise de masse',
  seche: 'Sèche',
  maintien: 'Maintien',
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentaire: 'Sédentaire',
  leger: 'Léger',
  modere: 'Modéré',
  'tres-actif': 'Très actif',
};

const SUBSCRIPTIONS_URL = Platform.select({
  ios: 'itms-apps://apps.apple.com/account/subscriptions',
  default: 'https://play.google.com/store/account/subscriptions',
});

function Row({
  label,
  value,
  onPress,
  icon,
  labelColor,
  first = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  icon?: ReactNode;
  labelColor?: string;
  first?: boolean;
}) {
  const content = (
    <View style={[styles.row, !first && styles.rowBorder]}>
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {icon}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
    >
      {content}
    </Pressable>
  );
}

/** Onglet Profil — infos, abonnement, légal, données. */
export default function ProfilScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const profile = useOnboardingStore((state) => state.nutritionProfile);
  const setNutritionDraft = useOnboardingStore((state) => state.setNutritionDraft);
  const reset = useOnboardingStore((state) => state.reset);
  const { isPro } = useEntitlement();

  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const tailleCm = profile?.tailleCm ?? answers.heightCm;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleEditNutrition = () => {
    // Pré-remplit le setup avec les valeurs actuelles ; le récap final
    // recalcule les cibles via computeTargets.
    if (profile) {
      setNutritionDraft({
        poidsKg: profile.poidsKg,
        goal: profile.goal,
        activite: profile.activite,
      });
    }
    router.push('/nutrition-setup');
  };

  const handleRestore = async () => {
    setRestoring(true);
    setRestoreFeedback(null);
    const ok = await restorePurchases();
    setRestoring(false);
    setRestoreFeedback(ok ? 'Achats restaurés.' : 'Aucun achat à restaurer.');
  };

  const handleReset = () => {
    reset();
    router.replace('/onboarding');
  };

  const chevron = (
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  );
  const external = (
    <Ionicons name="open-outline" size={15} color={colors.textMuted} />
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profil</Text>

        <Text style={styles.sectionLabel}>Mes infos</Text>
        <Card style={styles.sectionCard}>
          <Row first label="Taille" value={tailleCm ? `${tailleCm} cm` : '—'} />
          <Row
            label="Objectif nutrition"
            value={profile ? GOAL_LABELS[profile.goal] : '—'}
          />
          <Row
            label="Niveau d'activité"
            value={profile ? ACTIVITY_LABELS[profile.activite] : '—'}
          />
          <Row
            label={profile ? 'Modifier' : 'Configurer la nutrition'}
            onPress={handleEditNutrition}
            icon={chevron}
            labelColor={colors.accentLight}
          />
        </Card>

        <Text style={styles.sectionLabel}>Abonnement</Text>
        <Card style={styles.sectionCard}>
          <Row
            first
            label="Statut"
            value={isPro ? 'Abonnement actif' : 'Version gratuite'}
          />
          <Row
            label="Gérer mon abonnement"
            onPress={() => openUrl(SUBSCRIPTIONS_URL)}
            icon={external}
          />
          <Row
            label={restoring ? 'Restauration…' : 'Restaurer mes achats'}
            onPress={restoring ? undefined : handleRestore}
            icon={chevron}
          />
          {restoreFeedback ? (
            <Text style={styles.feedback}>{restoreFeedback}</Text>
          ) : null}
        </Card>

        <Text style={styles.sectionLabel}>Légal</Text>
        <Card style={styles.sectionCard}>
          <Row
            first
            label="Conditions d'utilisation"
            onPress={() => openUrl(TERMS_URL)}
            icon={external}
          />
          <Row
            label="Politique de confidentialité"
            onPress={() => openUrl(PRIVACY_URL)}
            icon={external}
          />
          <Row
            label="Nous contacter"
            onPress={() => openUrl(`mailto:${SUPPORT_EMAIL}`)}
            icon={external}
          />
        </Card>

        <Text style={styles.sectionLabel}>Données</Text>
        <Card style={styles.sectionCard}>
          {confirmReset ? (
            <View>
              <Text style={styles.confirmText}>
                Toutes tes données locales (quiz, nutrition, séances) seront
                effacées. Cette action est définitive.
              </Text>
              <Row
                first
                label="Oui, tout effacer"
                onPress={handleReset}
                labelColor={colors.danger}
              />
              <Row label="Annuler" onPress={() => setConfirmReset(false)} />
            </View>
          ) : (
            <Row
              first
              label="Réinitialiser mes données"
              onPress={() => setConfirmReset(true)}
              labelColor={colors.danger}
              icon={<Ionicons name="trash-outline" size={16} color={colors.danger} />}
            />
          )}
        </Card>

        <Text style={styles.version}>StandTall v{version}</Text>
        <Text style={styles.disclaimer}>
          StandTall fournit des estimations de posture et de nutrition à visée
          informative, pas un avis médical.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontFamily: fonts.display,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    paddingVertical: 0,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  rowValue: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  feedback: {
    color: colors.accentLight,
    fontSize: 13,
    fontFamily: fonts.body,
    paddingBottom: 14,
  },
  confirmText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.body,
    paddingTop: 14,
  },
  version: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
