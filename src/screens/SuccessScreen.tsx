import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView,
  Animated, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DogScene from '../components/DogScene';
import Confetti from '../components/Confetti';
import PressableScale from '../components/PressableScale';
import { Level } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { shareText } from '../utils/share';
import { useTheme, Colors } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { submitFeedback } from '../feedback/submitFeedback';

const FEEDBACK_SEEN_KEY = 'dogTrainingApp:feedbackPromptSeen';

interface Props {
  levels: Level[];
  level: Level;
  isLast: boolean;
  onNext: () => void;
  onRestart: () => void;
}

export default function SuccessScreen({ levels, level, isLast, onNext, onRestart }: Props) {
  const { language } = useLanguage();
  const t = useStrings(language).success;
  const { theme, colors: C, stylePack } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { isMock, user } = useAuth();
  const [confetti, setConfetti] = useState(true);
  const [shareNotice, setShareNotice] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;

  const nextLevel = levels.find(l => l.id === level.id + 1);
  const successPose =
    level.id === 2 ? 'crate_full' :
      level.id === 3 ? 'leave_walk' :
        level.id === 4 ? 'walk_stay' :
          level.id === 5 ? 'trick_spin' :
            level.id === 6 ? 'stay2_come' :
              level.id === 7 ? 'recall2_down' :
                level.id === 8 ? 'social_dance' :
                  level.id === 9 ? 'field_go' :
                    level.id === 10 ? 'combo_sit' : 'sit';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, delay: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.spring(trophyScale, { toValue: 1, delay: 400, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => setConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLast) return;
    AsyncStorage.getItem(FEEDBACK_SEEN_KEY).then(seen => { if (!seen) setFeedbackVisible(true); });
  }, [isLast]);

  const totalCommands = level.steps.reduce((a, s) => a + s.commands.length, 0);

  const handleShare = async () => {
    const result = await shareText(t.shareMessage(level.emoji, level.title));
    if (result === 'copied') {
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 3000);
    }
  };

  const dismissFeedback = () => {
    setFeedbackVisible(false);
    AsyncStorage.setItem(FEEDBACK_SEEN_KEY, 'true');
  };

  const handleSendFeedback = async () => {
    setFeedbackBusy(true);
    try {
      await submitFeedback(feedbackText.trim(), isMock, user?.id);
      setFeedbackSent(true);
    } catch {
      // Best-effort - still mark as seen so a failed send doesn't nag forever.
    }
    AsyncStorage.setItem(FEEDBACK_SEEN_KEY, 'true');
    setFeedbackBusy(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme === 'dark' ? C.bg : level.colorLight }]}>
      <Confetti active={confetti} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <Animated.Text style={[styles.trophy, { transform: [{ scale: trophyScale }] }]}>
            🏆
          </Animated.Text>
          <View style={styles.stars}>
            {['⭐', '🌟', '✨'].map((s, i) => (
              <Text key={i} style={styles.star}>{s}</Text>
            ))}
          </View>

          <DogScene illustration={successPose} language={language} size={260} furPack={stylePack} />

          <Text style={styles.title}>{t.title}</Text>
          <Text style={[styles.sub, { color: level.color }]}>
            {t.subtitle(level.emoji, level.title)}
          </Text>
          <Text style={styles.body}>
            {t.body(level.steps.length)}
          </Text>

          {/* Stats */}
          <View style={styles.stats}>
            {[
              { label: t.statCommands, val: String(totalCommands), emoji: '🎯' },
              { label: t.statSteps, val: `${level.steps.length}/${level.steps.length}`, emoji: '📚' },
              { label: t.statStars, val: '⭐⭐⭐', emoji: null },
            ].map(({ label, val, emoji }) => (
              <View key={label} style={[styles.stat, { backgroundColor: level.color + '15' }]}>
                {emoji && <Text style={styles.statEmoji}>{emoji}</Text>}
                <Text style={[styles.statVal, { color: level.color, fontSize: val.length > 4 ? 12 : 18 }]}>
                  {val}
                </Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Next level or completion */}
          {nextLevel && !isLast ? (
            <View style={[styles.nextCard, {
              backgroundColor: theme === 'dark' ? nextLevel.color + '25' : nextLevel.colorLight,
              borderColor: theme === 'dark' ? nextLevel.color + '60' : nextLevel.colorMid,
            }]}>
              <Text style={[styles.nextText, { color: nextLevel.color }]}>
                {t.next(nextLevel.emoji, nextLevel.id, nextLevel.title)}
              </Text>
            </View>
          ) : (
            <View style={[styles.doneCard, theme === 'dark' && { backgroundColor: '#0F3D3040' }]}>
              <Text style={styles.doneText}>{t.allDone}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.btns}>
            {nextLevel && !isLast && (
              <PressableScale
                onPress={onNext}
                style={[styles.nextBtn, { backgroundColor: nextLevel.color }]}
              >
                <Text style={styles.btnText}>{t.nextBtn(nextLevel.emoji)}</Text>
              </PressableScale>
            )}
            <PressableScale
              onPress={onRestart}
              style={[styles.restartBtn, { borderColor: level.color }]}
            >
              <Text style={[styles.restartText, { color: level.color }]}>{t.restartBtn}</Text>
            </PressableScale>
          </View>

          <PressableScale onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareText}>{t.shareBtn}</Text>
          </PressableScale>
          {shareNotice && <Text style={styles.shareNotice}>{t.shareCopied}</Text>}

          {isLast && feedbackVisible && (
            <View style={styles.feedbackCard}>
              {feedbackSent ? (
                <Text style={styles.feedbackThanks}>{t.feedbackThanks}</Text>
              ) : (
                <>
                  <Text style={styles.feedbackTitle}>{t.feedbackTitle}</Text>
                  <Text style={styles.feedbackBody}>{t.feedbackBody}</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                    placeholder={t.feedbackPlaceholder}
                    placeholderTextColor={C.soft}
                    multiline
                  />
                  <View style={styles.feedbackBtns}>
                    <PressableScale onPress={handleSendFeedback} disabled={feedbackBusy} style={styles.feedbackSendBtn}>
                      <Text style={styles.feedbackSendText}>{feedbackBusy ? '...' : t.feedbackSend}</Text>
                    </PressableScale>
                    <PressableScale onPress={dismissFeedback} style={styles.feedbackSkipBtn}>
                      <Text style={styles.feedbackSkipText}>{t.feedbackSkip}</Text>
                    </PressableScale>
                  </View>
                </>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingTop: 32, alignItems: 'center' },
  card: {
    backgroundColor: C.white, borderRadius: 32, padding: 28,
    width: '100%', maxWidth: 400, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 10,
    borderWidth: 1, borderColor: C.border,
  },
  trophy: { fontSize: 64, marginBottom: 4 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  star: { fontSize: 26 },
  title: {
    fontSize: 24, fontFamily: 'Heebo_800ExtraBold',
    color: C.text, marginTop: 8, marginBottom: 6,
  },
  sub: { fontSize: 17, fontFamily: 'Heebo_700Bold', marginBottom: 10 },
  body: {
    color: C.soft, fontSize: 14, lineHeight: 22, textAlign: 'center',
    marginBottom: 20, fontFamily: 'Heebo_400Regular',
  },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 18, width: '100%' },
  stat: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  statEmoji: { fontSize: 16, marginBottom: 3 },
  statVal: { fontFamily: 'Heebo_800ExtraBold', lineHeight: 22 },
  statLabel: { fontSize: 10, color: C.soft, fontFamily: 'Heebo_400Regular', marginTop: 2 },
  nextCard: {
    borderWidth: 1.5, borderRadius: 16, padding: 12,
    marginBottom: 16, width: '100%',
  },
  nextText: { fontSize: 13, fontFamily: 'Heebo_700Bold', textAlign: 'center' },
  doneCard: {
    backgroundColor: '#E6FBF5', borderWidth: 1.5, borderColor: '#06D6A060',
    borderRadius: 16, padding: 12, marginBottom: 16, width: '100%',
  },
  doneText: {
    color: '#06D6A0', fontSize: 13, fontFamily: 'Heebo_700Bold', textAlign: 'center',
  },
  btns: { flexDirection: 'row', gap: 10, width: '100%' },
  nextBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 5,
  },
  restartBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    borderWidth: 2, backgroundColor: C.white,
  },
  btnText: { color: 'white', fontSize: 15, fontFamily: 'Heebo_800ExtraBold' },
  restartText: { fontSize: 15, fontFamily: 'Heebo_800ExtraBold' },
  shareBtn: { marginTop: 10, paddingVertical: 10, alignItems: 'center', width: '100%' },
  shareText: { fontSize: 13, fontFamily: 'Heebo_600SemiBold', color: C.soft },
  shareNotice: {
    fontSize: 11, fontFamily: 'Heebo_500Medium', color: C.teal,
    textAlign: 'center', marginTop: 2,
  },
  feedbackCard: {
    marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: C.border, width: '100%',
  },
  feedbackTitle: {
    fontSize: 15, fontFamily: 'Heebo_800ExtraBold', color: C.text,
    textAlign: 'center', marginBottom: 4,
  },
  feedbackBody: {
    fontSize: 12, fontFamily: 'Heebo_400Regular', color: C.soft,
    textAlign: 'center', marginBottom: 12,
  },
  feedbackInput: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, fontFamily: 'Heebo_400Regular', color: C.text,
    minHeight: 60, textAlignVertical: 'top', marginBottom: 10,
  },
  feedbackBtns: { flexDirection: 'row', gap: 8 },
  feedbackSendBtn: {
    flex: 1, backgroundColor: C.orange, borderRadius: 12, paddingVertical: 11, alignItems: 'center',
  },
  feedbackSendText: { color: 'white', fontSize: 13, fontFamily: 'Heebo_700Bold' },
  feedbackSkipBtn: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 11,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.border,
  },
  feedbackSkipText: { color: C.soft, fontSize: 13, fontFamily: 'Heebo_600SemiBold' },
  feedbackThanks: {
    fontSize: 14, fontFamily: 'Heebo_700Bold', color: C.teal, textAlign: 'center',
  },
});
