import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import { LEVELS, C } from '../data';

interface Props {
  completed: number[];
  onSelect: (id: number) => void;
}

export default function LevelSelectScreen({ completed, onSelect }: Props) {
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
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={styles.dog}>🐕</Text>
          <Text style={styles.title}>בחרו רמה</Text>
          <Text style={styles.sub}>השלמתם {completed.length} מתוך {LEVELS.length} רמות</Text>
        </Animated.View>

        <View style={styles.progressCard}>
          <ProgressBar value={completed.length} total={LEVELS.length} color={C.orange} />
        </View>

        {LEVELS.map((lvl, i) => {
          const locked = i > 0 && !completed.includes(LEVELS[i - 1].id);
          const done = completed.includes(lvl.id);
          return (
            <TouchableOpacity
              key={lvl.id}
              onPress={() => !locked && onSelect(lvl.id)}
              activeOpacity={locked ? 1 : 0.8}
              style={[
                styles.card,
                done ? { borderColor: lvl.color, borderWidth: 2 } :
                  locked ? { borderColor: C.border, borderWidth: 2, backgroundColor: '#F9F9F9' } :
                    { borderColor: lvl.color + '40', borderWidth: 2 },
              ]}
            >
              {done && (
                <View style={[styles.doneBadge, { backgroundColor: lvl.color }]}>
                  <Text style={styles.doneBadgeText}>הושלם</Text>
                </View>
              )}
              <View style={styles.cardRow}>
                <View style={[
                  styles.iconBox,
                  { backgroundColor: locked ? C.border : lvl.color + '22' }
                ]}>
                  <Text style={styles.iconText}>{locked ? '🔒' : lvl.emoji}</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.levelNum, { color: locked ? C.soft : lvl.color }]}>
                    רמה {lvl.id}
                  </Text>
                  <Text style={[styles.levelTitle, { color: locked ? C.soft : C.text }]}>
                    {lvl.title}
                  </Text>
                  <Text style={styles.levelSub}>
                    {lvl.subtitle} - {lvl.steps.length} שלבים
                  </Text>
                </View>
                {!locked && (
                  <Text style={[styles.arrow, { color: lvl.color }]}>{'\u2190'}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingTop: 32 },
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
    position: 'absolute', top: 12, left: 12, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  doneBadgeText: { color: 'white', fontSize: 11, fontFamily: 'Heebo_700Bold' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 28 },
  cardText: { flex: 1, alignItems: 'flex-end' },
  levelNum: { fontSize: 11, fontFamily: 'Heebo_600SemiBold', marginBottom: 3 },
  levelTitle: { fontSize: 17, fontFamily: 'Heebo_800ExtraBold', marginBottom: 3 },
  levelSub: { fontSize: 13, color: C.soft, fontFamily: 'Heebo_400Regular' },
  arrow: { fontSize: 16 },
});
