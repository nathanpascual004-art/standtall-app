/**
 * Internationalisation — i18next + react-i18next.
 *
 * Convention à deux niveaux, appliquée partout :
 *   - Texte d'ÉCRAN (titres, boutons, labels) → clés dans locales/fr.json
 *     et locales/en.json, via t('namespace.key').
 *   - Texte de DONNÉES (exercices, repas, conseils, habitudes, rangs…) →
 *     champ { fr, en } dans le fichier de données, résolu par lx().
 *
 * Langue au premier lancement : celle de l'appareil si supportée, sinon
 * français. Le choix manuel (Profil) est persisté dans le store et
 * réappliqué au démarrage par app/_layout.tsx.
 */
import i18n from 'i18next';
import { useSyncExternalStore } from 'react';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Un libellé de données, présent dans toutes les langues supportées. */
export type Localized = { [L in AppLanguage]: string };

/**
 * Langue de l'appareil (expo-localization). Module natif chargé
 * paresseusement : sur un build qui ne l'embarque pas encore, on retombe
 * sur le français sans crash.
 */
export function deviceLanguage(): AppLanguage {
  try {
    const { getLocales } = require('expo-localization') as {
      getLocales: () => { languageCode: string | null }[];
    };
    const code = getLocales()[0]?.languageCode;
    if (code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code)) {
      return code as AppLanguage;
    }
  } catch {
    // Module natif absent (ancien dev build) → fallback.
  }
  return 'fr';
}

/** Langue active, toujours ramenée à une langue supportée. */
export function currentLanguage(): AppLanguage {
  const lang = i18n.language;
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as AppLanguage)
    : 'fr';
}

const subscribeToLanguage = (onChange: () => void) => {
  i18n.on('languageChanged', onChange);
  return () => i18n.off('languageChanged', onChange);
};

/**
 * Langue active RÉACTIVE — à utiliser dans les COMPOSANTS.
 *
 * Indispensable avec le React Compiler : un appel nu à currentLanguage()
 * (ou à un helper qui la lit) dans un rendu est mémoïsé une fois pour
 * toutes, car ses dépendances visibles ne changent jamais. Ici la valeur
 * vient d'un hook abonné à `languageChanged` : elle change de valeur au
 * bon moment et invalide les caches qui en dépendent. Les libellés de
 * données se lisent alors `value[lang]`.
 */
export function useAppLanguage(): AppLanguage {
  return useSyncExternalStore(subscribeToLanguage, currentLanguage, currentLanguage);
}

/**
 * Résout un libellé de données { fr, en } dans la langue active.
 * Hors composants uniquement (handlers d'événements, notifications) —
 * dans un rendu, utiliser useAppLanguage() puis `value[lang]`.
 */
export function lx(value: Localized): string {
  return value[currentLanguage()];
}

/** Décimales localisées : 2.8 → « 2,8 » en FR, « 2.8 » en EN. */
export function formatDecimal(
  value: number,
  digits = 1,
  lang: AppLanguage = currentLanguage(),
): string {
  const text = value.toFixed(digits);
  return lang === 'fr' ? text.replace('.', ',') : text;
}

const DATE_DAYS: Record<AppLanguage, string[]> = {
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const DATE_MONTHS: Record<AppLanguage, string[]> = {
  fr: [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

/**
 * « lundi 3 août » (FR) / « Monday, August 3 » (EN).
 * `lang` vient de useAppLanguage() dans un composant (React Compiler).
 */
export function formatLongDate(lang: AppLanguage, date: Date = new Date()): string {
  return lang === 'fr'
    ? `${DATE_DAYS.fr[date.getDay()]} ${date.getDate()} ${DATE_MONTHS.fr[date.getMonth()]}`
    : `${DATE_DAYS.en[date.getDay()]}, ${DATE_MONTHS.en[date.getMonth()]} ${date.getDate()}`;
}

/** Milliers localisés : 1840 → « 1 840 » (FR) / « 1,840 » (EN). */
export function formatInt(value: number, lang: AppLanguage = currentLanguage()): string {
  const separator = lang === 'fr' ? ' ' : ',';
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: deviceLanguage(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
