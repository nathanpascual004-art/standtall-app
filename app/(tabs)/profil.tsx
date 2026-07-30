import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionLabel } from '@/components/SectionLabel';
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/lib/config';
import type { ActivityLevel, NutritionGoal } from '@/lib/nutrition';
import { restorePurchases, useEntitlement } from '@/lib/purchases';
import { useOnboardingStore } from '@/lib/store';
import {
  borderWidth,
  color,
  duration,
  radius,
  space,
  staggerDelay,
  type,
} from '@/theme/tokens';

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

/** Padding vertical de rangée — layout local (pas un token de design). */
const ROW_PADDING_V = 14;

/** Apparition en cascade des sections (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

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
    <PressableScale onPress={onPress} accessibilityRole="button" haptic="selection">
      {content}
    </PressableScale>
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
    <Ionicons name="chevron-forward" size={16} color={color.textMuted} />
  );
  const external = (
    <Ionicons name="open-outline" size={15} color={color.textMuted} />
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profil</Text>

        <Animated.View entering={cascade(0)}>
          <SectionLabel style={styles.sectionLabel}>Mes infos</SectionLabel>
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
              labelColor={color.accent}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(1)}>
          <SectionLabel style={styles.sectionLabel}>Abonnement</SectionLabel>
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
        </Animated.View>

        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.sectionLabel}>Légal</SectionLabel>
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
        </Animated.View>

        <Animated.View entering={cascade(3)}>
          <SectionLabel style={styles.sectionLabel}>Données</SectionLabel>
          <Card style={styles.sectionCard}>
            {confirmReset ? (
              <View style={styles.confirmBlock}>
                <Text style={styles.confirmText}>
                  Toutes tes données locales (quiz, nutrition, séances) seront
                  effacées. Cette action est définitive.
                </Text>
                <PressableScale
                  onPress={handleReset}
                  haptic="impact"
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.dangerButton,
                    pressed && styles.dangerButtonPressed,
                  ]}
                >
                  <Text style={styles.dangerButtonLabel}>Oui, tout effacer</Text>
                </PressableScale>
                <PrimaryButton
                  label="Annuler"
                  variant="secondary"
                  onPress={() => setConfirmReset(false)}
                />
              </View>
            ) : (
              <Row
                first
                label="Réinitialiser mes données"
                onPress={() => setConfirmReset(true)}
                labelColor={color.danger}
                icon={<Ionicons name="trash-outline" size={16} color={color.danger} />}
              />
            )}
          </Card>
        </Animated.View>

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
    backgroundColor: color.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.screen,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  title: {
    ...type.screenTitle,
  },
  sectionLabel: {
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  sectionCard: {
    paddingVertical: 0,
    paddingHorizontal: space.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: ROW_PADDING_V,
  },
  rowBorder: {
    borderTopWidth: borderWidth.hairline,
    borderTopColor: color.border,
  },
  rowLabel: {
    ...type.body,
    flex: 1,
  },
  rowValue: {
    ...type.bodyMedium,
  },
  feedback: {
    ...type.meta,
    color: color.accent,
    paddingBottom: ROW_PADDING_V,
  },
  confirmBlock: {
    paddingVertical: ROW_PADDING_V,
    gap: space.md,
  },
  confirmText: {
    ...type.body,
  },
  // Bouton destructif sobre : bordure + texte danger, jamais de fond plein.
  dangerButton: {
    borderWidth: borderWidth.hairline,
    borderColor: color.danger,
    borderRadius: radius.button,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonPressed: {
    backgroundColor: color.surface,
  },
  dangerButtonLabel: {
    ...type.button,
    color: color.danger,
  },
  version: {
    ...type.meta,
    textAlign: 'center',
    marginTop: space.xxl,
  },
  disclaimer: {
    ...type.meta,
    textAlign: 'center',
    marginTop: space.sm,
  },
});
