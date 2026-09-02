import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../auth/supabaseClient';

const LOCAL_KEY = 'dogTrainingApp:localFeedback';

/**
 * Best-effort feedback submission. In mock mode (or if the real backend
 * isn't configured) it's just logged to AsyncStorage - there's no one to
 * read it, but it still lets the flow be tried end-to-end without a
 * backend. With the real backend it's a real row the developer can read
 * from the Supabase dashboard.
 */
export async function submitFeedback(message: string, isMock: boolean, userId?: string): Promise<void> {
  if (isMock || !supabase) {
    const stored = await AsyncStorage.getItem(LOCAL_KEY);
    const list: { message: string; date: string }[] = stored ? JSON.parse(stored) : [];
    list.push({ message, date: new Date().toISOString() });
    await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    return;
  }
  const { error } = await supabase.from('feedback').insert({ user_id: userId ?? null, message });
  if (error) throw error;
}
