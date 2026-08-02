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
 * séance (jamais brutalement à l'ouverture). Sur le web : no-op complet.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { displayStreak, isActiveToday, type ProgressState } from './progress';

/** Heure locale du rappel (fin de journée, avant la rupture). */
const REMINDER_HOUR = 19;

/** Affichage des notifications quand l'app est au premier plan. */
export function initNotifications(): void {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Demande la permission de notifier (à appeler à la fin de la première
 * séance — le moment où la série commence à valoir quelque chose).
 */
export async function ensureReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

/**
 * (Re)planifie LE rappel de série — annule l'ancien puis programme le
 * prochain 19 h pertinent. Sans permission ou sans série : rien.
 */
export async function scheduleStreakReminder(
  progress: ProgressState,
  todayKey: string,
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const permission = await Notifications.getPermissionsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Ta série de ${streak} jour${streak > 1 ? 's' : ''} va se casser 🔥`,
        body: '5 min suffisent pour la garder.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
  } catch {
    // Jamais bloquant : un rappel raté ne doit pas gêner l'app.
  }
}
