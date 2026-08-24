import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';

interface Props {
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleTo?: number;
  children: React.ReactNode;
}

export default function PressableScale({ onPress, style, disabled, scaleTo = 0.96, children }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  };
  const pressOut = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  };

  return (
    <Pressable style={style} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} disabled={disabled}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
