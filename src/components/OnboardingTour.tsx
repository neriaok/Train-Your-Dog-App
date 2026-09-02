import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PressableScale from './PressableScale';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useTheme, Colors } from '../theme/ThemeContext';

const SEEN_KEY = 'dogTrainingApp:onboardingSeen';

export default function OnboardingTour() {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).onboarding;
  const { colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const slides = t.slides;

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY).then(seen => {
      if (!seen) setVisible(true);
    });
  }, []);

  const finish = () => {
    setVisible(false);
    AsyncStorage.setItem(SEEN_KEY, 'true');
  };

  const next = () => {
    if (step + 1 >= slides.length) finish();
    else setStep(s => s + 1);
  };

  if (!visible) return null;
  const slide = slides[step];
  const isLast = step + 1 >= slides.length;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <PressableScale onPress={finish} style={[styles.skipBtn, isRTL ? { left: 16 } : { right: 16 }]}>
            <Text style={styles.skipText}>{t.skip}</Text>
          </PressableScale>

          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>

          <View style={[styles.dots, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <PressableScale onPress={next} style={styles.nextBtn}>
            <Text style={styles.nextText}>{isLast ? t.start : t.next}</Text>
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
    backgroundColor: C.white, borderRadius: 28, padding: 28,
    width: '100%', maxWidth: 380, alignItems: 'center',
  },
  skipBtn: { position: 'absolute', top: 16, padding: 4 },
  skipText: { fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.soft },
  emoji: { fontSize: 56, marginBottom: 14, marginTop: 10 },
  title: {
    fontSize: 19, fontFamily: 'Heebo_800ExtraBold', color: C.text,
    marginBottom: 10, textAlign: 'center',
  },
  body: {
    fontSize: 14, fontFamily: 'Heebo_400Regular', color: C.soft,
    textAlign: 'center', lineHeight: 21, marginBottom: 20,
  },
  dots: { gap: 6, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  dotActive: { backgroundColor: C.orange, width: 20 },
  nextBtn: {
    backgroundColor: C.orange, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center',
  },
  nextText: { color: 'white', fontSize: 15, fontFamily: 'Heebo_800ExtraBold' },
});
