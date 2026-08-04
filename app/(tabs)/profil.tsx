import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionLabel } from '@/components/SectionLabel';
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/lib/config';
import i18n, { useAppLanguage, type AppLanguage } from '@/lib/i18n';
import type { ActivityLevel, NutritionGoal } from '@/lib/nutrition';
import { levelProgress } from '@/lib/progress';
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

const GOAL_KEYS: Record<NutritionGoal, string> = {
  masse: 'profile.goalMass',
  seche: 'profile.goalCut',
  maintien: 'profile.goalMaintain',
};

const ACTIVITY_KEYS: Record<ActivityLevel, string> = {
  sedentaire: 'profile.activitySedentary',
  leger: 'profile.activityLight',
  modere: 'profile.activityModerate',
  'tres-actif': 'profile.activityVeryActive',
};

/** Noms propres des langues — jamais traduits. */
const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  fr: 'Français',
  en: 'English',
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
  const { t } = useTranslation();
  const answers = useOnboardingStore((state) => state.answers);
  const profile = useOnboardingStore((state) => state.nutritionProfile);
  const setNutritionDraft = useOnboardingStore((state) => state.setNutritionDraft);
  const reset = useOnboardingStore((state) => state.reset);
  const setLanguage = useOnboardingStore((state) => state.setLanguage);
  const progress = useOnboardingStore((state) => state.progress);
  const level = levelProgress(progress.xp);
  const firstName = answers.firstName?.trim();
  const { isPro } = useEntitlement();

  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const activeLang = useAppLanguage();

  /** Choix manuel : persiste + bascule l'UI en direct, sans redémarrage. */
  const chooseLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    void i18n.changeLanguage(lang);
    setLangOpen(false);
  };

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
    setRestoreFeedback(ok ? t('profile.restored') : t('paywall.restoreError'));
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('common.tabProfile')}</Text>
          <PressableScale
            onPress={handleEditNutrition}
            accessibilityRole="button"
            accessibilityLabel={t('program.settingsA11y')}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={20} color={color.textMuted} />
          </PressableScale>
        </View>

        {/* Bloc identité. */}
        <Animated.View entering={cascade(0)}>
          <PressableScale
            onPress={() => router.push('/recompenses')}
            accessibilityRole="button"
            accessibilityLabel={t('profile.identityA11y')}
          >
            <Card style={styles.identityCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {(firstName?.[0] ?? 'T').toUpperCase()}
                </Text>
              </View>
              <View style={styles.identityText}>
                <Text style={styles.identityName}>
                  {firstName || t('profile.defaultName')}
                </Text>
                <Text style={styles.identityLevel}>
                  {t('common.levelN', { level: level.level })} · {level.rank[activeLang]}
                </Text>
              </View>
              {chevron}
            </Card>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={cascade(1)}>
          <SectionLabel style={styles.sectionLabel}>{t('profile.myInfo')}</SectionLabel>
          <Card style={styles.sectionCard}>
            <Row
              first
              label={t('profile.height')}
              value={tailleCm ? `${tailleCm} cm` : '—'}
            />
            <Row
              label={t('profile.nutritionGoal')}
              value={profile ? t(GOAL_KEYS[profile.goal]) : '—'}
            />
            <Row
              label={t('profile.activityLevel')}
              value={profile ? t(ACTIVITY_KEYS[profile.activite]) : '—'}
            />
            <Row
              label={t('profile.editInfo')}
              onPress={handleEditNutrition}
              icon={chevron}
              labelColor={color.accent}
            />
          </Card>

          {/* Langue — sélecteur FR/EN, bascule en direct. */}
          <SectionLabel style={styles.sectionLabel}>
            {t('profile.preferences')}
          </SectionLabel>
          <Card style={styles.sectionCard}>
            <Row
              first
              label={t('profile.language')}
              value={LANGUAGE_NAMES[activeLang]}
              onPress={() => setLangOpen((open) => !open)}
              icon={
                <Ionicons
                  name={langOpen ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={color.textMuted}
                />
              }
            />
            {langOpen
              ? (Object.keys(LANGUAGE_NAMES) as AppLanguage[]).map((lang) => (
                  <Row
                    key={lang}
                    label={LANGUAGE_NAMES[lang]}
                    onPress={() => chooseLanguage(lang)}
                    labelColor={lang === activeLang ? color.accent : undefined}
                    icon={
                      lang === activeLang ? (
                        <Ionicons name="checkmark" size={16} color={color.accent} />
                      ) : undefined
                    }
                  />
                ))
              : null}
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.sectionLabel}>
            {t('profile.progression')}
          </SectionLabel>
          <Card style={styles.sectionCard}>
            <Row
              first
              label={t('profile.bestStreak')}
              value={`${progress.bestStreak} ${progress.bestStreak > 1 ? t('common.days') : t('common.day')}`}
            />
            <Row label={t('profile.sessionsDone')} value={String(progress.totalSessions)} />
            <Row
              label={t('profile.seeStats')}
              onPress={() => router.push('/recompenses')}
              icon={chevron}
              labelColor={color.accent}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.sectionLabel}>
            {t('profile.subscription')}
          </SectionLabel>
          <Card style={styles.sectionCard}>
            <Row
              first
              label={t('profile.status')}
              value={isPro ? t('profile.premium') : t('profile.freeVersion')}
            />
            {isPro ? (
              <Row
                label={t('profile.manageSubscription')}
                onPress={() => openUrl(SUBSCRIPTIONS_URL)}
                icon={external}
              />
            ) : (
              <Row
                label={t('profile.discoverPremium')}
                onPress={() => router.push('/paywall')}
                icon={chevron}
                labelColor={color.accent}
              />
            )}
            <Row
              label={restoring ? t('profile.restoring') : t('paywall.restore')}
              onPress={restoring ? undefined : handleRestore}
              icon={chevron}
            />
            {restoreFeedback ? (
              <Text style={styles.feedback}>{restoreFeedback}</Text>
            ) : null}
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(3)}>
          <SectionLabel style={styles.sectionLabel}>{t('profile.legal')}</SectionLabel>
          <Card style={styles.sectionCard}>
            <Row
              first
              label={t('profile.termsOfUse')}
              onPress={() => openUrl(TERMS_URL)}
              icon={external}
            />
            <Row
              label={t('profile.privacyPolicy')}
              onPress={() => openUrl(PRIVACY_URL)}
              icon={external}
            />
            <Row
              label={t('profile.contactUs')}
              onPress={() => openUrl(`mailto:${SUPPORT_EMAIL}`)}
              icon={external}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(4)}>
          <SectionLabel style={styles.sectionLabel}>{t('profile.data')}</SectionLabel>
          <Card style={styles.sectionCard}>
            {confirmReset ? (
              <View style={styles.confirmBlock}>
                <Text style={styles.confirmText}>{t('profile.resetConfirmText')}</Text>
                <PressableScale
                  onPress={handleReset}
                  haptic="impact"
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.dangerButton,
                    pressed && styles.dangerButtonPressed,
                  ]}
                >
                  <Text style={styles.dangerButtonLabel}>{t('profile.resetConfirmCta')}</Text>
                </PressableScale>
                <PrimaryButton
                  label={t('common.cancel')}
                  variant="secondary"
                  onPress={() => setConfirmReset(false)}
                />
              </View>
            ) : (
              <Row
                first
                label={t('profile.resetData')}
                onPress={() => setConfirmReset(true)}
                labelColor={color.danger}
                icon={<Ionicons name="trash-outline" size={16} color={color.danger} />}
              />
            )}
          </Card>
        </Animated.View>

        <Text style={styles.version}>StandTall v{version}</Text>
        <Text style={styles.disclaimer}>{t('profile.disclaimer')}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
    padding: space.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    ...type.cardTitle,
    color: color.accent,
  },
  identityText: {
    flex: 1,
    gap: space.xs / 2,
  },
  identityName: {
    ...type.cardTitle,
  },
  identityLevel: {
    ...type.meta,
    color: color.accent,
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
