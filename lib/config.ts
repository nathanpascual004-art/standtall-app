/**
 * Configuration à remplir avant la mise en production.
 * Tant qu'une clé garde son préfixe « REMPLACER », RevenueCat n'est pas
 * initialisé sur cette plateforme et le paywall affiche « … » à la place
 * des prix (jamais de montant codé en dur).
 */

/**
 * Clé API RevenueCat iOS — clé PUBLIQUE (appl_...), conçue pour être
 * embarquée côté client, comme la clé anon Supabase ci-dessous.
 */
export const REVENUECAT_IOS_KEY = 'appl_UmHqrpSkIYtvUdYevqsSXKsQYYy';

/** Clé API RevenueCat Android — dashboard RevenueCat → API keys (goog_...). */
export const REVENUECAT_ANDROID_KEY = 'REMPLACER_goog_xxxxxxxx';

/**
 * Scan de repas — Edge Function Supabase `scan-meal`.
 * La clé de l'API vision vit UNIQUEMENT côté serveur (secret Supabase) ;
 * l'app n'embarque que l'URL de la fonction et la clé anon (publique par
 * conception). Tant que l'URL garde son préfixe « REMPLACER », le scan
 * renvoie un repas mocké en dev pour tester le funnel.
 */
export const SUPABASE_FUNCTION_URL =
  'https://retpuwbgrzwqxodjuaaj.supabase.co/functions/v1/scan-meal';
export const SUPABASE_ANON_KEY = 'sb_publishable_Zb2nnrb3P_p4mYXGh_xo0g_lGN1KBBx';

/** Liens légaux affichés sur le paywall et le profil (exigés par Apple). */
export const TERMS_URL = 'https://standtall.app/conditions';
export const PRIVACY_URL = 'https://standtall.app/confidentialite';

/** Adresse de contact support. */
export const SUPPORT_EMAIL = 'support@standtall.app';
