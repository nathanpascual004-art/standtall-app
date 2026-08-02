/**
 * Rappel anti-rupture de série — notification LOCALE (expo-notifications).
 *
 * Principe : une seule notification programmée à la fois, replanifiée
 * après chaque séance et à chaque ouverture de l'app :
 * - série active et séance du jour pas faite → rappel aujourd'hui 19 h ;
 * - séance du jour faite → rappel demain 19 h (pour tenir la série) ;
 * - pas de série → aucune notification.
 *
 * La permission est demandée AU BON MOMENT : à la fin de la première
 * séance (jamais brutalement à l'ouverture).
 *
 * expo-notifications est OPTIONNEL : chargé paresseusement (require dans
 * un try/catch). Si le module — notamment sa partie native — est absent
 * du build, ou sur le web, toutes les fonctions sont des no-ops
 * silencieux : l'app tourne, simplement sans rappels.
 */
import { Platform } from 'react-native';

import { displayStreak, isActiveToday, type ProgressState } from './progress';

/** Heure locale du rappel (fin de journée, avant la rupture). */
const REMINDER_HOUR = 19;

type NotificationsModule = typeof import('expo-notifications');

/** undefined = pas encore tenté ; null = indisponible (no-op partout). */
let cachedModule: NotificationsModule | null | undefined;

/** Charge expo-notifications si présent dans le build — sinon null. */
function getNotifications(): NotificationsModule | null {
  if (Platform.OS === 'web') return null;
  if (cachedModule !== undefined) return cachedModule;
  try {
    // Require paresseux : un build sans le module natif ne crashe pas.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-notifications') as NotificationsModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

/** Affichage des notifications quand l'app est au premier plan. */
export function initNotifications(): void {
  const notifications = getNotifications();
  if (!notifications) return;
  try {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Module JS présent mais natif absent : on désactive pour la session.
    cachedModule = null;
  }
}

/**
 * Demande la permission de notifier (à appeler à la fin de la première
 * séance — le moment où la série commence à valoir quelque chose).
 */
export async function ensureReminderPermission(): Promise<boolean> {
  const notifications = getNotifications();
  if (!notifications) return false;
  try {
    const current = await notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

/**
 * (Re)planifie LE rappel de série — annule l'ancien puis programme le
 * prochain 19 h pertinent. Sans module, sans permission ou sans série :
 * no-op silencieux.
 */
export async function scheduleStreakReminder(
  progress: ProgressState,
  todayKey: string,
): Promise<void> {
  const notifications = getNotifications();
  if (!notifications) return;
  try {
    const permission = await notifications.getPermissionsAsync();
    await notifications.cancelAllScheduledNotificationsAsync();
    if (!permission.granted) return;

    const streak = displayStreak(progress, todayKey);
    if (streak === 0) return;

    const now = new Date();
    const when = new Date(now);
    when.setHours(REMINDER_HOUR, 0, 0, 0);
    // Séance du jour déjà faite, ou 19 h passées → rappel demain.
    if (isActiveToday(progress, todayKey) || when <= now) {
      when.setDate(when.getDate() + 1);
      when.setHours(REMINDER_HOUR, 0, 0, 0);
    }

    await notifications.scheduleNotificationAsync({
      content: {
        title: `Ta série de ${streak} jour${streak > 1 ? 's' : ''} va se casser 🔥`,
        body: '5 min suffisent pour la garder.',
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
  } catch {
    // Jamais bloquant : un rappel raté ne doit pas gêner l'app.
  }
}
