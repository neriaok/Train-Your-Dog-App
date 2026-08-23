import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  value: number;
  total: number;
  color: string;
}

export default function ProgressBar({ value, total, color }: Props) {
  const pct = Math.round((value / total) * 100);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>התקדמות</Text>
        <Text style={[styles.pct, { color }]}>{pct}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: color + '22' }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
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
