import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';

interface Props {
  value: number;
  total: number;
  color: string;
}

export default function ProgressBar({ value, total, color }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).levels;
  const pct = Math.round((value / total) * 100);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 550,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{t.progressLabel}</Text>
        <Text style={[styles.pct, { color }]}>{pct}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: color + '22', direction: isRTL ? 'rtl' : 'ltr' }]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, color: '#6B7280', fontFamily: 'Heebo_500Medium' },
  pct: { fontSize: 13, fontFamily: 'Heebo_700Bold' },
  track: { borderRadius: 20, height: 10, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 20 },
});
