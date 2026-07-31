/**
 * Code de parrainage (programme d'affiliation).
 *
 * L'app ne connaît QUE l'Edge Function `validate-referral`, qui répond
 * { valid: true|false } et rien d'autre — la table des affiliés n'est
 * jamais exposée au client. Le code validé est stocké en local puis posé
 * en subscriber attribute RevenueCat (`referral_code`) : c'est le
 * webhook serveur qui fait ensuite foi pour attribuer les ventes.
 */
import { SUPABASE_ANON_KEY, SUPABASE_FUNCTION_URL } from './config';

/** Même format que côté serveur (normalisé en MAJUSCULES). */
export const REFERRAL_CODE_PATTERN = /^[A-Z0-9_-]{3,24}$/;

const TIMEOUT_MS = 6000;
const PLACEHOLDER_PREFIX = 'REMPLACER';

/** URL de validate-referral, dérivée de l'URL scan-meal déjà configurée. */
const VALIDATE_URL = SUPABASE_FUNCTION_URL.replace(/\/scan-meal\/?$/, '/validate-referral');

export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/**
 * Vérifie un code auprès du serveur.
 *   true  → code actif ;  false → code inconnu ;
 *   null  → impossible de vérifier (hors-ligne / backend non configuré).
 * En cas de `null`, l'appelant garde le code SANS bloquer : un code
 * invalide est de toute façon ignoré par le webhook (aucune prime).
 */
export async function validateReferralCode(raw: string): Promise<boolean | null> {
  const code = normalizeReferralCode(raw);
  if (!REFERRAL_CODE_PATTERN.test(code)) return false;
  if (VALIDATE_URL.startsWith(PLACEHOLDER_PREFIX)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(VALIDATE_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { valid?: boolean };
    return payload.valid === true;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
