/**
 * Configuration à remplir avant la mise en production.
 * Tant que les clés gardent leur préfixe « REMPLACER », RevenueCat
 * n'est pas initialisé et le paywall affiche ses prix de fallback.
 */

/** Clé API RevenueCat iOS — dashboard RevenueCat → API keys (appl_...). */
export const REVENUECAT_IOS_KEY = 'REMPLACER_appl_xxxxxxxx';

/** Clé API RevenueCat Android — dashboard RevenueCat → API keys (goog_...). */
export const REVENUECAT_ANDROID_KEY = 'REMPLACER_goog_xxxxxxxx';

/** Liens légaux affichés sur le paywall (exigés par Apple). */
export const TERMS_URL = 'https://standtall.app/conditions';
export const PRIVACY_URL = 'https://standtall.app/confidentialite';
