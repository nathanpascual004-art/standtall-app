/**
 * Intégration RevenueCat (react-native-purchases).
 *
 * Les clés API se remplissent dans lib/config.ts. Tant qu'elles sont
 * absentes — ou sur web — le module reste inactif : getOfferings()
 * renvoie null (le paywall affiche alors ses prix de fallback) et,
 * en développement uniquement, purchasePackage() simule un achat
 * réussi pour pouvoir tester le funnel complet sans store.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import { REVENUECAT_ANDROID_KEY, REVENUECAT_IOS_KEY } from './config';
import { useOnboardingStore } from './store';

/** Entitlement RevenueCat qui débloque l'app. */
export const ENTITLEMENT_PRO = 'pro';

/** Identifiants des packages attendus dans l'offering courant. */
export const PACKAGE_ID_ANNUAL = '$rc_annual';
export const PACKAGE_ID_MONTHLY = '$rc_monthly';
export const PACKAGE_ID_WEEKLY = '$rc_weekly';

const PLACEHOLDER_PREFIX = 'REMPLACER';

let configured = false;

/** À appeler une seule fois au démarrage (fait dans app/_layout.tsx). */
export function initPurchases(): void {
  if (configured) return;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  if (!apiKey || apiKey.startsWith(PLACEHOLDER_PREFIX)) return;

  Purchases.configure({ apiKey });
  configured = true;

  // Re-pose le code de parrainage persisté (affiliation) à chaque
  // démarrage : l'attribut doit être en place AVANT le premier achat
  // pour que le webhook puisse attribuer la vente.
  const applyStoredCode = () => {
    const code = useOnboardingStore.getState().referralCode;
    if (code) void setReferralAttribute(code);
  };
  if (useOnboardingStore.getState().hasHydrated) applyStoredCode();
  else useOnboardingStore.persist.onFinishHydration(applyStoredCode);
}

/**
 * Pose le code de parrainage en subscriber attribute RevenueCat
 * (`referral_code`) — lu ensuite par le webhook dans chaque événement
 * d'achat. Sans RevenueCat configuré (web / préview), no-op silencieux.
 */
export async function setReferralAttribute(code: string): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.setAttributes({ referral_code: code.trim().toUpperCase() });
  } catch {
    // Non bloquant : l'attribut sera reposé au prochain démarrage.
  }
}

export function isConfigured(): boolean {
  return configured;
}

function isProActive(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_PRO] !== undefined;
}

/** Offering courant, ou null si indisponible (le paywall a un fallback). */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

/** Lance l'achat. true si l'entitlement « pro » est actif à l'issue. */
export async function purchasePackage(pkg: PurchasesPackage | null): Promise<boolean> {
  if (!configured) {
    // Clés absentes (Expo Go / préview) : achat simulé en dev — ou si
    // EXPO_PUBLIC_FAKE_PRO=1 (préview web du funnel) — pour tester de
    // bout en bout. Jamais actif dans un build de production réel.
    return __DEV__ || process.env.EXPO_PUBLIC_FAKE_PRO === '1';
  }
  if (!pkg) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return isProActive(customerInfo);
  } catch {
    // Achat annulé par l'utilisateur ou refusé par le store.
    return false;
  }
}

/** Restaure les achats précédents. true si l'entitlement « pro » est actif. */
export async function restorePurchases(): Promise<boolean> {
  if (!configured) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return isProActive(customerInfo);
  } catch {
    return false;
  }
}

/** Expose isPro (entitlement « pro »), tenu à jour par le listener RevenueCat. */
export function useEntitlement(): { isPro: boolean } {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!configured) return;

    let mounted = true;
    const onUpdate = (info: CustomerInfo) => {
      if (mounted) setIsPro(isProActive(info));
    };

    Purchases.getCustomerInfo().then(onUpdate).catch(() => {});
    Purchases.addCustomerInfoUpdateListener(onUpdate);

    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(onUpdate);
    };
  }, []);

  return { isPro };
}
