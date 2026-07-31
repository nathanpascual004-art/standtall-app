// Logique PURE du webhook RevenueCat — aucun accès réseau ni API Deno.
// Testée sous Node (scripts de test) et importée par index.ts (Deno).
//
// Rappels doc RevenueCat (vérifiés) :
// - Il n'existe PAS d'événement « TRIAL_CONVERSION » : la conversion
//   d'essai est un RENEWAL avec is_trial_conversion=true.
// - Un remboursement arrive en CANCELLATION avec
//   cancel_reason=CUSTOMER_SUPPORT.
// - Les attributs sont dans event.subscriber_attributes sous la forme
//   { "referral_code": { "value": "JULES23", "updated_at_ms": ... } }.

/** Sous-ensemble utile du payload d'événement RevenueCat. */
export type RcEvent = {
  type?: string;
  app_user_id?: string;
  product_id?: string;
  store?: string;
  environment?: string; // PRODUCTION | SANDBOX
  period_type?: string; // TRIAL | INTRO | NORMAL | PROMOTIONAL | PREPAID
  is_trial_conversion?: boolean;
  cancel_reason?: string;
  expiration_reason?: string;
  price?: number; // normalisé USD par RevenueCat
  price_in_purchased_currency?: number;
  currency?: string;
  event_timestamp_ms?: number;
  subscriber_attributes?: Record<string, { value?: unknown } | undefined>;
};

export type Decision =
  | {
      kind: 'activation'; // 1er paiement réel → prime
      eventType: 'initial_purchase' | 'trial_conversion';
    }
  | {
      kind: 'void'; // l'argent est reparti → la prime saute
      eventType: 'refund' | 'expiration';
    }
  | { kind: 'ignore'; reason: string };

/** Code de parrainage lu dans les subscriber attributes (null si absent). */
export function extractReferralCode(event: RcEvent): string | null {
  const raw = event.subscriber_attributes?.['referral_code']?.value;
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9_-]{3,24}$/.test(code) ? code : null;
}

/**
 * Décide quoi faire d'un événement RevenueCat.
 *
 * On paie sur le PAIEMENT RÉEL, jamais sur l'install ni le début d'essai :
 * - INITIAL_PURCHASE en NORMAL ou INTRO (intro payante) → prime.
 * - RENEWAL avec is_trial_conversion=true (1re échéance payée après
 *   l'essai) → prime. Les renouvellements suivants ne repayent pas.
 *
 * On annule la prime quand l'argent est effectivement reparti :
 * - CANCELLATION avec cancel_reason=CUSTOMER_SUPPORT = remboursement.
 * - EXPIRATION pour CUSTOMER_SUPPORT ou BILLING_ERROR (paiement jamais
 *   encaissé / rétrofacturé — garde-fou anti carte volée).
 * ⚠️ Une CANCELLATION simple (UNSUBSCRIBE = désabonnement) ne rembourse
 * RIEN : l'abonné garde sa période payée, la prime reste due. Idem pour
 * une EXPIRATION par désabonnement. Voir la note dans le récap.
 */
export function decide(event: RcEvent, allowSandbox: boolean): Decision {
  const type = event.type ?? '';
  if (event.environment === 'SANDBOX' && !allowSandbox) {
    return { kind: 'ignore', reason: 'sandbox' };
  }
  if (!event.app_user_id) {
    return { kind: 'ignore', reason: 'app_user_id manquant' };
  }

  if (type === 'INITIAL_PURCHASE') {
    if (event.period_type === 'TRIAL') {
      // Début d'essai gratuit : aucun paiement — la prime attendra la
      // conversion (RENEWAL is_trial_conversion).
      return { kind: 'ignore', reason: 'début d’essai (non payé)' };
    }
    if (event.period_type === 'PROMOTIONAL' || event.period_type === 'PREPAID') {
      return { kind: 'ignore', reason: `period_type ${event.period_type} (non payé/hors programme)` };
    }
    return { kind: 'activation', eventType: 'initial_purchase' };
  }

  if (type === 'RENEWAL') {
    if (event.is_trial_conversion === true) {
      return { kind: 'activation', eventType: 'trial_conversion' };
    }
    return { kind: 'ignore', reason: 'renouvellement ordinaire (prime déjà due au 1er paiement)' };
  }

  if (type === 'CANCELLATION') {
    if (event.cancel_reason === 'CUSTOMER_SUPPORT') {
      return { kind: 'void', eventType: 'refund' };
    }
    return { kind: 'ignore', reason: `cancellation ${event.cancel_reason ?? '?'} (pas un remboursement)` };
  }

  if (type === 'EXPIRATION') {
    if (event.expiration_reason === 'CUSTOMER_SUPPORT' || event.expiration_reason === 'BILLING_ERROR') {
      return { kind: 'void', eventType: 'expiration' };
    }
    return { kind: 'ignore', reason: `expiration ${event.expiration_reason ?? '?'} (paiement conservé)` };
  }

  return { kind: 'ignore', reason: `type ${type || '?'} sans effet sur les primes` };
}

/** Ligne à insérer dans referral_conversions pour un événement retenu. */
export function buildConversionRow(
  event: RcEvent,
  decision: Exclude<Decision, { kind: 'ignore' }>,
  affiliateCode: string,
  bountyEur: number,
) {
  const timestamp = typeof event.event_timestamp_ms === 'number' ? event.event_timestamp_ms : 0;
  return {
    affiliate_code: affiliateCode,
    rc_app_user_id: event.app_user_id ?? '',
    event_type: decision.eventType,
    product_id: event.product_id ?? null,
    store: event.store ?? null,
    // Informatif (montant dans la devise d'achat, sinon USD normalisé) —
    // la prime est forfaitaire et ne dépend pas de ce montant.
    price_eur: event.price_in_purchased_currency ?? event.price ?? null,
    event_time: new Date(timestamp).toISOString(),
    // Les lignes d'audit (void) ne portent jamais de prime.
    bounty_eur: decision.kind === 'activation' ? bountyEur : 0,
    is_refunded: decision.kind === 'void',
    payout_status: decision.kind === 'activation' ? 'held' : 'void',
  };
}
