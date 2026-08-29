import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'dogTrainingApp:streak';
const LAST_ACTIVE_KEY = 'dogTrainingApp:lastActiveDate';

export interface StreakState {
  streak: number;
  lastActiveDate: string | null;
  practicedToday: boolean;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

export async function loadStreak(): Promise<StreakState> {
  const [streakStr, lastActiveDate] = await Promise.all([
    AsyncStorage.getItem(STREAK_KEY),
    AsyncStorage.getItem(LAST_ACTIVE_KEY),
  ]);
  const streak = streakStr ? parseInt(streakStr, 10) : 0;
  return { streak, lastActiveDate, practicedToday: lastActiveDate === todayISO() };
}

/**
 * Call when the user actually completes a practice step (not just opens the
 * app) - a streak should reflect real practice, not passive browsing. Rolls
 * the streak forward by one when the last practice was yesterday, resets it
 * to 1 after a gap, and leaves it untouched if today was already recorded.
 */
export async function recordPractice(): Promise<StreakState> {
  const { streak, lastActiveDate } = await loadStreak();
  const today = todayISO();
  if (lastActiveDate === today) {
    return { streak, lastActiveDate, practicedToday: true };
  }
  const nextStreak = lastActiveDate && isYesterday(lastActiveDate) ? streak + 1 : 1;
  await Promise.all([
    AsyncStorage.setItem(STREAK_KEY, String(nextStreak)),
    AsyncStorage.setItem(LAST_ACTIVE_KEY, today),
  ]);
  return { streak: nextStreak, lastActiveDate: today, practicedToday: true };
}
