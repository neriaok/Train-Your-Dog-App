import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { C } from '../data';

/** A single pulsing placeholder box - the building block for loading screens. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[styles.box, style, { opacity }]} />;
}

/** Mimics the shape of LevelSelectScreen while its data is still loading,
 * so the app never shows a blank flash between "app launched" and "we know
 * who's signed in and what they've completed". */
export function LevelsSkeleton() {
  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <Skeleton style={styles.pill} />
        <Skeleton style={styles.pill} />
      </View>
      <Skeleton style={styles.heroCircle} />
      <Skeleton style={styles.titleLine} />
      <Skeleton style={styles.subLine} />
      <Skeleton style={styles.progressCard} />
      {[0, 1, 2].map(i => (
        <View key={i} style={styles.levelCard}>
          <Skeleton style={styles.levelIcon} />
          <View style={styles.levelText}>
            <Skeleton style={styles.levelLine1} />
            <Skeleton style={styles.levelLine2} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: C.border, borderRadius: 10 },
  screen: { flex: 1, backgroundColor: C.bg, padding: 20, paddingTop: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 20 },
  pill: { width: 90, height: 30, borderRadius: 12 },
  heroCircle: { width: 64, height: 64, borderRadius: 32, alignSelf: 'center', marginBottom: 12 },
  titleLine: { width: 160, height: 22, borderRadius: 8, alignSelf: 'center', marginBottom: 8 },
  subLine: { width: 200, height: 14, borderRadius: 6, alignSelf: 'center', marginBottom: 24 },
  progressCard: { height: 60, borderRadius: 20, marginBottom: 24 },
  levelCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: C.white, borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
  },
  levelIcon: { width: 56, height: 56, borderRadius: 18 },
  levelText: { flex: 1, gap: 8 },
  levelLine1: { height: 16, borderRadius: 6, width: '60%' },
  levelLine2: { height: 12, borderRadius: 6, width: '85%' },
});
