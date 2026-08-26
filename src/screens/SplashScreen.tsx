import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DogScene from '../components/DogScene';
import PressableScale from '../components/PressableScale';
import LanguagePicker from '../components/LanguagePicker';
import { C } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';

interface Props { onStart: () => void }

export default function SplashScreen({ onStart }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).splash;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.topRow, { justifyContent: isRTL ? 'flex-start' : 'flex-end' }]}>
        <LanguagePicker />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <DogScene illustration="sit" language={language} size={280} />

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t.badge}</Text>
          </View>

          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>

          <View style={styles.tags}>
            {t.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <PressableScale style={styles.cta} onPress={onStart}>
            <Text style={styles.ctaText}>{t.cta}</Text>
          </PressableScale>

          <Text style={styles.fine}>{t.fine}</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: C.white, borderRadius: 32, padding: 28,
    width: '100%', maxWidth: 400, alignItems: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
    borderWidth: 1, borderColor: C.border,
  },
  badge: {
    backgroundColor: C.orangeL, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4, marginBottom: 14, marginTop: 4,
  },
  badgeText: { color: C.orange, fontSize: 12, fontFamily: 'Heebo_700Bold' },
  title: {
    fontSize: 28, fontFamily: 'Heebo_800ExtraBold',
    color: C.text, marginBottom: 10, textAlign: 'center',
  },
  subtitle: {
    color: C.soft, fontSize: 15, lineHeight: 24,
    marginBottom: 20, textAlign: 'center', fontFamily: 'Heebo_400Regular',
  },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { backgroundColor: C.tealL, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: C.teal, fontSize: 12, fontFamily: 'Heebo_600SemiBold' },
  cta: {
    backgroundColor: '#FF6B35', borderRadius: 20,
    paddingVertical: 17, width: '100%', alignItems: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  ctaText: { color: 'white', fontSize: 19, fontFamily: 'Heebo_800ExtraBold' },
  fine: { color: C.soft, fontSize: 12, marginTop: 14, fontFamily: 'Heebo_400Regular' },
});
