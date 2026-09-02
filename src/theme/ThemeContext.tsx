import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../data';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type Colors = typeof C;

const THEME_KEY = 'dogTrainingApp:themeMode';

// Accent hues (orange/teal/purple/green/gold) stay the same in both themes -
// they're vivid enough to read on a dark background too, and keeping them
// fixed is what makes "this is level 3, it's purple" still true regardless
// of theme. Only the neutrals (bg/white/text/soft/border) and each accent's
// pale "light" tint (meant as a soft background wash, not a vivid color)
// actually need dark equivalents.
export const darkColors: Colors = {
  ...C,
  orangeL: '#3A2418', orangeM: '#5C3524',
  tealL: '#0F2E2C', tealM: '#1A4F49',
  yellowL: '#3D3115',
  purpleL: '#2A1F3D', purpleText: '#C29CF2',
  greenL: '#0F3D30',
  bg: '#14141F', white: '#1E1E2E',
  text: '#F0EDE6', soft: '#9CA3AF', border: '#2E2E42',
};

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  theme: ResolvedTheme;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  setMode: () => {},
  theme: 'light',
  colors: C,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') setModeState(stored);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };

  const theme: ResolvedTheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const colors = useMemo(() => (theme === 'dark' ? darkColors : C), [theme]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
