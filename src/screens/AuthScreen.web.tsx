import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { C } from '../data';
import { BUILT_IN_ACCOUNT_DISPLAY } from '../auth/mockAuth';
import { useAuthForm } from './useAuthForm';
import { styles } from './authStyles';

interface Props { onBack: () => void; onAuthed: () => void; }

/**
 * Web version - a real <form> with properly-named/autocompleted <input>
 * elements, so Chrome's (and other browsers') own password manager can
 * recognize this as a login form: offer to save credentials after a
 * successful submit, and suggest previously-saved ones when the fields are
 * focused. This only works via genuine DOM elements (react-native-web's
 * <TextInput> doesn't forward a `name` prop), so this file renders the
 * form/input/button directly through react-native-web's
 * `unstable_createElement` instead of RN's cross-platform components.
 * Metro picks this file automatically on web; AuthScreen.tsx (RN
 * TextInput + textContentType/autoComplete) is used on iOS/Android.
 *
 * The in-app "saved account" card below is a different thing - a
 * one-tap demo login your code controls, unrelated to (and independent
 * of) whatever the browser itself has saved.
 */
export default function AuthScreen({ onBack, onAuthed }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).auth;
  const {
    isMock, mode, setMode, email, setEmail, password, setPassword,
    error, notice, busy, submit, handleQuickSignIn,
  } = useAuthForm(onAuthed);

  const showSavedAccount = isMock && mode === 'signIn' && email.trim() === '';

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    submit();
  };

  // Raw <input> elements (unlike RN's <TextInput>) don't get react-native-web's
  // automatic browser-appearance reset, so it's applied by hand here to
  // match how every other input in the app looks.
  const inputStyle = [
    styles.input,
    {
      textAlign: isRTL ? 'right' : 'left', width: '100%', boxSizing: 'border-box',
      WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none',
      font: 'inherit', outlineWidth: 0,
    } as const,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
        </PressableScale>
        <Text style={styles.title}>{t.title}</Text>
      </View>

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

          {unstable_createElement('form', {
            onSubmit: handleSubmit,
            style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
            children: [
              unstable_createElement('input', {
                key: 'email',
                name: 'email',
                id: 'email',
                type: 'email',
                autoComplete: 'username',
                value: email,
                onChange: (e: { target: { value: string } }) => setEmail(e.target.value),
                placeholder: t.email,
                style: inputStyle,
              }),
              unstable_createElement('input', {
                key: 'password',
                name: 'password',
                id: 'password',
                type: 'password',
                autoComplete: mode === 'signIn' ? 'current-password' : 'new-password',
                value: password,
                onChange: (e: { target: { value: string } }) => setPassword(e.target.value),
                placeholder: t.password,
                style: inputStyle,
              }),
              // Real submit button so Enter-to-submit and the browser's
              // native "save password?" prompt behave normally.
              unstable_createElement('button', {
                key: 'submit',
                type: 'submit',
                disabled: busy,
                style: [styles.submitBtn, { border: 'none', cursor: busy ? 'default' : 'pointer' }],
                children: React.createElement(
                  Text,
                  { style: styles.submitText },
                  busy ? '...' : (mode === 'signIn' ? t.signInBtn : t.signUpBtn)
                ),
              }),
            ],
          })}

          {error && <Text style={styles.error}>{error}</Text>}
          {notice === 'signUpSuccess' && <Text style={styles.notice}>{t.signUpSuccess}</Text>}

          <PressableScale onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')} style={styles.switchBtn}>
            <Text style={styles.switchText}>{mode === 'signIn' ? t.switchToSignUp : t.switchToSignIn}</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
