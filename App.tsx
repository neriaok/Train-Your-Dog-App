import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold, Heebo_800ExtraBold } from '@expo-google-fonts/heebo';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Animated, Easing } from 'react-native';

import SplashScreenComp from './src/screens/SplashScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import StepScreen from './src/screens/StepScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import AgentChatScreen from './src/screens/AgentChatScreen';
import AuthScreen from './src/screens/AuthScreen';
import UpgradeScreen from './src/screens/UpgradeScreen';
import DogProfileScreen from './src/screens/DogProfileScreen';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import { useLevels } from './src/i18n/useLevels';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { DogProfileProvider } from './src/profile/DogProfileContext';
import { loadStreak, recordPractice, StreakState } from './src/progress/streak';

SplashScreen.preventAutoHideAsync();

type Screen = 'splash' | 'levels' | 'step' | 'success' | 'agent' | 'auth' | 'upgrade' | 'profile';

const COMPLETED_LEVELS_KEY = 'dogTrainingApp:completedLevels';

function AppInner({ onLayoutRootView }: { onLayoutRootView: () => void }) {
  const { isRTL, ready: languageReady } = useLanguage();
  const { ready: authReady, isPremium } = useAuth();
  const LEVELS = useLevels();

  const [screen, setScreen] = useState<Screen>('splash');
  const [levelId, setLevelId] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const hasLoadedProgress = useRef(false);
  const screenFade = useRef(new Animated.Value(1)).current;
  const [streak, setStreak] = useState<StreakState>({ streak: 0, lastActiveDate: null, practicedToday: false });

  useEffect(() => {
    AsyncStorage.getItem(COMPLETED_LEVELS_KEY)
      .then(stored => {
        if (stored) setCompleted(JSON.parse(stored));
      })
      .finally(() => setProgressLoaded(true));
    loadStreak().then(setStreak);
  }, []);

  useEffect(() => {
    // Skip the very first write so we don't clobber storage with the
    // initial empty array before the loaded progress has been applied.
    if (!progressLoaded) return;
    if (!hasLoadedProgress.current) {
      hasLoadedProgress.current = true;
      return;
    }
    AsyncStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(completed));
  }, [completed, progressLoaded]);

  useEffect(() => {
    screenFade.setValue(0);
    Animated.timing(screenFade, {
      toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, [screen]);

  if (!progressLoaded || !languageReady || !authReady) return null;

  const level = LEVELS.find(l => l.id === levelId)!;
  const step = level?.steps[stepIdx];

  const handleStart = () => setScreen('levels');

  const handleSelect = (id: number) => {
    if (id > 1 && !isPremium) {
      setScreen('upgrade');
      return;
    }
    setLevelId(id);
    setStepIdx(0);
    setScreen('step');
  };

  const handleStepDone = () => {
    recordPractice().then(setStreak);
    if (stepIdx + 1 >= level.steps.length) {
      if (!completed.includes(levelId))
        setCompleted(p => [...p, levelId]);
      setScreen('success');
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const handleNext = () => {
    const next = LEVELS.find(l => l.id === levelId + 1);
    if (next && (next.id === 1 || isPremium)) { setLevelId(next.id); setStepIdx(0); setScreen('step'); }
    else setScreen('levels');
  };

  const handleRestart = () => { setStepIdx(0); setScreen('step'); };
  const handleBack = () => setScreen('levels');
  const handleOpenAgent = () => setScreen('agent');
  const handleOpenAuth = () => setScreen('auth');
  const handleOpenUpgrade = () => setScreen('upgrade');
  const handleOpenProfile = () => setScreen('profile');

  return (
    <View style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }} onLayout={onLayoutRootView}>
      <StatusBar style="dark" />
      <Animated.View
        style={{
          flex: 1,
          opacity: screenFade,
          transform: [{ scale: screenFade.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }],
        }}
      >
        {screen === 'splash' && <SplashScreenComp onStart={handleStart} onOpenAuth={handleOpenAuth} />}
        {screen === 'levels' && (
          <LevelSelectScreen
            levels={LEVELS} completed={completed} streak={streak}
            onSelect={handleSelect} onOpenAgent={handleOpenAgent}
            onOpenAuth={handleOpenAuth} onOpenUpgrade={handleOpenUpgrade}
            onOpenProfile={handleOpenProfile}
          />
        )}
        {screen === 'agent' && <AgentChatScreen levels={LEVELS} onBack={handleBack} />}
        {screen === 'auth' && <AuthScreen onBack={handleBack} onAuthed={handleBack} />}
        {screen === 'upgrade' && <UpgradeScreen onBack={handleBack} onSignInRequired={handleOpenAuth} />}
        {screen === 'profile' && <DogProfileScreen onBack={handleBack} />}
        {screen === 'step' && level && step && (
          <StepScreen
            key={`${levelId}-${stepIdx}`}
            level={level} step={step}
            stepIdx={stepIdx} totalSteps={level.steps.length}
            onComplete={handleStepDone} onBack={handleBack}
          />
        )}
        {screen === 'success' && level && (
          <SuccessScreen
            levels={LEVELS}
            level={level}
            isLast={levelId === LEVELS[LEVELS.length - 1].id}
            onNext={handleNext}
            onRestart={handleRestart}
          />
        )}
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
    Heebo_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <DogProfileProvider>
            <AppInner onLayoutRootView={onLayoutRootView} />
          </DogProfileProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
