import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Animated,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { runAgent } from '../agent/runAgent';
import { AgentMessage } from '../agent/types';
import { Level } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useTheme, Colors } from '../theme/ThemeContext';

interface Props { levels: Level[]; onBack: () => void; }

type ChatEntry =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'agent'; text: string }
  | { id: string; kind: 'typing' };

// User-facing chat only ever shows their own messages and the assistant's
// final replies - runAgent's intermediate "thinking"/"tool_call"/"tool_result"
// steps are internal implementation detail, not something to surface here.
export default function AgentChatScreen({ levels, onBack }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).agent;
  const { colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<ChatEntry[]>([
    { id: 'intro', kind: 'agent', text: t.intro },
  ]);
  const historyRef = useRef<AgentMessage[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;
    setInput('');
    const typingId = `typing-${Date.now()}`;
    setEntries(prev => [...prev, { id: `u-${Date.now()}`, kind: 'user', text }, { id: typingId, kind: 'typing' }]);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    const steps = await runAgent(text, levels, language, historyRef.current);
    const finalStep = steps.find(s => s.type === 'final');

    setTimeout(() => {
      setEntries(prev => [
        ...prev.filter(e => e.id !== typingId),
        { id: `a-${Date.now()}`, kind: 'agent', text: finalStep?.text ?? '' },
      ]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, 700);

    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: text },
      { role: 'assistant', content: finalStep?.text ?? '' },
    ];
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
        </PressableScale>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {entries.map(e => {
            if (e.kind === 'user') {
              return (
                <View key={e.id} style={styles.userRow}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{e.text}</Text>
                  </View>
                </View>
              );
            }
            if (e.kind === 'typing') {
              return <TypingBubble key={e.id} />;
            }
            return (
              <View key={e.id} style={styles.agentRow}>
                <View style={styles.agentBubble}>
                  <Text style={styles.agentText}>{e.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {entries.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsRow}
            contentContainerStyle={[styles.suggestionsContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {t.suggestions.map(s => (
              <PressableScale key={s} onPress={() => send(s)} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{s}</Text>
              </PressableScale>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={input}
            onChangeText={setInput}
            placeholder={t.placeholder}
            placeholderTextColor={C.soft}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          <PressableScale onPress={() => send()} style={styles.sendBtn}>
            <Text style={styles.sendText}>{t.send}</Text>
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TypingBubble() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.delay((2 - i) * 150),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.agentRow}>
      <View style={[styles.agentBubble, styles.typingBubble]}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }]}
          />
        ))}
      </View>
    </View>
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
  scroll: { padding: 16, paddingBottom: 24, gap: 8 },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    backgroundColor: C.orange, borderRadius: 18, borderBottomEndRadius: 4,
    paddingHorizontal: 16, paddingVertical: 10, maxWidth: '80%',
  },
  userText: { color: 'white', fontSize: 14, fontFamily: 'Heebo_600SemiBold' },
  agentRow: { alignItems: 'flex-start' },
  agentBubble: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 18, borderBottomStartRadius: 4,
    paddingHorizontal: 16, paddingVertical: 10, maxWidth: '85%',
  },
  agentText: { color: C.text, fontSize: 14, fontFamily: 'Heebo_400Regular', lineHeight: 21 },
  typingBubble: { flexDirection: 'row', gap: 4, paddingVertical: 14 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.soft },
  suggestionsRow: { flexGrow: 0 },
  suggestionsContent: { gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  suggestionChip: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.orange + '50',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8,
  },
  suggestionText: { fontSize: 12.5, fontFamily: 'Heebo_600SemiBold', color: C.orange },
  inputRow: {
    flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg,
  },
  input: {
    flex: 1, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, fontFamily: 'Heebo_400Regular', color: C.text,
  },
  sendBtn: {
    backgroundColor: C.orange, borderRadius: 16,
    paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
  },
  sendText: { color: 'white', fontSize: 14, fontFamily: 'Heebo_700Bold' },
});
