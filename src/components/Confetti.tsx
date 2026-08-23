import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');
const COLORS = ['#FF6B35', '#2EC4B6', '#FFD166', '#9B5DE5', '#06D6A0'];

interface Props { active: boolean }

export default function Confetti({ active }: Props) {
  const pieces = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * SW,
    color: COLORS[i % 5],
    size: 6 + Math.random() * 8,
    delay: Math.random() * 800,
    anim: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    if (!active) return;
    const anims = pieces.map(p =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: 1500 + Math.random() * 1000,
        delay: p.delay,
        useNativeDriver: true,
      })
    );
    Animated.parallel(anims).start();
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map(p => (
        <Animated.View
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? p.size / 2 : 2,
            transform: [{
              translateY: p.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, SH + 40],
              }),
            }, {
              rotate: p.anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '720deg'],
              }),
            }],
            opacity: p.anim.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            }),
          }}
        />
      ))}
    </View>
  );
}
