import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { SectionLabel } from '@/components/SectionLabel';
import { useAppLanguage } from '@/lib/i18n';
import { BADGES, displayStreak, levelProgress } from '@/lib/progress';
import { todayKey, useOnboardingStore } from '@/lib/store';
import {
  borderWidth,
  color,
  duration,
  radius,
  space,
  staggerDelay,
  type,
} from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const ICON_BUTTON_SIZE = 32;
const LEVEL_BAR_HEIGHT = 72;
const BADGE_ICON_SIZE = 30;

/** Icône par famille de badge. */
const BADGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  streak: 'flame',
  sessions: 'barbell',
};

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Récompenses — streak, niveau/rang et grille de badges. */
export default function RecompensesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const progress = useOnboardingStore((state) => state.progress);
  const streak = displayStreak(progress, todayKey());
  const level = levelProgress(progress.xp);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={20} color={color.textMuted} />
        </PressableScale>
        <Text style={styles.title}>{t('progress.rewardsTitle')}</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Série : en cours, record, jokers en réserve. */}
        <Animated.View entering={cascade(0)}>
          <Card style={styles.streakCard}>
            <View style={styles.streakStat}>
              <View style={styles.streakRow}>
                <Ionicons
                  name="flame"
                  size={24}
                  color={streak > 0 ? color.accent : color.textMuted}
                />
                <Text style={styles.streakValue}>{streak}</Text>
              </View>
              <Text style={styles.statLabel}>{t('progress.streakLabel')}</Text>
            </View>
            <View style={styles.streakStat}>
              <Text style={styles.streakValue}>{progress.bestStreak}</Text>
              <Text style={styles.statLabel}>{t('progress.recordLabel')}</Text>
            </View>
            <View style={styles.streakStat}>
              <View style={styles.streakRow}>
                <Ionicons name="snow-outline" size={20} color={color.textSecond} />
                <Text style={styles.streakValue}>{progress.freezes}</Text>
              </View>
              <Text style={styles.statLabel}>{t('progress.freezesLabel')}</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Niveau + rang + barre verticale (signature toise). */}
        <Animated.View entering={cascade(1)}>
          <Card style={styles.levelCard}>
            <View style={styles.levelInfo}>
              <SectionLabel>{t('program.levelLabel')}</SectionLabel>
              <Text style={styles.levelValue}>
                {t('progress.levelShort', { level: level.level })}
              </Text>
              <Text style={styles.rank}>{level.rank[lang]}</Text>
              <Text style={styles.levelMeta}>
                {t('progress.xpToNext', {
                  current: level.current,
                  needed: level.needed,
                  next: level.level + 1,
                })}
              </Text>
            </View>
            <View style={styles.levelBarRail}>
              <View
                style={[styles.levelBarFill, { height: `${Math.round(level.ratio * 100)}%` }]}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Grille de badges : débloqués en lime, verrouillés en gris. */}
        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.badgesLabel}>{t('progress.badges')}</SectionLabel>
          <View style={styles.badgeGrid}>
            {BADGES.map((badge) => {
              const unlocked = progress.badges.includes(badge.id);
              return (
                <Card
                  key={badge.id}
                  style={[styles.badgeCard, unlocked && styles.badgeCardUnlocked]}
                >
                  <Ionicons
                    name={unlocked ? BADGE_ICONS[badge.kind] : 'lock-closed-outline'}
                    size={BADGE_ICON_SIZE}
                    color={unlocked ? color.accent : color.textMuted}
                  />
                  <Text
                    style={[styles.badgeTitle, !unlocked && styles.badgeTitleLocked]}
                  >
                    {badge.titre[lang]}
                  </Text>
                  <Text style={styles.badgeDescription}>{badge.description[lang]}</Text>
                </Card>
              );
            })}
          </View>
        </Animated.View>

        <Text style={styles.footnote}>{t('progress.badgesFootnote')}</Text>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.screenTitle,
  },
  content: {
    paddingBottom: space.xl,
  },
  streakCard: {
    flexDirection: 'row',
    padding: space.lg,
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
    gap: space.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  streakValue: {
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    ...type.sectionLabel,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    marginTop: space.md,
    padding: space.lg,
  },
  levelInfo: {
    flex: 1,
    gap: space.xs,
  },
  levelValue: {
    ...type.statNumberSmall,
  },
  rank: {
    ...type.bodyMedium,
    color: color.accent,
  },
  levelMeta: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  levelBarRail: {
    width: 10,
    height: LEVEL_BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: color.railOff,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  levelBarFill: {
    width: '100%',
    borderRadius: radius.pill,
    backgroundColor: color.accent,
  },
  badgesLabel: {
    marginTop: space.xl,
    marginBottom: space.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  badgeCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: space.sm,
    padding: space.lg,
  },
  badgeCardUnlocked: {
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
  },
  badgeTitle: {
    ...type.bodyMedium,
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: color.textMuted,
  },
  badgeDescription: {
    ...type.meta,
    textAlign: 'center',
  },
  footnote: {
    ...type.meta,
    textAlign: 'center',
    marginTop: space.xl,
  },
});
