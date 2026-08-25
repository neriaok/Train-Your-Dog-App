import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { runAgent, AgentStep } from '../agent/mockAgent';
import { C } from '../data';

interface Props { onBack: () => void; }

type ChatEntry =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'step'; step: AgentStep };

const INTRO_STEP: AgentStep = {
  type: 'final',
  text: 'שלום! אני עוזר האילוף (דמו לימודי, בלי חיבור אמיתי ל-AI). שאל אותי על פקודה, על רמה, או בקש "טיפ"!',
};

export default function AgentChatScreen({ onBack }: Props) {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<ChatEntry[]>([
    { id: 'intro', kind: 'step', step: INTRO_STEP },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setEntries(prev => [...prev, { id: `u-${Date.now()}`, kind: 'user', text }]);

    const steps = runAgent(text);
    steps.forEach((step, i) => {
      setTimeout(() => {
        setEntries(prev => [...prev, { id: `a-${Date.now()}-${i}`, kind: 'step', step }]);
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
      }, (i + 1) * 550);
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{'→'} חזרה</Text>
        </PressableScale>
        <Text style={styles.title}>🤖 עוזר אילוף</Text>
      </View>
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          דימוי לימודי של סוכן AI - כל התשובות מבוססות על לוגיקה קבועה-מראש, בלי חיבור אמיתי ל-API
        </Text>
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
          {entries.map(e =>
            e.kind === 'user' ? (
              <View key={e.id} style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{e.text}</Text>
                </View>
              </View>
            ) : (
              <AgentStepBubble key={e.id} step={e.step} />
            )
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder='שאל למשל: "מה זה שב?" או "מה יש ברמה 2"'
            placeholderTextColor={C.soft}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <PressableScale onPress={send} style={styles.sendBtn}>
            <Text style={styles.sendText}>שלח</Text>
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AgentStepBubble({ step }: { step: AgentStep }) {
  if (step.type === 'thinking') {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.thinkingText}>🤔 {step.text}</Text>
      </View>
    );
  }
  if (step.type === 'tool_call') {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.toolText}>
          {'🔧 מפעיל כלי: '}
          <Text style={styles.toolCode}>{step.tool}({JSON.stringify(step.args)})</Text>
        </Text>
      </View>
    );
  }
  if (step.type === 'tool_result') {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.toolText}>📦 תוצאת הכלי התקבלה</Text>
      </View>
    );
  }
  return (
    <View style={styles.agentRow}>
      <View style={styles.agentBubble}>
        <Text style={styles.agentText}>{step.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10,
  },
  backBtn: {
    backgroundColor: 'white', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
  },
  backText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  title: { fontSize: 18, fontFamily: 'Heebo_800ExtraBold', color: C.text },
  disclaimer: {
    marginHorizontal: 20, marginBottom: 8, padding: 10,
    backgroundColor: C.purpleL, borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 11, fontFamily: 'Heebo_500Medium', color: C.purple,
    textAlign: 'center', lineHeight: 16,
  },
  scroll: { padding: 16, paddingBottom: 24, gap: 8 },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    backgroundColor: C.orange, borderRadius: 18, borderBottomEndRadius: 4,
    paddingHorizontal: 16, paddingVertical: 10, maxWidth: '80%',
  },
  userText: { color: 'white', fontSize: 14, fontFamily: 'Heebo_600SemiBold' },
  systemRow: { alignItems: 'flex-start' },
  thinkingText: {
    fontSize: 12, fontFamily: 'Heebo_500Medium', color: C.soft, fontStyle: 'italic',
  },
  toolText: { fontSize: 12, fontFamily: 'Heebo_500Medium', color: C.teal },
  toolCode: { fontFamily: 'Heebo_600SemiBold', color: C.teal },
  agentRow: { alignItems: 'flex-start' },
  agentBubble: {
    backgroundColor: 'white', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 18, borderBottomStartRadius: 4,
    paddingHorizontal: 16, paddingVertical: 10, maxWidth: '85%',
  },
  agentText: { color: C.text, fontSize: 14, fontFamily: 'Heebo_400Regular', lineHeight: 21 },
  inputRow: {
    flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg,
  },
  input: {
    flex: 1, backgroundColor: 'white', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, fontFamily: 'Heebo_400Regular', color: C.text, textAlign: 'right',
  },
  sendBtn: {
    backgroundColor: C.orange, borderRadius: 16,
    paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
  },
  sendText: { color: 'white', fontSize: 14, fontFamily: 'Heebo_700Bold' },
});
