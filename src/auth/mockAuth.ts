import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A fully local, offline stand-in for real accounts - same idea as
 * src/agent/mockPlanner.ts for the AI agent. Lets every account/paywall
 * screen be seen and clicked through for real, with no backend, no cost,
 * and no real payment - until you fill in src/auth/supabaseClient.ts and
 * (for real payments) backend/payments-worker, at which point AuthContext
 * switches over automatically.
 *
 * Single local "account" per device, stored in AsyncStorage - this is a
 * demo of the UX, not a multi-user database.
 */

const ACCOUNT_KEY = 'dogTrainingApp:mockAccount';
const SESSION_KEY = 'dogTrainingApp:mockSession';

export const MOCK_USER_ID = 'mock-user';

interface MockAccount {
  email: string;
  password: string;
  name?: string;
  isPremium: boolean;
}

// One-tap demo login - already on the paid plan, so the whole app (every
// level, no paywall) is reachable in a single click with no typing.
const BUILT_IN_ACCOUNT: MockAccount = {
  email: 'neriaok@demo.app',
  password: 'demo',
  name: 'Neriaok',
  isPremium: true,
};

// Exposed for the sign-in screen's "saved account" suggestion UI.
export const BUILT_IN_ACCOUNT_DISPLAY = { name: BUILT_IN_ACCOUNT.name!, email: BUILT_IN_ACCOUNT.email };

async function readAccount(): Promise<MockAccount | null> {
  const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
  return raw ? (JSON.parse(raw) as MockAccount) : null;
}

async function writeAccount(account: MockAccount): Promise<void> {
  await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export async function mockLoadState(): Promise<{ signedIn: boolean; account: MockAccount | null }> {
  const [session, account] = await Promise.all([
    AsyncStorage.getItem(SESSION_KEY),
    readAccount(),
  ]);
  return { signedIn: session === '1', account };
}

export async function mockSignUp(email: string, password: string): Promise<{ error: string | null }> {
  const existing = await readAccount();
  if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
    return { error: 'כבר קיים חשבון עם האימייל הזה - נסה/י להתחבר' };
  }
  await writeAccount({ email, password, isPremium: false });
  await AsyncStorage.setItem(SESSION_KEY, '1');
  return { error: null };
}

export async function mockSignIn(email: string, password: string): Promise<{ error: string | null }> {
  const account = await readAccount();
  if (!account || account.email.toLowerCase() !== email.toLowerCase() || account.password !== password) {
    return { error: 'אימייל או סיסמה שגויים' };
  }
  await AsyncStorage.setItem(SESSION_KEY, '1');
  return { error: null };
}

/** One-tap sign-in as the built-in demo account (already premium). */
export async function mockQuickSignIn(): Promise<void> {
  await writeAccount(BUILT_IN_ACCOUNT);
  await AsyncStorage.setItem(SESSION_KEY, '1');
}

export async function mockSignOut(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function mockSetPremium(value: boolean): Promise<MockAccount | null> {
  const account = await readAccount();
  if (!account) return null;
  const updated = { ...account, isPremium: value };
  await writeAccount(updated);
  return updated;
}
