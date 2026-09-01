import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import PressableScale from '../components/PressableScale';
import LanguagePicker from '../components/LanguagePicker';
import { Level, C } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useAuth } from '../auth/AuthContext';
import { useDogProfile } from '../profile/DogProfileContext';
import { StreakState, WEEKLY_GOAL } from '../progress/streak';

interface Props {
  levels: Level[];
  completed: number[];
  streak: StreakState;
  onSelect: (id: number) => void;
  onOpenAgent: () => void;
  onOpenAuth: () => void;
  onOpenUpgrade: () => void;
  onOpenProfile: () => void;
}

export default function LevelSelectScreen({ levels, completed, streak, onSelect, onOpenAgent, onOpenAuth, onOpenUpgrade, onOpenProfile }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).levels;
  const { user, isPremium, signOut } = useAuth();
  const { profile } = useDogProfile();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-16)).current;
  const [showTeaser, setShowTeaser] = useState(false);
  const teaserOpacity = useRef(new Animated.Value(0)).current;
  const teaserSlide = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowTeaser(true);
      Animated.parallel([
        Animated.timing(teaserOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(teaserSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]).start();
    }, 1000);
    const hideTimer = setTimeout(() => dismissTeaser(), 7000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  const dismissTeaser = () => {
    Animated.timing(teaserOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
      .start(() => setShowTeaser(false));
  };

  const openAgent = () => { dismissTeaser(); onOpenAgent(); };

  // Personalized nudge from the profile's optional age/experience answers -
  // most specific first, since a puppy or senior tip matters more here than
  // a generic beginner one even if both would technically apply.
  const personalizedTip = !user ? null :
    profile?.ageGroup === 'puppy' ? t.tipPuppy :
      profile?.ageGroup === 'senior' ? t.tipSenior :
        profile?.experience === 'beginner' ? t.tipBeginner : null;

  const badges: { key: string; emoji: string; label: string; color: string }[] = [];
  levels.forEach(lvl => {
    if (completed.includes(lvl.id)) {
      badges.push({ key: `lvl-${lvl.id}`, emoji: lvl.emoji, label: lvl.title, color: lvl.color });
    }
  });
  if (streak.streak >= 3) {
    badges.push({ key: 'streak', emoji: '🔥', label: t.streakBadge(streak.streak), color: C.orange });
  }
  if (levels.length > 0 && completed.length === levels.length) {
    badges.push({ key: 'alldone', emoji: '🏆', label: t.badgeAllDone, color: C.purple });
  }
  if (streak.weeklyGoalMet) {
    badges.push({ key: 'weekly', emoji: '🎯', label: t.weeklyBadge, color: C.teal });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.topRow, { justifyContent: isRTL ? 'flex-start' : 'flex-end' }]}>
          {user ? (
            <PressableScale onPress={signOut} style={styles.accountBtn}>
              <Text style={styles.accountBtnText} numberOfLines={1}>
                {isPremium ? '👑 ' : ''}{user.name ?? user.email} · {t.signOut}
              </Text>
            </PressableScale>
          ) : (
            <PressableScale onPress={onOpenAuth} style={styles.accountBtn}>
              <Text style={styles.accountBtnText}>{t.signIn}</Text>
            </PressableScale>
          )}
          {user && (
            <PressableScale onPress={onOpenProfile} style={styles.accountBtn}>
              {profile?.name ? (
                <Text style={styles.accountBtnText} numberOfLines={1}>🐾 {profile.name}</Text>
              ) : (
                <Text style={styles.accountBtnText}>➕ {t.addDog}</Text>
              )}
            </PressableScale>
          )}
          <LanguagePicker />
        </View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {user && profile?.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.heroPhoto} />
          ) : (
            <Text style={styles.dog}>🐕</Text>
          )}
          <Text style={styles.title}>{t.heading}</Text>
          <Text style={styles.sub}>{t.progress(completed.length, levels.length)}</Text>
        </Animated.View>

        <View style={styles.progressCard}>
          <ProgressBar value={completed.length} total={levels.length} color={C.orange} />
          {streak.streak > 0 && (
            <View style={[styles.streakRow, { justifyContent: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.streakText}>🔥 {t.streakLabel(streak.streak)}</Text>
            </View>
          )}
        </View>

        {streak.streak > 0 && !streak.practicedToday && (
          <View style={styles.reminderBanner}>
            <Text style={styles.reminderText}>{t.streakReminder}</Text>
          </View>
        )}

        {personalizedTip && (
          <View style={styles.personalTip}>
            <Text style={[styles.personalTipText, { textAlign: isRTL ? 'right' : 'left' }]}>💡 {personalizedTip}</Text>
          </View>
        )}

        <View style={[styles.weeklyCard, streak.weeklyGoalMet && { borderColor: C.teal + '60', backgroundColor: C.tealL }]}>
          <View style={[styles.weeklyHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.weeklyTitle}>🎯 {t.weeklyChallengeTitle}</Text>
            <View style={[styles.weeklyDots, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.weeklyDot, i < streak.weeklyCount && { backgroundColor: C.teal, borderColor: C.teal }]}
                />
              ))}
            </View>
          </View>
          <Text style={[styles.weeklyText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {streak.weeklyGoalMet ? t.weeklyChallengeDone : t.weeklyChallengeProgress(streak.weeklyCount, WEEKLY_GOAL)}
          </Text>
        </View>

        {badges.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgesRow}
            contentContainerStyle={styles.badgesRowContent}
          >
            {badges.map(b => (
              <View key={b.key} style={[styles.badgeChip, { borderColor: b.color + '50', backgroundColor: b.color + '15' }]}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <Text style={[styles.badgeLabel, { color: b.color }]} numberOfLines={1}>{b.label}</Text>
              </View>
            ))}
          </ScrollView>
        )}

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
              accessibilityLabel={`${t.levelLabel(lvl.id)} - ${lvl.title}${done ? `, ${t.done}` : ''}${premiumLocked ? `, ${t.premiumBadge}` : ''}`}
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
                <View style={[
                  styles.iconBox,
                  { backgroundColor: locked ? C.border : premiumLocked ? C.purpleL : lvl.color + '22' }
                ]}>
                  <Text style={styles.iconText}>{locked ? '🔒' : premiumLocked ? '👑' : lvl.emoji}</Text>
                </View>
                {!locked && (
                  <Text style={[styles.arrow, { color: premiumLocked ? C.purple : lvl.color }]}>{isRTL ? '←' : '→'}</Text>
                )}
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>

      <View pointerEvents="box-none" style={[styles.fabWrap, isRTL ? { left: 16 } : { right: 16 }]}>
        {showTeaser && (
          <Animated.View style={[styles.teaser, { opacity: teaserOpacity, transform: [{ translateY: teaserSlide }] }]}>
            <PressableScale onPress={dismissTeaser} style={styles.teaserClose} accessibilityLabel={t.closeHint}>
              <Text style={styles.teaserCloseText}>×</Text>
            </PressableScale>
            <PressableScale onPress={openAgent} style={styles.teaserBody} accessibilityLabel={`${t.agentTitle} - ${t.agentSub}`}>
              <Text style={[styles.teaserTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t.agentTitle}</Text>
              <Text style={[styles.teaserSub, { textAlign: isRTL ? 'right' : 'left' }]}>{t.agentSub}</Text>
            </PressableScale>
          </Animated.View>
        )}
        <PressableScale onPress={openAgent} scaleTo={0.92} style={styles.fab} accessibilityLabel={t.openAssistant}>
          <Text style={styles.fabIcon}>🤖</Text>
        </PressableScale>
      </View>
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
  heroPhoto: {
    width: 64, height: 64, borderRadius: 32, alignSelf: 'center', marginBottom: 8,
    borderWidth: 2, borderColor: C.white,
  },
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
  streakRow: { flexDirection: 'row', marginTop: 10 },
  streakText: { fontSize: 12, fontFamily: 'Heebo_700Bold', color: C.orange },
  reminderBanner: {
    backgroundColor: C.orangeL, borderWidth: 1.5, borderColor: C.orange + '40',
    borderRadius: 14, padding: 12, marginBottom: 16,
  },
  reminderText: { fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.orange, textAlign: 'center' },
  personalTip: {
    backgroundColor: C.purpleL, borderWidth: 1.5, borderColor: C.purple + '30',
    borderRadius: 14, padding: 12, marginBottom: 16,
  },
  personalTipText: { fontSize: 12, fontFamily: 'Heebo_500Medium', color: C.purple, lineHeight: 18 },
  weeklyCard: {
    backgroundColor: C.white, borderRadius: 16, padding: 14, marginBottom: 16,
    borderWidth: 1.5, borderColor: C.border,
  },
  weeklyHeader: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  weeklyTitle: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  weeklyDots: { gap: 6 },
  weeklyDot: {
    width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.border,
    backgroundColor: C.bg,
  },
  weeklyText: { fontSize: 12, fontFamily: 'Heebo_400Regular', color: C.soft },
  badgesRow: { marginBottom: 16 },
  badgesRowContent: { gap: 8, paddingRight: 2 },
  badgeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
    maxWidth: 160,
  },
  badgeEmoji: { fontSize: 15 },
  badgeLabel: { fontSize: 12, fontFamily: 'Heebo_700Bold' },
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
  fabWrap: {
    position: 'absolute', bottom: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 10,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: C.purple,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 6,
  },
  fabIcon: { fontSize: 26 },
  teaser: {
    maxWidth: 220, backgroundColor: C.white, borderRadius: 16, paddingVertical: 10,
    paddingHorizontal: 14, marginBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 5,
    borderWidth: 1, borderColor: C.border,
  },
  teaserBody: { paddingRight: 14 },
  teaserClose: {
    position: 'absolute', top: 4, right: 6, width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  teaserCloseText: { fontSize: 15, color: C.soft, lineHeight: 16 },
  teaserTitle: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.purple, marginBottom: 2 },
  teaserSub: { fontSize: 11.5, color: C.soft, fontFamily: 'Heebo_400Regular', lineHeight: 16 },
});
