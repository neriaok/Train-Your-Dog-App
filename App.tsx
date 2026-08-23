import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold, Heebo_800ExtraBold } from '@expo-google-fonts/heebo';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

import { LEVELS } from './src/data';
import SplashScreenComp from './src/screens/SplashScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import StepScreen from './src/screens/StepScreen';
import SuccessScreen from './src/screens/SuccessScreen';

SplashScreen.preventAutoHideAsync();

type Screen = 'splash' | 'levels' | 'step' | 'success';

const COMPLETED_LEVELS_KEY = 'dogTrainingApp:completedLevels';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [levelId, setLevelId] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const hasLoadedProgress = useRef(false);

  const [fontsLoaded] = useFonts({
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
    Heebo_800ExtraBold,
  });

  useEffect(() => {
    AsyncStorage.getItem(COMPLETED_LEVELS_KEY)
      .then(stored => {
        if (stored) setCompleted(JSON.parse(stored));
      })
      .finally(() => setProgressLoaded(true));
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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded || !progressLoaded) return null;

  const level = LEVELS.find(l => l.id === levelId)!;
  const step = level?.steps[stepIdx];

  const handleStart = () => setScreen('levels');

  const handleSelect = (id: number) => {
    setLevelId(id);
    setStepIdx(0);
    setScreen('step');
  };

  const handleStepDone = () => {
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
    if (next) { setLevelId(next.id); setStepIdx(0); setScreen('step'); }
    else setScreen('levels');
  };

  const handleRestart = () => { setStepIdx(0); setScreen('step'); };
  const handleBack = () => setScreen('levels');

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        {screen === 'splash' && <SplashScreenComp onStart={handleStart} />}
        {screen === 'levels' && <LevelSelectScreen completed={completed} onSelect={handleSelect} />}
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
            level={level}
            isLast={levelId === LEVELS[LEVELS.length - 1].id}
            onNext={handleNext}
            onRestart={handleRestart}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}
