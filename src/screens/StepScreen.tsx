import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Animated, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DogScene from '../components/DogScene';
import ProgressBar from '../components/ProgressBar';
import { Level, Step, C } from '../data';

interface Props {
  level: Level;
  step: Step;
  stepIdx: number;
  totalSteps: number;
  onComplete: () => void;
  onBack: () => void;
}

function CmdBadge({ cmd, delay, visible, color }: {
  cmd: string; delay: number; visible: boolean; color: string;
}) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.7);
      opacity.setValue(0);
      return;
    }
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

  return (
    <Animated.View style={[
      styles.badge,
      { backgroundColor: color, transform: [{ scale }], opacity },
    ]}>
      <Text style={styles.badgeText}>{cmd}</Text>
    </Animated.View>
  );
}

export default function StepScreen({ level, step, stepIdx, totalSteps, onComplete, onBack }: Props) {
  const [cmdsVisible, setCmdsVisible] = useState(false);
  const [done, setDone] = useState(false);

  const accents = [level.color, '#9B5DE5', '#2EC4B6'];
  const accentLights = [level.colorLight, '#F3EDFF', '#E8FAF9'];
  const accent = accents[stepIdx % 3];
  const accentL = accentLights[stepIdx % 3];

  useEffect(() => {
    setCmdsVisible(false);
    setDone(false);
    const t = setTimeout(() => setCmdsVisible(true), 300);
    return () => clearTimeout(t);
  }, [step.id]);

  const handleDone = () => {
    setDone(true);
    setTimeout(onComplete, 500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { backgroundColor: accentL }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: accent + '40' }]}>
            <Text style={[styles.backText, { color: accent }]}>{'\u2192'} חזרה</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <View style={[styles.levelBadge, { borderColor: accent + '30' }]}>
              <Text style={[styles.levelBadgeText, { color: accent }]}>
                {level.emoji} רמה {level.id}
              </Text>
            </View>
            <Text style={styles.stepCount}>{stepIdx + 1}/{totalSteps}</Text>
          </View>
        </View>
        <ProgressBar value={stepIdx} total={totalSteps} color={accent} />
        <View style={{ height: 16 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step header card */}
        <View style={styles.card}>
          <View style={[styles.stepIcon, { backgroundColor: accentL }]}>
            <Text style={{ fontSize: 22 }}>{step.emoji}</Text>
          </View>
          <Text style={styles.stepTitle}>שלב {stepIdx + 1}</Text>
          <Text style={styles.stepSub}>
            {step.commands.length === 1 ? 'פקודה אחת ללמוד' : `${step.commands.length} פקודות ללמוד`}
          </Text>
        </View>

        {/* Scene + Commands */}
        <View style={styles.card}>
          <View style={{ alignItems: 'center' }}>
            <DogScene illustration={step.illustration} size={300} />
          </View>
          <Text style={styles.cmdLabel}>פקודות לתרגול:</Text>
          <View style={styles.cmdsRow}>
            {step.commands.map((cmd, i) => (
              <CmdBadge
                key={cmd} cmd={`"${cmd}"`}
                delay={i * 200} visible={cmdsVisible} color={accent}
              />
            ))}
          </View>
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={{ fontSize: 22 }}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>טיפ מהמאלף:</Text>
            <Text style={styles.tipText}>{step.tip}</Text>
          </View>
        </View>

        {/* Done button */}
        <TouchableOpacity
          onPress={handleDone}
          disabled={done}
          activeOpacity={0.85}
          style={[
            styles.doneBtn,
            { backgroundColor: done ? '#06D6A0' : accent },
          ]}
        >
          <Text style={styles.doneBtnText}>
            {done ? 'מעולה! ממשיכים...' : 'השלמתי את השלב! ✅'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  backBtn: {
    backgroundColor: 'white', borderWidth: 1.5,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
  },
  backText: { fontSize: 13, fontFamily: 'Heebo_700Bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: {
    backgroundColor: 'white', borderWidth: 1.5,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5,
  },
  levelBadgeText: { fontSize: 12, fontFamily: 'Heebo_700Bold' },
  stepCount: { fontSize: 12, color: C.soft, fontFamily: 'Heebo_600SemiBold' },
  scroll: { padding: 18, paddingTop: 20, gap: 14 },
  card: {
    backgroundColor: C.white, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  stepIcon: {
    width: 46, height: 46, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  stepTitle: {
    fontSize: 17, fontFamily: 'Heebo_800ExtraBold',
    color: C.text, marginBottom: 3,
  },
  stepSub: { fontSize: 12, color: C.soft, fontFamily: 'Heebo_400Regular' },
  cmdLabel: {
    fontSize: 12, color: C.soft, marginBottom: 8, marginTop: 6,
    fontFamily: 'Heebo_500Medium',
  },
  cmdsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badge: {
    paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: 40,
  },
  badgeText: { color: 'white', fontSize: 20, fontFamily: 'Heebo_700Bold' },
  tipCard: {
    backgroundColor: '#FFF9E6', borderWidth: 1.5, borderColor: '#FFD16660',
    borderRadius: 18, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start',
  },
  tipTitle: { fontSize: 12, fontFamily: 'Heebo_700Bold', color: '#B8860B', marginBottom: 3 },
  tipText: { fontSize: 13, color: C.text, lineHeight: 20, fontFamily: 'Heebo_400Regular' },
  doneBtn: {
    borderRadius: 18, paddingVertical: 17, alignItems: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35,
    shadowRadius: 12, elevation: 6,
  },
  doneBtnText: { color: 'white', fontSize: 17, fontFamily: 'Heebo_800ExtraBold' },
});
