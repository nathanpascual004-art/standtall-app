import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

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
import { colors, fonts, radius, spacing } from '@/lib/theme';

/** Prix de fallback (affichés si getOfferings échoue — l'écran n'est jamais vide). */
const FALLBACK_ANNUAL_PRICE = '49,99 €';
const FALLBACK_ANNUAL_PER_WEEK = '0,96 €';
const FALLBACK_MONTHLY_PRICE = '9,99 €';
const FALLBACK_WEEKLY_PRICE = '4,99 €';

const BENEFITS = [
  'Ta stature redressée exacte',
  "Ton programme d'étirements sur-mesure",
  'Suivi de ta progression',
];

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
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          hitSlop={12}
          style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Débloque ta stature redressée</Text>
        <Text style={styles.subtitle}>Ton programme posture personnalisé t'attend</Text>

        <View style={styles.benefits}>
          {BENEFITS.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accentLight} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.offers}>
          <Pressable
            onPress={() => setSelected('annual')}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === 'annual' }}
            style={[styles.offer, selected === 'annual' && styles.offerSelected]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Le plus choisi</Text>
            </View>
            <View style={styles.offerBody}>
              <View style={styles.offerNameRow}>
                <Text style={styles.offerName}>Annuel</Text>
                <TrialChip />
              </View>
              <Text style={styles.offerDetail}>puis {annualPrice}/an</Text>
            </View>
            <Text style={styles.offerPerWeek}>{annualPerWeek}/sem</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelected('monthly')}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === 'monthly' }}
            style={[styles.offer, selected === 'monthly' && styles.offerSelected]}
          >
            <View style={styles.offerBody}>
              <Text style={styles.offerName}>Mensuel</Text>
              <Text style={styles.offerDetail}>{monthlyPrice}/mois</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setSelected('weekly')}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === 'weekly' }}
            style={[styles.offer, selected === 'weekly' && styles.offerSelected]}
          >
            <View style={styles.offerBody}>
              <View style={styles.offerNameRow}>
                <Text style={styles.offerName}>Hebdo</Text>
                <TrialChip />
              </View>
              <Text style={styles.offerDetail}>puis {weeklyPrice}/sem</Text>
            </View>
          </Pressable>
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
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  closeRow: {
    alignItems: 'flex-end',
    paddingTop: spacing.md,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 34,
    fontFamily: fonts.display,
    marginTop: spacing.lg,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
    marginTop: spacing.xs,
  },
  benefits: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  offers: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  offerSelected: {
    backgroundColor: colors.cardActive,
    borderColor: colors.accent,
  },
  badge: {
    position: 'absolute',
    top: -9,
    right: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeLabel: {
    color: colors.text,
    fontSize: 10,
    fontFamily: fonts.bodyMedium,
  },
  offerBody: {
    flex: 1,
    gap: 2,
  },
  offerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  offerName: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
  },
  trialChip: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  trialChipLabel: {
    color: colors.accentLight,
    fontSize: 10,
    fontFamily: fonts.bodyMedium,
  },
  offerDetail: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
  },
  offerPerWeek: {
    color: colors.accentLight,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
  error: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  cancelNote: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  link: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
