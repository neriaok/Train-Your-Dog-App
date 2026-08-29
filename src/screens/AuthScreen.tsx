import React from 'react';
import {
  View, Text, TextInput, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
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
 * Native (iOS/Android) version - uses RN's own textContentType/autoComplete
 * hints, which is how the platform's own password manager (iOS Keychain,
 * Android Autofill) offers saved credentials there. The web equivalent
 * (real <form> + name/autoComplete DOM attributes, for Chrome's password
 * manager) is AuthScreen.web.tsx - Metro picks whichever file matches the
 * build target automatically.
 */
export default function AuthScreen({ onBack, onAuthed }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).auth;
  const {
    mode, setMode, email, setEmail, password, setPassword,
    setEmailFocused, showSavedAccount,
    error, notice, busy, submit, handleQuickSignIn,
  } = useAuthForm(onAuthed);

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

            <View style={styles.fieldWrap}>
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                placeholder={t.email}
                placeholderTextColor={C.soft}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="username"
                autoComplete="email"
              />
              {showSavedAccount && (
                <View style={styles.suggestionDropdown}>
                  <PressableScale onPress={handleQuickSignIn} disabled={busy} style={styles.suggestionRow}>
                    <Text style={styles.suggestionName}>👤 {BUILT_IN_ACCOUNT_DISPLAY.name}</Text>
                    <Text style={styles.suggestionEmail}>{BUILT_IN_ACCOUNT_DISPLAY.email}</Text>
                  </PressableScale>
                </View>
              )}
            </View>
            <TextInput
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setEmailFocused(false)}
              placeholder={t.password}
              placeholderTextColor={C.soft}
              secureTextEntry
              textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
              autoComplete={mode === 'signIn' ? 'password' : 'password-new'}
            />

            {error && <Text style={styles.error}>{error}</Text>}
            {notice === 'signUpSuccess' && <Text style={styles.notice}>{t.signUpSuccess}</Text>}

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
