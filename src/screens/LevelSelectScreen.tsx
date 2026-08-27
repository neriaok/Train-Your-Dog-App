import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import PressableScale from '../components/PressableScale';
import LanguagePicker from '../components/LanguagePicker';
import { Level, C } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useAuth } from '../auth/AuthContext';

interface Props {
  levels: Level[];
  completed: number[];
  onSelect: (id: number) => void;
  onOpenAgent: () => void;
  onOpenAuth: () => void;
  onOpenUpgrade: () => void;
}

export default function LevelSelectScreen({ levels, completed, onSelect, onOpenAgent, onOpenAuth, onOpenUpgrade }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).levels;
  const { accountsEnabled, user, isPremium, signOut } = useAuth();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.topRow, { justifyContent: isRTL ? 'flex-start' : 'flex-end' }]}>
          {accountsEnabled && (
            user ? (
              <PressableScale onPress={signOut} style={styles.accountBtn}>
                <Text style={styles.accountBtnText} numberOfLines={1}>
                  {isPremium ? '👑 ' : ''}{user.email} · {t.signOut}
                </Text>
              </PressableScale>
            ) : (
              <PressableScale onPress={onOpenAuth} style={styles.accountBtn}>
                <Text style={styles.accountBtnText}>{t.signIn}</Text>
              </PressableScale>
            )
          )}
          <LanguagePicker />
        </View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={styles.dog}>🐕</Text>
          <Text style={styles.title}>{t.heading}</Text>
          <Text style={styles.sub}>{t.progress(completed.length, levels.length)}</Text>
        </Animated.View>

        <View style={styles.progressCard}>
          <ProgressBar value={completed.length} total={levels.length} color={C.orange} />
        </View>

        {levels.map((lvl, i) => {
          const locked = i > 0 && !completed.includes(levels[i - 1].id);
          const premiumLocked = !locked && lvl.id > 1 && !isPremium;
          const done = completed.includes(lvl.id);
          return (
            <PressableScale
              key={lvl.id}
              onPress={() => (premiumLocked ? onOpenUpgrade() : onSelect(lvl.id))}
              disabled={locked}
              scaleTo={0.98}
              style={[
                styles.card,
                done ? { borderColor: lvl.color, borderWidth: 2 } :
                  locked ? { borderColor: C.border, borderWidth: 2, backgroundColor: '#F9F9F9' } :
                    premiumLocked ? { borderColor: C.purple + '40', borderWidth: 2 } :
                      { borderColor: lvl.color + '40', borderWidth: 2 },
              ]}
            >
              {done && (
                <View style={[
                  styles.doneBadge,
                  { backgroundColor: lvl.color },
                  isRTL ? { left: 12 } : { right: 12 },
                ]}>
                  <Text style={styles.doneBadgeText}>{t.done}</Text>
                </View>
              )}
              {!done && premiumLocked && (
                <View style={[
                  styles.doneBadge,
                  { backgroundColor: C.purple },
                  isRTL ? { left: 12 } : { right: 12 },
                ]}>
                  <Text style={styles.doneBadgeText}>{t.premiumBadge}</Text>
                </View>
              )}
              <View style={styles.cardRow}>
                <View style={[
                  styles.iconBox,
                  { backgroundColor: locked ? C.border : premiumLocked ? C.purpleL : lvl.color + '22' }
                ]}>
                  <Text style={styles.iconText}>{locked ? '🔒' : premiumLocked ? '👑' : lvl.emoji}</Text>
                </View>
                <View style={[styles.cardText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.levelNum, { color: locked ? C.soft : premiumLocked ? C.purple : lvl.color, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t.levelLabel(lvl.id)}
                  </Text>
                  <Text style={[styles.levelTitle, { color: locked ? C.soft : C.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    {lvl.title}
                  </Text>
                  <Text style={[styles.levelSub, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {lvl.subtitle} - {t.stepsCount(lvl.steps.length)}
                  </Text>
                </View>
                {!locked && (
                  <Text style={[styles.arrow, { color: premiumLocked ? C.purple : lvl.color }]}>{isRTL ? '←' : '→'}</Text>
                )}
              </View>
            </PressableScale>
          );
        })}

        <PressableScale onPress={onOpenAgent} scaleTo={0.98} style={styles.agentCard}>
          <Text style={styles.agentEmoji}>🤖</Text>
          <View style={[styles.agentText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text style={[styles.agentTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t.agentTitle}</Text>
            <Text style={[styles.agentSub, { textAlign: isRTL ? 'right' : 'left' }]}>{t.agentSub}</Text>
          </View>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingTop: 20 },
  topRow: { flexDirection: 'row', marginBottom: 12, gap: 8, alignItems: 'center' },
  accountBtn: {
    backgroundColor: 'white', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, maxWidth: 220,
  },
  accountBtnText: { fontSize: 12, fontFamily: 'Heebo_700Bold', color: C.text },
  dog: { fontSize: 44, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 26, fontFamily: 'Heebo_800ExtraBold',
    color: C.text, textAlign: 'center', marginBottom: 6,
  },
  sub: {
    color: C.soft, fontSize: 14, textAlign: 'center',
    marginBottom: 24, fontFamily: 'Heebo_400Regular',
  },
  progressCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16,
    marginBottom: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: C.border,
  },
  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 20,
    marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07,
    shadowRadius: 10, elevation: 4, overflow: 'hidden',
  },
  doneBadge: {
    position: 'absolute', top: 12, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  doneBadgeText: { color: 'white', fontSize: 11, fontFamily: 'Heebo_700Bold' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 28 },
  cardText: { flex: 1 },
  levelNum: { fontSize: 11, fontFamily: 'Heebo_600SemiBold', marginBottom: 3 },
  levelTitle: { fontSize: 17, fontFamily: 'Heebo_800ExtraBold', marginBottom: 3 },
  levelSub: { fontSize: 13, color: C.soft, fontFamily: 'Heebo_400Regular' },
  arrow: { fontSize: 16 },
  agentCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.purpleL, borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: C.purple + '40', marginTop: 4,
  },
  agentEmoji: { fontSize: 30 },
  agentText: { flex: 1 },
  agentTitle: { fontSize: 15, fontFamily: 'Heebo_800ExtraBold', color: C.purple, marginBottom: 2 },
  agentSub: { fontSize: 12, color: C.soft, fontFamily: 'Heebo_400Regular' },
});
