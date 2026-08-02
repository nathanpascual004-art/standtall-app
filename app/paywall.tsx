import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import { Card } from '@/components/Card';
import { Mascot } from '@/components/Mascot';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PRIVACY_URL, TERMS_URL } from '@/lib/config';
import {
  PACKAGE_ID_ANNUAL,
  PACKAGE_ID_MONTHLY,
  PACKAGE_ID_WEEKLY,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/lib/purchases';
import { useOnboardingStore } from '@/lib/store';
import {
  borderWidth,
  color,
  duration,
  font,
  radius,
  space,
  staggerDelay,
  type,
} from '@/theme/tokens';

/** Prix de fallback (affichés si getOfferings échoue — l'écran n'est jamais vide). */
const FALLBACK_ANNUAL_PRICE = '49,99 €';
const FALLBACK_ANNUAL_PER_WEEK = '0,96 €';
const FALLBACK_MONTHLY_PRICE = '9,99 €';
const FALLBACK_WEEKLY_PRICE = '4,99 €';

/** Copies adaptées à l'intention choisie à l'onboarding. */
const COPY = {
  posture: {
    title: 'Débloque ta stature redressée',
    subtitle: "Ton programme posture personnalisé t'attend",
    benefits: [
      'Ta stature redressée exacte',
      "Ton programme d'étirements sur-mesure",
      'Suivi de ta progression',
    ],
  },
  nutrition: {
    title: 'Débloque ton plan nutrition',
    subtitle: 'Ton objectif calorique et tes macros sur mesure',
    benefits: [
      'Ton objectif calorique personnalisé',
      'Tes macros et le scan de repas',
      'Suivi de ta progression',
    ],
  },
  both: {
    title: 'Débloque ton plan complet',
    subtitle: 'Stature redressée + nutrition sur mesure',
    benefits: [
      'Ta stature redressée exacte',
      "Ton programme d'étirements sur-mesure",
      'Ton plan nutrition + scan de repas',
    ],
  },
} as const;

/** Dimensions de layout locales (pas des tokens de design). */
const MASCOT_SIZE = 72;
const CLOSE_SIZE = 32;
const BADGE_LIFT = 9;

/**
 * Tailles dictées par la spec paywall : titre 22 (phrase, pas de capitales),
 * badge 9 pt, chip d'essai 10 pt.
 */
const TITLE_SIZE = 22;
const TITLE_LINE_HEIGHT = 28;
const BADGE_FONT_SIZE = 9;
const CHIP_FONT_SIZE = 10;

/** Apparition en cascade des blocs principaux (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

type Plan = 'annual' | 'monthly' | 'weekly';

function findPackage(
  offering: PurchasesOffering | null,
  plan: Plan,
): PurchasesPackage | null {
  if (!offering) return null;
  if (plan === 'annual') {
    return (
      offering.annual ??
      offering.availablePackages.find((p) => p.identifier === PACKAGE_ID_ANNUAL) ??
      null
    );
  }
  if (plan === 'monthly') {
    return (
      offering.monthly ??
      offering.availablePackages.find((p) => p.identifier === PACKAGE_ID_MONTHLY) ??
      null
    );
  }
  return (
    offering.weekly ??
    offering.availablePackages.find((p) => p.identifier === PACKAGE_ID_WEEKLY) ??
    null
  );
}

/** Petit badge « 3 jours gratuits » (annuel et hebdo). */
function TrialChip() {
  return (
    <View style={styles.trialChip}>
      <Text style={styles.trialChipLabel}>3 jours gratuits</Text>
    </View>
  );
}

/** Paywall — prix, essai gratuit et résiliation visibles avant l'achat. */
export default function PaywallScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const intention = useOnboardingStore((state) => state.answers.intention);
  const copy = COPY[intention ?? 'posture'];

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selected, setSelected] = useState<Plan>('annual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getOfferings().then((current) => {
      if (mounted) setOffering(current);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const annualPkg = findPackage(offering, 'annual');
  const monthlyPkg = findPackage(offering, 'monthly');
  const weeklyPkg = findPackage(offering, 'weekly');

  const annualPrice = annualPkg?.product.priceString ?? FALLBACK_ANNUAL_PRICE;
  const annualPerWeek =
    annualPkg?.product.pricePerWeekString ?? FALLBACK_ANNUAL_PER_WEEK;
  const monthlyPrice = monthlyPkg?.product.priceString ?? FALLBACK_MONTHLY_PRICE;
  const weeklyPrice = weeklyPkg?.product.priceString ?? FALLBACK_WEEKLY_PRICE;

  const selectedPackage: Record<Plan, PurchasesPackage | null> = {
    annual: annualPkg,
    monthly: monthlyPkg,
    weekly: weeklyPkg,
  };

  const unlock = async (ok: boolean) => {
    if (ok) {
      completeOnboarding();
      router.replace('/(tabs)');
    } else {
      setError("L'achat n'a pas abouti. Réessaie dans un instant.");
    }
  };

  const handlePurchase = async () => {
    setBusy(true);
    setError(null);
    const ok = await purchasePackage(selectedPackage[selected]);
    setBusy(false);
    await unlock(ok);
  };

  const handleRestore = async () => {
    setBusy(true);
    setError(null);
    const ok = await restorePurchases();
    setBusy(false);
    if (ok) {
      completeOnboarding();
      router.replace('/(tabs)');
    } else {
      setError('Aucun achat à restaurer.');
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.closeRow}>
        <PressableScale
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          hitSlop={12}
          style={styles.close}
        >
          <Ionicons name="close" size={20} color={color.textMuted} />
        </PressableScale>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={cascade(0)} style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
          </View>
          <Mascot state="encourage" size={MASCOT_SIZE} />
        </Animated.View>

        <Animated.View entering={cascade(1)} style={styles.benefits}>
          {copy.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={color.accent} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.offers}>
          <Animated.View entering={cascade(2)}>
            <PressableScale
              onPress={() => setSelected('annual')}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === 'annual' }}
            >
              <Card style={[styles.offer, selected === 'annual' && styles.offerSelected]}>
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>Le plus choisi</Text>
                </View>
                <View style={styles.offerBody}>
                  <View style={styles.offerNameRow}>
                    <Text style={styles.offerName}>Annuel</Text>
                    <TrialChip />
                  </View>
                  <Text style={styles.offerDetail}>
                    puis <Text style={styles.priceInline}>{annualPrice}</Text>/an
                  </Text>
                </View>
                <Text style={styles.offerPerWeek}>{annualPerWeek}/sem</Text>
              </Card>
            </PressableScale>
          </Animated.View>

          <Animated.View entering={cascade(3)}>
            <PressableScale
              onPress={() => setSelected('monthly')}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === 'monthly' }}
            >
              <Card style={[styles.offer, selected === 'monthly' && styles.offerSelected]}>
                <View style={styles.offerBody}>
                  <Text style={styles.offerName}>Mensuel</Text>
                  <Text style={styles.offerDetail}>
                    <Text style={styles.priceInline}>{monthlyPrice}</Text>/mois
                  </Text>
                </View>
              </Card>
            </PressableScale>
          </Animated.View>

          <Animated.View entering={cascade(4)}>
            <PressableScale
              onPress={() => setSelected('weekly')}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === 'weekly' }}
            >
              <Card style={[styles.offer, selected === 'weekly' && styles.offerSelected]}>
                <View style={styles.offerBody}>
                  <View style={styles.offerNameRow}>
                    <Text style={styles.offerName}>Hebdo</Text>
                    <TrialChip />
                  </View>
                  <Text style={styles.offerDetail}>
                    puis <Text style={styles.priceInline}>{weeklyPrice}</Text>/sem
                  </Text>
                </View>
              </Card>
            </PressableScale>
          </Animated.View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Débloquer mon résultat"
          onPress={handlePurchase}
          disabled={busy}
        />
        <Text style={styles.cancelNote}>Annulable à tout moment</Text>
        <View style={styles.links}>
          <Pressable onPress={handleRestore} disabled={busy} hitSlop={8}>
            <Text style={styles.link}>Restaurer mes achats</Text>
          </Pressable>
          <Text style={styles.linkSeparator}>·</Text>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
            <Text style={styles.link}>Conditions</Text>
          </Pressable>
          <Text style={styles.linkSeparator}>·</Text>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
            <Text style={styles.link}>Confidentialité</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    paddingHorizontal: space.screen,
  },
  closeRow: {
    alignItems: 'flex-end',
    paddingTop: space.md,
  },
  close: {
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: space.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
  },
  titleBlock: {
    flex: 1,
  },
  // Titre en phrase : casse normale, PAS de capitales forcées.
  title: {
    fontFamily: font.bold,
    fontSize: TITLE_SIZE,
    lineHeight: TITLE_LINE_HEIGHT,
    color: color.textPrimary,
  },
  subtitle: {
    ...type.body,
    marginTop: space.xs,
  },
  benefits: {
    marginTop: space.xl,
    gap: space.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  benefitText: {
    ...type.body,
    flex: 1,
    color: color.textPrimary,
  },
  offers: {
    marginTop: space.xl,
    gap: space.md,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  offerSelected: {
    backgroundColor: color.surfaceAlt,
    borderColor: color.accent,
  },
  badge: {
    position: 'absolute',
    top: -BADGE_LIFT,
    right: space.lg,
    backgroundColor: color.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs / 2,
  },
  badgeLabel: {
    ...type.sectionLabel,
    fontSize: BADGE_FONT_SIZE,
    color: color.onAccent,
  },
  offerBody: {
    flex: 1,
    gap: space.xs / 2,
  },
  offerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  offerName: {
    ...type.cardTitle,
  },
  trialChip: {
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs / 2,
  },
  trialChipLabel: {
    fontFamily: font.medium,
    fontSize: CHIP_FONT_SIZE,
    color: color.accent,
  },
  offerDetail: {
    ...type.body,
  },
  // Valeur du prix en gras — même taille et même couleur que la ligne.
  priceInline: {
    fontFamily: font.bold,
  },
  offerPerWeek: {
    ...type.body,
    fontFamily: font.bold,
    color: color.accent,
  },
  error: {
    ...type.body,
    textAlign: 'center',
    marginTop: space.lg,
  },
  footer: {
    paddingTop: space.sm,
    paddingBottom: space.sm,
    gap: space.sm,
  },
  cancelNote: {
    ...type.meta,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  link: {
    ...type.meta,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    ...type.meta,
  },
});
