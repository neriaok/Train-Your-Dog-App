import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useTheme, Colors } from '../theme/ThemeContext';

/**
 * Fill this in with your deployed backend/payments-worker URL to let this
 * screen create real Stripe Checkout sessions. Leave empty and, once
 * accounts are also real (Supabase configured), the button just shows a
 * "coming soon" message. Until then (mock accounts - the default), the
 * button simulates a purchase locally so the whole flow can be seen and
 * tried without any backend or real charge - see src/auth/mockAuth.ts.
 * Setup steps: backend/payments-worker/README.md
 */
export const PAYMENTS_BACKEND_URL = '';

function isPaymentsConfigured(): boolean {
  return PAYMENTS_BACKEND_URL.trim().length > 0;
}

interface Props { onBack: () => void; onSignInRequired: () => void; }

export default function UpgradeScreen({ onBack, onSignInRequired }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).upgrade;
  const { user, isMock, isPremium, upgradeToPremium, downgradeFromPremium } = useAuth();
  const { colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!user) {
      onSignInRequired();
      return;
    }
    if (isMock) {
      setBusy(true);
      await upgradeToPremium();
      setBusy(false);
      return;
    }
    if (!isPaymentsConfigured()) {
      setNotice(t.notConfigured);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${PAYMENTS_BACKEND_URL.replace(/\/$/, '')}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) await Linking.openURL(data.url);
      else setNotice(data.error ?? t.notConfigured);
    } catch {
      setNotice(t.notConfigured);
    } finally {
      setBusy(false);
    }
  };

  const handleDowngrade = async () => {
    setBusy(true);
    await downgradeFromPremium();
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.body}>{t.body}</Text>

          {notice && <Text style={styles.notice}>{notice}</Text>}

          {user && isPremium ? (
            <>
              <Text style={styles.premiumNotice}>{t.alreadyPremium}</Text>
              {isMock && (
                <PressableScale onPress={handleDowngrade} disabled={busy} style={styles.downgradeBtn}>
                  <Text style={styles.downgradeText}>{busy ? '...' : t.downgradeBtn}</Text>
                </PressableScale>
              )}
            </>
          ) : user ? (
            <>
              <PressableScale onPress={handleUpgrade} disabled={busy} style={styles.upgradeBtn}>
                <Text style={styles.upgradeText}>{busy ? '...' : t.upgradeBtn}</Text>
              </PressableScale>
              {isMock && <Text style={styles.demoNote}>{t.demoNote}</Text>}
            </>
          ) : (
            <>
              <Text style={styles.notice}>{t.needSignIn}</Text>
              <PressableScale onPress={onSignInRequired} style={styles.upgradeBtn}>
                <Text style={styles.upgradeText}>{t.signInBtn}</Text>
              </PressableScale>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.purpleL },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  backBtn: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start',
  },
  backText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: C.white, borderRadius: 28, padding: 28,
    width: '100%', maxWidth: 400, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 6,
  },
  crown: { fontSize: 48, marginBottom: 8 },
  title: {
    fontSize: 22, fontFamily: 'Heebo_800ExtraBold', color: C.text,
    marginBottom: 10, textAlign: 'center',
  },
  body: {
    fontSize: 14, color: C.soft, lineHeight: 22, textAlign: 'center',
    marginBottom: 18, fontFamily: 'Heebo_400Regular',
  },
  notice: {
    fontSize: 12, color: C.purple, fontFamily: 'Heebo_500Medium',
    textAlign: 'center', marginBottom: 14,
  },
  premiumNotice: {
    fontSize: 15, color: C.purple, fontFamily: 'Heebo_800ExtraBold',
    textAlign: 'center', marginBottom: 14,
  },
  demoNote: {
    fontSize: 11, color: C.soft, fontFamily: 'Heebo_400Regular',
    textAlign: 'center', marginTop: 10,
  },
  upgradeBtn: {
    backgroundColor: C.purple, borderRadius: 16, paddingVertical: 16,
    paddingHorizontal: 32, alignItems: 'center', width: '100%', marginTop: 4,
  },
  upgradeText: { color: 'white', fontSize: 16, fontFamily: 'Heebo_800ExtraBold' },
  downgradeBtn: {
    borderRadius: 16, paddingVertical: 13, paddingHorizontal: 32,
    alignItems: 'center', width: '100%', marginTop: 4,
    borderWidth: 1.5, borderColor: C.border,
  },
  downgradeText: { color: C.soft, fontSize: 13, fontFamily: 'Heebo_600SemiBold' },
});
