import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';

// A single animated element (not Pressable wrapping a separately-styled
// inner View) so `style` is applied exactly once, on the actual direct
// parent of `children` - a caller-supplied flexDirection etc. reaches them
// correctly, and position/size styles (absolute badges, etc.) behave
// exactly as they would on a plain Pressable.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    <AnimatedPressable
      style={[style, { transform: [{ scale }] }]}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
    >
      {children}
    </AnimatedPressable>
  );
}
