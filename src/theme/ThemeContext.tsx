import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../data';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type Colors = typeof C;
/** The app's overall "vibe" - separate from light/dark, which only affects
 * neutrals. A style pack swaps the accent hues instead (e.g. the primary
 * orange becoming a cool blue for "wolf"), so it composes with either theme. */
export type StylePack = 'classic' | 'wolf';

const THEME_KEY = 'dogTrainingApp:themeMode';
const STYLE_PACK_KEY = 'dogTrainingApp:stylePack';

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

// Only the "wolf" pack's primary accent differs from classic - a deep,
// cool blue standing in for the app's usual orange everywhere (buttons,
// streak badges, highlights...), tuned separately per theme since a blue
// bright enough to read as text on a near-black background is too pale for
// white button text on top of it, and vice versa (the same tension purple
// above ran into, split into a fill color and a read-only text color).
const WOLF_ACCENT = {
  light: { orange: '#2A5580', orangeL: '#E7EFF6', orangeM: '#A8C4DC', orangeText: '#2A5580' },
  dark: { orange: '#3D7AB0', orangeL: '#16283A', orangeM: '#2C4E6E', orangeText: '#7AB4E0' },
};

function getColors(theme: ResolvedTheme, pack: StylePack): Colors {
  const base = theme === 'dark' ? darkColors : C;
  return pack === 'wolf' ? { ...base, ...WOLF_ACCENT[theme] } : base;
}

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  theme: ResolvedTheme;
  colors: Colors;
  stylePack: StylePack;
  setStylePack: (p: StylePack) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  setMode: () => {},
  theme: 'light',
  colors: C,
  stylePack: 'classic',
  setStylePack: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [stylePack, setStylePackState] = useState<StylePack>('classic');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') setModeState(stored);
    });
    AsyncStorage.getItem(STYLE_PACK_KEY).then(stored => {
      if (stored === 'classic' || stored === 'wolf') setStylePackState(stored);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };

  const setStylePack = (p: StylePack) => {
    setStylePackState(p);
    AsyncStorage.setItem(STYLE_PACK_KEY, p);
  };

  const theme: ResolvedTheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const colors = useMemo(() => getColors(theme, stylePack), [theme, stylePack]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme, colors, stylePack, setStylePack }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
