import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Language } from '../i18n/LanguageContext';

export type ReminderTime = 'off' | 'morning' | 'evening';

const REMINDER_KEY = 'dogTrainingApp:reminderTime';
const LAST_WEB_NOTIFY_KEY = 'dogTrainingApp:lastWebNotifyDate';
const TIMES: Record<Exclude<ReminderTime, 'off'>, { hour: number; minute: number }> = {
  morning: { hour: 9, minute: 0 },
  evening: { hour: 18, minute: 0 },
};

const REMINDER_TITLE: Record<Language, string> = { he: 'זמן לתרגל! 🐾', en: 'Time to train! 🐾' };
const REMINDER_BODY: Record<Language, string> = {
  he: 'הכלב שלכם מחכה לכם - כמה דקות של תרגול היום?',
  en: 'Your dog is waiting - a few minutes of practice today?',
};

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function loadReminderTime(): Promise<ReminderTime> {
  const stored = await AsyncStorage.getItem(REMINDER_KEY);
  return stored === 'morning' || stored === 'evening' ? stored : 'off';
}

/**
 * On iOS/Android this schedules a real repeating OS-level notification, so
 * it fires even if the app is closed. On web there's no reliable way to
 * deliver a notification while the tab is closed without a push server, so
 * `checkAndNotifyIfDue` below is used instead as a foreground best-effort
 * fallback - it's less powerful but needs no backend or ongoing cost.
 */
export async function setReminderTime(time: ReminderTime, language: Language): Promise<boolean> {
  await AsyncStorage.setItem(REMINDER_KEY, time);

  if (Platform.OS === 'web') {
    if (time === 'off') return true;
    return requestWebNotificationPermission();
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (time === 'off') return true;

  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;

  const { hour, minute } = TIMES[time];
  await Notifications.scheduleNotificationAsync({
    content: { title: REMINDER_TITLE[language], body: REMINDER_BODY[language] },
    trigger: { hour, minute, repeats: true },
  });
  return true;
}

/**
 * Web-only foreground fallback: called on app load. If the user opted into
 * a reminder time, that time has already passed today, they haven't
 * practiced yet today, and we haven't already shown one today, fire a
 * browser notification (if permission was already granted).
 */
export async function checkAndNotifyIfDue(
  practicedToday: boolean,
  language: Language
): Promise<void> {
  if (Platform.OS !== 'web' || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (practicedToday) return;

  const time = await loadReminderTime();
  if (time === 'off') return;

  const now = new Date();
  const { hour } = TIMES[time];
  if (now.getHours() < hour) return;

  const todayKey = now.toISOString().slice(0, 10);
  const lastNotified = await AsyncStorage.getItem(LAST_WEB_NOTIFY_KEY);
  if (lastNotified === todayKey) return;

  new Notification(REMINDER_TITLE[language], { body: REMINDER_BODY[language] });
  await AsyncStorage.setItem(LAST_WEB_NOTIFY_KEY, todayKey);
}

export async function requestWebNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'web' || typeof Notification === 'undefined') return true;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}
