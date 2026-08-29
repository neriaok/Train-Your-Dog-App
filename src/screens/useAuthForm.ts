import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export type AuthMode = 'signIn' | 'signUp';
export type AuthNotice = 'signUpSuccess' | null;

/**
 * Shared state/logic for the sign-in/sign-up form, used by both
 * AuthScreen.tsx (native) and AuthScreen.web.tsx (web - real <form> +
 * browser password-manager attributes). Keeping this in one place means
 * the two view files only differ in how they render inputs, not in what
 * signing in/up actually does.
 */
export function useAuthForm(onAuthed: () => void) {
  const { isMock, signIn, signUp, quickSignIn } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<AuthNotice>(null);
  const [busy, setBusy] = useState(false);

  const handleQuickSignIn = async () => {
    setBusy(true);
    await quickSignIn();
    setBusy(false);
    onAuthed();
  };

  const submit = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === 'signUp' && !isMock) {
      // Real Supabase requires email verification before the session is
      // usable - mock sign-up already signs the user in immediately, so
      // it falls through to onAuthed() below like sign-in does.
      setNotice('signUpSuccess');
      setMode('signIn');
    } else {
      onAuthed();
    }
  };

  return {
    isMock, mode, setMode, email, setEmail, password, setPassword,
    error, notice, busy, submit, handleQuickSignIn,
  };
}
