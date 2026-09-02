import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PressableScale from './PressableScale';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useTheme, Colors, StylePack } from '../theme/ThemeContext';

const SEEN_KEY = 'dogTrainingApp:vibePromptSeen';

// The classic/wolf swatch colors shown in the picker are hardcoded here
// (not read from the live theme) so both options preview correctly
// regardless of which pack happens to be active right now.
const SWATCHES: Record<StylePack, string> = { classic: '#FF6B35', wolf: '#2A5580' };

export default function VibePrompt() {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).vibePrompt;
  const { colors: C, setStylePack } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY).then(seen => {
      if (!seen) setVisible(true);
    });
  }, []);

  const dismiss = () => {
    setVisible(false);
    AsyncStorage.setItem(SEEN_KEY, 'true');
  };

  const choose = (pack: StylePack) => {
    setStylePack(pack);
    dismiss();
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.body}>{t.body}</Text>

          <View style={[styles.options, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <PressableScale onPress={() => choose('classic')} style={styles.option} scaleTo={0.96}>
              <View style={[styles.swatch, { backgroundColor: SWATCHES.classic }]}>
                <Text style={styles.swatchEmoji}>🐕</Text>
              </View>
              <Text style={styles.optionLabel}>{t.classicLabel}</Text>
            </PressableScale>
            <PressableScale onPress={() => choose('wolf')} style={styles.option} scaleTo={0.96}>
              <View style={[styles.swatch, { backgroundColor: SWATCHES.wolf }]}>
                <Text style={styles.swatchEmoji}>🐺</Text>
              </View>
              <Text style={styles.optionLabel}>{t.wolfLabel}</Text>
            </PressableScale>
          </View>

          <PressableScale onPress={dismiss} style={styles.laterBtn}>
            <Text style={styles.laterText}>{t.decideLater}</Text>
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(20,20,31,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  sheet: {
    backgroundColor: C.white, borderRadius: 28, padding: 26,
    width: '100%', maxWidth: 380, alignItems: 'center',
  },
  title: {
    fontSize: 19, fontFamily: 'Heebo_800ExtraBold', color: C.text,
    marginBottom: 8, textAlign: 'center',
  },
  body: {
    fontSize: 13, fontFamily: 'Heebo_400Regular', color: C.soft,
    textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  options: { gap: 14, marginBottom: 16 },
  option: { alignItems: 'center', flex: 1 },
  swatch: {
    width: 84, height: 84, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  swatchEmoji: { fontSize: 36 },
  optionLabel: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  laterBtn: { paddingVertical: 6 },
  laterText: { fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.soft },
});
