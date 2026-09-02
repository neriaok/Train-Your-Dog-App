import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { Level } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useDogProfile } from '../profile/DogProfileContext';
import { StreakState } from '../progress/streak';
import { useTheme, Colors } from '../theme/ThemeContext';
import { shareText } from '../utils/share';

interface Props {
  levels: Level[];
  completed: number[];
  streak: StreakState;
  onBack: () => void;
}

export default function TrophyRoomScreen({ levels, completed, streak, onBack }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).trophyRoom;
  const { profile } = useDogProfile();
  const { colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [shareNotice, setShareNotice] = useState(false);

  const allDone = levels.length > 0 && completed.length === levels.length;

  const specialBadges = [
    streak.streak >= 3 && { key: 'streak', emoji: '🔥', label: t.streakBadge(streak.streak), color: C.orangeText },
    streak.weeklyGoalMet && { key: 'weekly', emoji: '🎯', label: t.weeklyBadge, color: C.teal },
    allDone && { key: 'alldone', emoji: '🏆', label: t.allDoneBadge, color: C.purpleText },
  ].filter(Boolean) as { key: string; emoji: string; label: string; color: string }[];

  const handleShare = async () => {
    const result = await shareText(t.certificateShareMessage(profile?.name ?? ''));
    if (result === 'copied') {
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 3000);
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.countLabel, { textAlign: 'center' }]}>
          {t.earnedCount(completed.length, levels.length)}
        </Text>

        {allDone && (
          <View style={styles.certificate}>
            <Text style={styles.certificateEmoji}>🎓</Text>
            <Text style={styles.certificateTitle}>{t.certificateTitle}</Text>
            <Text style={styles.certificateBody}>
              {t.certificateBody(profile?.name ?? t.yourDogFallback)}
            </Text>
            <PressableScale onPress={handleShare} style={styles.certificateShareBtn}>
              <Text style={styles.certificateShareText}>{t.shareBtn}</Text>
            </PressableScale>
            {shareNotice && <Text style={styles.shareNotice}>{t.shareCopied}</Text>}
          </View>
        )}

        {specialBadges.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t.sectionSpecial}</Text>
            <View style={[styles.specialRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {specialBadges.map(b => (
                <View key={b.key} style={[styles.specialChip, { borderColor: b.color + '50', backgroundColor: b.color + '15' }]}>
                  <Text style={styles.specialEmoji}>{b.emoji}</Text>
                  <Text style={[styles.specialLabel, { color: b.color }]}>{b.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t.sectionLevels}</Text>
        <View style={styles.grid}>
          {levels.map(lvl => {
            const earned = completed.includes(lvl.id);
            return (
              <View
                key={lvl.id}
                style={[
                  styles.badgeCard,
                  earned
                    ? { borderColor: lvl.color, backgroundColor: lvl.color + '12' }
                    : styles.badgeCardLocked,
                ]}
              >
                <Text style={[styles.badgeEmoji, !earned && styles.badgeEmojiLocked]}>
                  {earned ? lvl.emoji : '🔒'}
                </Text>
                <Text
                  style={[styles.badgeLabel, { color: earned ? C.text : C.soft }]}
                  numberOfLines={2}
                >
                  {lvl.title}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10,
  },
  backBtn: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
  },
  backText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  title: { fontSize: 18, fontFamily: 'Heebo_800ExtraBold', color: C.text },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 32 },
  countLabel: { fontSize: 14, color: C.soft, fontFamily: 'Heebo_500Medium', marginBottom: 18 },
  certificate: {
    backgroundColor: C.purpleL, borderWidth: 1.5, borderColor: C.purple + '40',
    borderRadius: 22, padding: 20, alignItems: 'center', marginBottom: 24,
  },
  certificateEmoji: { fontSize: 44, marginBottom: 6 },
  certificateTitle: {
    fontSize: 18, fontFamily: 'Heebo_800ExtraBold', color: C.purpleText,
    marginBottom: 8, textAlign: 'center',
  },
  certificateBody: {
    fontSize: 13, color: C.text, fontFamily: 'Heebo_400Regular',
    textAlign: 'center', lineHeight: 20, marginBottom: 14,
  },
  certificateShareBtn: {
    backgroundColor: C.purple, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24,
  },
  certificateShareText: { color: 'white', fontSize: 14, fontFamily: 'Heebo_700Bold' },
  shareNotice: { fontSize: 11, fontFamily: 'Heebo_500Medium', color: C.teal, marginTop: 8 },
  sectionTitle: {
    fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.soft,
    marginBottom: 10, marginTop: 4,
  },
  specialRow: { flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  specialChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
  },
  specialEmoji: { fontSize: 15 },
  specialLabel: { fontSize: 12, fontFamily: 'Heebo_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: {
    width: '31%', aspectRatio: 1, borderRadius: 18, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', padding: 6,
  },
  badgeCardLocked: { borderColor: C.border, backgroundColor: C.white, opacity: 0.6 },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeEmojiLocked: { opacity: 0.5 },
  badgeLabel: { fontSize: 10.5, fontFamily: 'Heebo_600SemiBold', textAlign: 'center' },
});
