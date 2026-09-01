import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView,
  Animated, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DogScene from '../components/DogScene';
import Confetti from '../components/Confetti';
import PressableScale from '../components/PressableScale';
import { Level, C } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { shareText } from '../utils/share';

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
  const [confetti, setConfetti] = useState(true);
  const [shareNotice, setShareNotice] = useState(false);
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

  const totalCommands = level.steps.reduce((a, s) => a + s.commands.length, 0);

  const handleShare = async () => {
    const result = await shareText(t.shareMessage(level.emoji, level.title));
    if (result === 'copied') {
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 3000);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: level.colorLight }]}>
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

          <DogScene illustration={successPose} language={language} size={260} />

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
              backgroundColor: nextLevel.colorLight,
              borderColor: nextLevel.colorMid,
            }]}>
              <Text style={[styles.nextText, { color: nextLevel.color }]}>
                {t.next(nextLevel.emoji, nextLevel.id, nextLevel.title)}
              </Text>
            </View>
          ) : (
            <View style={styles.doneCard}>
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
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
