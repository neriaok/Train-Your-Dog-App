import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { C } from '../data';
import { BUILT_IN_ACCOUNT_DISPLAY } from '../auth/mockAuth';

interface Props { onBack: () => void; onAuthed: () => void; }

export default function AuthScreen({ onBack, onAuthed }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).auth;
  const { isMock, signIn, signUp, quickSignIn } = useAuth();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const showSavedAccount = isMock && mode === 'signIn' && email.trim() === '';

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
      setNotice(t.signUpSuccess);
      setMode('signIn');
    } else {
      onAuthed();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
        </PressableScale>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.tabs}>
              <PressableScale
                onPress={() => setMode('signIn')}
                style={[styles.tab, mode === 'signIn' && styles.tabActive]}
              >
                <Text style={[styles.tabText, mode === 'signIn' && styles.tabTextActive]}>{t.signInTab}</Text>
              </PressableScale>
              <PressableScale
                onPress={() => setMode('signUp')}
                style={[styles.tab, mode === 'signUp' && styles.tabActive]}
              >
                <Text style={[styles.tabText, mode === 'signUp' && styles.tabTextActive]}>{t.signUpTab}</Text>
              </PressableScale>
            </View>

            {showSavedAccount && (
              <PressableScale onPress={handleQuickSignIn} disabled={busy} style={styles.suggestion}>
                <Text style={styles.suggestionIcon}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.suggestionName, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {BUILT_IN_ACCOUNT_DISPLAY.name}
                  </Text>
                  <Text style={[styles.suggestionEmail, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {BUILT_IN_ACCOUNT_DISPLAY.email} · {t.savedAccount}
                  </Text>
                </View>
              </PressableScale>
            )}

            <TextInput
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
              value={email}
              onChangeText={setEmail}
              placeholder={t.email}
              placeholderTextColor={C.soft}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
              value={password}
              onChangeText={setPassword}
              placeholder={t.password}
              placeholderTextColor={C.soft}
              secureTextEntry
            />

            {error && <Text style={styles.error}>{error}</Text>}
            {notice && <Text style={styles.notice}>{notice}</Text>}

            <PressableScale onPress={submit} disabled={busy} style={styles.submitBtn}>
              <Text style={styles.submitText}>{busy ? '...' : (mode === 'signIn' ? t.signInBtn : t.signUpBtn)}</Text>
            </PressableScale>

            <PressableScale onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')} style={styles.switchBtn}>
              <Text style={styles.switchText}>{mode === 'signIn' ? t.switchToSignUp : t.switchToSignIn}</Text>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10,
  },
  backBtn: {
    backgroundColor: 'white', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
  },
  backText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  title: { fontSize: 18, fontFamily: 'Heebo_800ExtraBold', color: C.text },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.purpleL, borderRadius: 14, borderWidth: 1.5, borderColor: C.purple + '40',
    padding: 12,
  },
  suggestionIcon: {
    fontSize: 20, backgroundColor: C.purpleL, borderRadius: 10,
    width: 34, height: 34, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden',
  },
  suggestionName: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  suggestionEmail: { fontSize: 11, fontFamily: 'Heebo_400Regular', color: C.soft },
  card: {
    backgroundColor: C.white, borderRadius: 28, padding: 24,
    borderWidth: 1, borderColor: C.border, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  tabs: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 14, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: C.orange },
  tabText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.soft },
  tabTextActive: { color: 'white' },
  input: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, fontFamily: 'Heebo_400Regular', color: C.text,
  },
  error: { color: '#E5484D', fontSize: 12, fontFamily: 'Heebo_500Medium', textAlign: 'center' },
  notice: { color: C.teal, fontSize: 12, fontFamily: 'Heebo_500Medium', textAlign: 'center' },
  submitBtn: {
    backgroundColor: C.orange, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4,
  },
  submitText: { color: 'white', fontSize: 15, fontFamily: 'Heebo_800ExtraBold' },
  switchBtn: { alignItems: 'center', paddingVertical: 6 },
  switchText: { color: C.soft, fontSize: 12, fontFamily: 'Heebo_500Medium' },
});
