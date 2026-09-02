import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DogScene from '../components/DogScene';
import PressableScale from '../components/PressableScale';
import { Level, Step } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useTheme, Colors } from '../theme/ThemeContext';

interface Props {
  levels: Level[];
  completed: number[];
  onBack: () => void;
}

interface Question {
  step: Step;
  levelColor: string;
  correct: string;
  options: string[];
}

const QUESTION_COUNT = 5;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(levels: Level[], completed: number[]): Question[] {
  const pool = levels
    .filter(l => completed.includes(l.id))
    .flatMap(l => l.steps.map(step => ({ step, levelColor: l.color })));
  if (pool.length === 0) return [];

  const allCommands = Array.from(new Set(pool.map(p => p.step.commands[p.step.commands.length - 1])));
  const picked = shuffle(pool).slice(0, Math.min(QUESTION_COUNT, pool.length));

  return picked.map(({ step, levelColor }) => {
    const correct = step.commands[step.commands.length - 1];
    const distractors = shuffle(allCommands.filter(c => c !== correct)).slice(0, Math.min(2, allCommands.length - 1));
    return { step, levelColor, correct, options: shuffle([correct, ...distractors]) };
  });
}

export default function ReviewScreen({ levels, completed, onBack }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).review;
  const { colors: C, stylePack } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [questions] = useState(() => buildQuestions(levels, completed));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === question.correct) setScore(s => s + 1);
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setFinished(true);
      } else {
        setIndex(i => i + 1);
        setSelected(null);
      }
    }, 900);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <PressableScale onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
          </PressableScale>
          <Text style={styles.title}>{t.title}</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🎓</Text>
          <Text style={styles.emptyText}>{t.emptyState}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <PressableScale onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
          </PressableScale>
          <Text style={styles.title}>{t.title}</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>{score === questions.length ? '🏆' : '🐾'}</Text>
          <Text style={styles.scoreText}>{t.scoreResult(score, questions.length)}</Text>
          <PressableScale onPress={restart} style={styles.restartBtn}>
            <Text style={styles.restartText}>{t.restartBtn}</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
        </PressableScale>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.progressText}>{t.questionProgress(index + 1, questions.length)}</Text>

        <View style={styles.sceneWrap}>
          <DogScene illustration={question.step.illustration} language={language} size={220} furPack={stylePack} />
        </View>

        <Text style={styles.prompt}>{t.prompt}</Text>

        <View style={styles.options}>
          {question.options.map(opt => {
            const isCorrect = opt === question.correct;
            const isSelected = opt === selected;
            const showState = selected !== null;
            return (
              <PressableScale
                key={opt}
                onPress={() => handleAnswer(opt)}
                disabled={selected !== null}
                style={[
                  styles.option,
                  showState && isCorrect && styles.optionCorrect,
                  showState && isSelected && !isCorrect && styles.optionWrong,
                ]}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </PressableScale>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10,
  },
  backBtn: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
  },
  backText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  title: { fontSize: 18, fontFamily: 'Heebo_800ExtraBold', color: C.text },
  body: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 8 },
  progressText: { fontSize: 12, color: C.soft, fontFamily: 'Heebo_600SemiBold', marginBottom: 8 },
  sceneWrap: { marginBottom: 8 },
  prompt: {
    fontSize: 16, fontFamily: 'Heebo_800ExtraBold', color: C.text,
    marginBottom: 18, textAlign: 'center',
  },
  options: { width: '100%', maxWidth: 340, gap: 10 },
  option: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
  },
  optionCorrect: { backgroundColor: '#06D6A022', borderColor: '#06D6A0' },
  optionWrong: { backgroundColor: '#E5484D22', borderColor: '#E5484D' },
  optionText: { fontSize: 16, fontFamily: 'Heebo_700Bold', color: C.text },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyText: { fontSize: 14, color: C.soft, fontFamily: 'Heebo_400Regular', textAlign: 'center', lineHeight: 22 },
  scoreText: {
    fontSize: 20, fontFamily: 'Heebo_800ExtraBold', color: C.text,
    marginBottom: 20, textAlign: 'center',
  },
  restartBtn: { backgroundColor: C.orange, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 },
  restartText: { color: 'white', fontSize: 15, fontFamily: 'Heebo_800ExtraBold' },
});
