import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../auth/supabaseClient';

const STREAK_KEY = 'dogTrainingApp:streak';
const LAST_ACTIVE_KEY = 'dogTrainingApp:lastActiveDate';
const WEEKLY_DATES_KEY = 'dogTrainingApp:weeklyDates';
const WEEK_START_KEY = 'dogTrainingApp:weekStart';

/** Practice on this many distinct days in a calendar week completes the challenge. */
export const WEEKLY_GOAL = 3;

export interface StreakState {
  streak: number;
  lastActiveDate: string | null;
  practicedToday: boolean;
  weeklyCount: number;
  weeklyGoalMet: boolean;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

/** ISO date of the most recent Sunday - the start of "this week". */
function weekStartISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function currentWeekCount(storedWeekStart: string | null | undefined, weeklyDates: string[]): number {
  // A week boundary crossed since the last write - last week's tally no
  // longer counts toward this week's challenge.
  if (storedWeekStart !== weekStartISO()) return 0;
  return weeklyDates.length;
}

export async function loadStreak(isMock: boolean, userId?: string): Promise<StreakState> {
  if (isMock || !userId || !supabase) {
    const [streakStr, lastActiveDate, weeklyDatesStr, weekStart] = await Promise.all([
      AsyncStorage.getItem(STREAK_KEY),
      AsyncStorage.getItem(LAST_ACTIVE_KEY),
      AsyncStorage.getItem(WEEKLY_DATES_KEY),
      AsyncStorage.getItem(WEEK_START_KEY),
    ]);
    const streak = streakStr ? parseInt(streakStr, 10) : 0;
    const weeklyDates: string[] = weeklyDatesStr ? JSON.parse(weeklyDatesStr) : [];
    const weeklyCount = currentWeekCount(weekStart, weeklyDates);
    return {
      streak, lastActiveDate, practicedToday: lastActiveDate === todayISO(),
      weeklyCount, weeklyGoalMet: weeklyCount >= WEEKLY_GOAL,
    };
  }
  const { data } = await supabase
    .from('progress')
    .select('streak, last_active_date, weekly_dates, week_start')
    .eq('user_id', userId)
    .maybeSingle();
  const streak = data?.streak ?? 0;
  const lastActiveDate = data?.last_active_date ?? null;
  const weeklyCount = currentWeekCount(data?.week_start ?? null, data?.weekly_dates ?? []);
  return {
    streak, lastActiveDate, practicedToday: lastActiveDate === todayISO(),
    weeklyCount, weeklyGoalMet: weeklyCount >= WEEKLY_GOAL,
  };
}

/**
 * Call when the user actually completes a practice step (not just opens the
 * app) - a streak should reflect real practice, not passive browsing. Rolls
 * the streak forward by one when the last practice was yesterday, resets it
 * to 1 after a gap, and leaves it untouched if today was already recorded.
 * Also tallies today toward the weekly challenge (src/progress/streak.ts's
 * WEEKLY_GOAL), resetting that tally whenever a new week has started.
 */
export async function recordPractice(isMock: boolean, userId?: string): Promise<StreakState> {
  const today = todayISO();
  const thisWeekStart = weekStartISO();

  if (isMock || !userId || !supabase) {
    const [streakStr, lastActiveDate, weeklyDatesStr, storedWeekStart] = await Promise.all([
      AsyncStorage.getItem(STREAK_KEY),
      AsyncStorage.getItem(LAST_ACTIVE_KEY),
      AsyncStorage.getItem(WEEKLY_DATES_KEY),
      AsyncStorage.getItem(WEEK_START_KEY),
    ]);
    const streak = streakStr ? parseInt(streakStr, 10) : 0;
    const priorWeeklyDates: string[] = weeklyDatesStr ? JSON.parse(weeklyDatesStr) : [];
    const weeklyDates = storedWeekStart === thisWeekStart
      ? (priorWeeklyDates.includes(today) ? priorWeeklyDates : [...priorWeeklyDates, today])
      : [today];
    const weeklyCount = weeklyDates.length;

    if (lastActiveDate === today) {
      await Promise.all([
        AsyncStorage.setItem(WEEKLY_DATES_KEY, JSON.stringify(weeklyDates)),
        AsyncStorage.setItem(WEEK_START_KEY, thisWeekStart),
      ]);
      return { streak, lastActiveDate, practicedToday: true, weeklyCount, weeklyGoalMet: weeklyCount >= WEEKLY_GOAL };
    }
    const nextStreak = lastActiveDate && isYesterday(lastActiveDate) ? streak + 1 : 1;
    await Promise.all([
      AsyncStorage.setItem(STREAK_KEY, String(nextStreak)),
      AsyncStorage.setItem(LAST_ACTIVE_KEY, today),
      AsyncStorage.setItem(WEEKLY_DATES_KEY, JSON.stringify(weeklyDates)),
      AsyncStorage.setItem(WEEK_START_KEY, thisWeekStart),
    ]);
    return { streak: nextStreak, lastActiveDate: today, practicedToday: true, weeklyCount, weeklyGoalMet: weeklyCount >= WEEKLY_GOAL };
  }

  const { data } = await supabase
    .from('progress')
    .select('streak, last_active_date, weekly_dates, week_start')
    .eq('user_id', userId)
    .maybeSingle();
  const streak = data?.streak ?? 0;
  const lastActiveDate = data?.last_active_date ?? null;
  const priorWeeklyDates: string[] = data?.weekly_dates ?? [];
  const weeklyDates = data?.week_start === thisWeekStart
    ? (priorWeeklyDates.includes(today) ? priorWeeklyDates : [...priorWeeklyDates, today])
    : [today];
  const weeklyCount = weeklyDates.length;

  if (lastActiveDate === today) {
    await supabase.from('progress').upsert({ user_id: userId, weekly_dates: weeklyDates, week_start: thisWeekStart });
    return { streak, lastActiveDate, practicedToday: true, weeklyCount, weeklyGoalMet: weeklyCount >= WEEKLY_GOAL };
  }
  const nextStreak = lastActiveDate && isYesterday(lastActiveDate) ? streak + 1 : 1;
  await supabase.from('progress').upsert({
    user_id: userId, streak: nextStreak, last_active_date: today,
    weekly_dates: weeklyDates, week_start: thisWeekStart,
  });
  return { streak: nextStreak, lastActiveDate: today, practicedToday: true, weeklyCount, weeklyGoalMet: weeklyCount >= WEEKLY_GOAL };
}
