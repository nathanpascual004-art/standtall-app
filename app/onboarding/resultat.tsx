import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatCard } from '@/components/StatCard';
import { Toise } from '@/components/Toise';
import { hasNutrition, hasPosture } from '@/lib/onboarding-flow';
import { computePostureResult } from '@/lib/posture';
import { useOnboardingStore } from '@/lib/store';
import { color, font, radius, space, type } from '@/theme/tokens';

/**
 * Écran 9 — résultat / reveal verrouillé, adapté à l'intention.
 * Gratuit (preuve de réel) : score + level + percentile.
 * Verrouillé : stature redressée exacte, cm récupérables, programme,
 * et (si intention nutrition) l'objectif calorique + macros.
 *
 * IMPORTANT : les valeurs verrouillées ne sont JAMAIS rendues — on affiche
 * des masques (« •••,• cm »). Un flou seul reste lisible sur grand écran.
 * Chaque bloc verrouillé est tappable et mène au paywall.
 */
export default function ResultScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const result = computePostureResult(answers);
  const posture = hasPosture(answers.intention);
  const nutrition = hasNutrition(answers.intention);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>
            {posture ? 'Ton plan pour reprendre ta taille est prêt' : 'Ton plan est prêt'}
          </Text>
          <Text style={styles.headline}>
            {posture ? 'Voici ta vraie stature' : 'Ton plan nutrition'}
          </Text>
        </View>

        {posture ? (
          <>
            <View style={styles.statRow}>
              <StatCard
                label="Stature avachi"
                value={`${answers.heightCm ?? '—'} cm`}
                style={styles.statCard}
              />
              <Pressable
                onPress={() => router.push('/paywall')}
                accessibilityRole="button"
                accessibilityLabel="Débloquer la stature redressée"
                style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}
              >
                <StatCard label="Bien redressé" value="•••,• cm" locked style={styles.fill} />
              </Pressable>
            </View>

            <Card style={styles.gaugeCard}>
              <Toise
                score={result.postureScore}
                label="Score de posture"
                subtext={`Posture — ${result.level}`}
              />
              <Text style={styles.percentile}>
                Meilleure posture que{' '}
                <Text style={styles.percentileValue}>{result.postureScore}%</Text> des
                gens de ton âge
              </Text>
            </Card>

            <Pressable
              onPress={() => router.push('/paywall')}
              accessibilityRole="button"
              accessibilityLabel="Débloquer les centimètres récupérables"
              style={({ pressed }) => (pressed ? styles.pressed : null)}
            >
              <Card style={styles.teaserCard}>
                <View style={styles.teaserRow}>
                  <Text style={styles.teaserText}>
                    Tu récupères <Text style={styles.blurredInline}>•,• cm</Text> en
                    te redressant
                  </Text>
                  <Ionicons name="lock-closed" size={16} color={color.textSecond} />
                </View>
              </Card>
            </Pressable>

            <Pressable
              onPress={() => router.push('/paywall')}
              accessibilityRole="button"
              accessibilityLabel="Débloquer le programme personnalisé"
              style={({ pressed }) => (pressed ? styles.pressed : null)}
            >
              <Card style={styles.teaserCard}>
                <View style={styles.teaserRow}>
                  <Text style={styles.teaserTitle}>
                    Ton programme d'étirements personnalisé
                  </Text>
                  <Ionicons name="lock-closed" size={16} color={color.textSecond} />
                </View>
                <View style={styles.programLines}>
                  <Text style={styles.blurredLine}>•••••••••••• ••••••• — • min</Text>
                  <Text style={styles.blurredLine}>••••••••• •••••••• — • min</Text>
                  <Text style={styles.blurredLine}>•••••••••• ••••• — • min</Text>
                </View>
              </Card>
            </Pressable>
          </>
        ) : null}

        {nutrition ? (
          <Pressable
            onPress={() => router.push('/paywall')}
            accessibilityRole="button"
            accessibilityLabel="Débloquer le plan nutrition"
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <Card style={styles.teaserCard}>
              <View style={styles.teaserRow}>
                <Text style={styles.teaserTitle}>Ton plan nutrition sur mesure</Text>
                <Ionicons name="lock-closed" size={16} color={color.textSecond} />
              </View>
              <View style={styles.programLines}>
                <Text style={styles.teaserText}>
                  Objectif : <Text style={styles.blurredInline}>• ••• kcal</Text> / jour
                </Text>
                <Text style={styles.blurredLine}>Protéines ••• g · Glucides ••• g · Lipides •• g</Text>
              </View>
            </Card>
          </Pressable>
        ) : null}

        <View style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <Ionicons name="lock-open-outline" size={18} color={color.accent} />
          </View>
          <Text style={styles.benefitText}>
            {posture && nutrition
              ? 'Débloque ta stature redressée, ton programme et ton plan nutrition'
              : posture
                ? 'Débloque ta stature redressée + ton programme perso'
                : 'Débloque ton objectif calorique + tes macros sur mesure'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Débloquer mon résultat"
          onPress={() => router.push('/paywall')}
        />
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: space.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: space.xl,
    gap: space.xs,
  },
  kicker: {
    ...type.sectionLabel,
  },
  headline: {
    ...type.screenTitle,
  },
  statRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.xl,
  },
  statCard: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  gaugeCard: {
    padding: space.lg,
    marginTop: space.md,
    gap: space.md,
  },
  percentile: {
    ...type.body,
  },
  percentileValue: {
    color: color.accent,
    fontFamily: font.medium,
  },
  teaserCard: {
    marginTop: space.md,
    padding: space.lg,
  },
  teaserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  teaserText: {
    flex: 1,
    ...type.bodyMedium,
  },
  teaserTitle: {
    flex: 1,
    ...type.cardTitle,
  },
  programLines: {
    marginTop: space.sm,
    gap: space.xs,
  },
  // Flou « réel » sans dépendance : texte transparent + ombre rayon 7
  // (même mécanique que le masque flouté de StatCard).
  blurredInline: {
    color: 'transparent',
    fontFamily: font.medium,
    textShadowColor: color.textSecond,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  blurredLine: {
    ...type.body,
    color: 'transparent',
    textShadowColor: color.textMuted,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.lg,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    ...type.body,
    color: color.textPrimary,
  },
  footer: {
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
});
