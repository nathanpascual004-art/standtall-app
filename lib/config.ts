/**
 * Configuration à remplir avant la mise en production.
 * Tant que les clés gardent leur préfixe « REMPLACER », RevenueCat
 * n'est pas initialisé et le paywall affiche ses prix de fallback.
 */

/** Clé API RevenueCat iOS — dashboard RevenueCat → API keys (appl_...). */
export const REVENUECAT_IOS_KEY = 'REMPLACER_appl_xxxxxxxx';

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
export const SUPABASE_ANON_KEY = 'REMPLACER_eyJxxxxxxxx';

/** Liens légaux affichés sur le paywall et le profil (exigés par Apple). */
export const TERMS_URL = 'https://standtall.app/conditions';
export const PRIVACY_URL = 'https://standtall.app/confidentialite';

/** Adresse de contact support. */
export const SUPPORT_EMAIL = 'support@standtall.app';
