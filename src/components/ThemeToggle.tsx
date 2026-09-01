import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import PressableScale from './PressableScale';
import { useTheme, Colors } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { theme, setMode, colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  return (
    <PressableScale
      onPress={() => setMode(theme === 'dark' ? 'light' : 'dark')}
      style={styles.button}
      accessibilityLabel={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Text style={styles.icon}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
    </PressableScale>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  button: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 14 },
});
