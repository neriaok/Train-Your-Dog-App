import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import PressableScale from '../components/PressableScale';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useJournal, JournalEntry } from '../journal/JournalContext';
import { C } from '../data';
import { styles as authStyles } from './authStyles';

interface Props { onBack: () => void; }

export default function JournalScreen({ onBack }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).journal;
  const { entries, addEntry, removeEntry } = useJournal();

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const pickMedia = async () => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'photo');
    }
  };

  const handleSave = async () => {
    setError(null);
    setBusy(true);
    try {
      await addEntry({ mediaUri, mediaType, note: note.trim() });
      setMediaUri(null);
      setMediaType(null);
      setNote('');
    } catch {
      setError(t.saveFailed);
    }
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    await removeEntry(id);
  };

  return (
    <SafeAreaView style={authStyles.safe}>
      <View style={authStyles.header}>
        <PressableScale onPress={onBack} style={authStyles.backBtn}>
          <Text style={authStyles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
        </PressableScale>
        <Text style={authStyles.title}>{t.title}</Text>
      </View>

      <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled">
        <View style={authStyles.card}>
          <PressableScale onPress={pickMedia} style={styles.mediaPicker} scaleTo={0.98}>
            {mediaUri && mediaType === 'photo' ? (
              <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
            ) : mediaUri && mediaType === 'video' ? (
              <View style={[styles.mediaPreview, styles.mediaPlaceholder]}>
                <Text style={styles.mediaPlaceholderEmoji}>🎥</Text>
              </View>
            ) : (
              <View style={[styles.mediaPreview, styles.mediaPlaceholder]}>
                <Text style={styles.mediaPlaceholderEmoji}>📷</Text>
              </View>
            )}
            <Text style={styles.mediaHint}>{mediaUri ? t.changeMedia : t.addMedia}</Text>
          </PressableScale>

          {mediaType === 'video' && (
            <Text style={styles.videoNote}>{t.videoNote}</Text>
          )}

          <TextInput
            style={[authStyles.input, styles.noteInput, { textAlign: isRTL ? 'right' : 'left' }]}
            value={note}
            onChangeText={setNote}
            placeholder={t.notePlaceholder}
            placeholderTextColor={C.soft}
            multiline
          />

          {error && <Text style={authStyles.error}>{error}</Text>}

          <PressableScale onPress={handleSave} disabled={busy} style={authStyles.submitBtn}>
            <Text style={authStyles.submitText}>{busy ? '...' : t.saveBtn}</Text>
          </PressableScale>
        </View>

        {entries.length === 0 ? (
          <Text style={styles.empty}>{t.empty}</Text>
        ) : (
          entries.map((entry: JournalEntry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={[styles.entryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {entry.mediaUri && entry.mediaType === 'photo' ? (
                  <Image source={{ uri: entry.mediaUri }} style={styles.entryThumb} />
                ) : entry.mediaUri && entry.mediaType === 'video' ? (
                  <View style={[styles.entryThumb, styles.entryThumbPlaceholder]}>
                    <Text style={styles.entryThumbEmoji}>🎥</Text>
                  </View>
                ) : (
                  <View style={[styles.entryThumb, styles.entryThumbPlaceholder]}>
                    <Text style={styles.entryThumbEmoji}>📔</Text>
                  </View>
                )}
                <View style={styles.entryBody}>
                  <Text style={[styles.entryDate, { textAlign: isRTL ? 'right' : 'left' }]}>{entry.date}</Text>
                  {!!entry.note && (
                    <Text style={[styles.entryNote, { textAlign: isRTL ? 'right' : 'left' }]}>{entry.note}</Text>
                  )}
                </View>
              </View>

              {confirmDeleteId === entry.id ? (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmText}>{t.deleteConfirm}</Text>
                  <View style={styles.confirmBtns}>
                    <PressableScale onPress={() => handleDelete(entry.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>{t.delete}</Text>
                    </PressableScale>
                    <PressableScale onPress={() => setConfirmDeleteId(null)} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>{t.cancel}</Text>
                    </PressableScale>
                  </View>
                </View>
              ) : (
                <PressableScale
                  onPress={() => setConfirmDeleteId(entry.id)}
                  style={[styles.entryDeleteX, isRTL ? { left: 10 } : { right: 10 }]}
                >
                  <Text style={styles.entryDeleteXText}>×</Text>
                </PressableScale>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mediaPicker: { alignItems: 'center', marginBottom: 4 },
  mediaPreview: { width: 96, height: 96, borderRadius: 16 },
  mediaPlaceholder: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  mediaPlaceholderEmoji: { fontSize: 36 },
  mediaHint: { marginTop: 8, fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.orange },
  videoNote: {
    fontSize: 11, fontFamily: 'Heebo_400Regular', color: C.soft,
    textAlign: 'center', lineHeight: 16,
  },
  noteInput: { minHeight: 60, textAlignVertical: 'top', paddingTop: 12 },
  empty: {
    fontSize: 13, fontFamily: 'Heebo_400Regular', color: C.soft,
    textAlign: 'center', marginTop: 24,
  },
  entryCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 14, marginTop: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  entryRow: { alignItems: 'center', gap: 12 },
  entryThumb: { width: 56, height: 56, borderRadius: 14 },
  entryThumbPlaceholder: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  entryThumbEmoji: { fontSize: 22 },
  entryBody: { flex: 1 },
  entryDate: { fontSize: 11, fontFamily: 'Heebo_600SemiBold', color: C.soft, marginBottom: 3 },
  entryNote: { fontSize: 13, fontFamily: 'Heebo_400Regular', color: C.text, lineHeight: 19 },
  entryDeleteX: {
    position: 'absolute', top: 8,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
  },
  entryDeleteXText: { fontSize: 16, color: C.soft, lineHeight: 17 },
  confirmRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
  confirmText: { fontSize: 12, fontFamily: 'Heebo_500Medium', color: C.text, marginBottom: 8, textAlign: 'center' },
  confirmBtns: { flexDirection: 'row', gap: 8 },
  deleteBtn: { flex: 1, backgroundColor: '#E5484D', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  deleteBtnText: { color: 'white', fontSize: 12, fontFamily: 'Heebo_700Bold' },
  cancelBtn: {
    flex: 1, backgroundColor: C.bg, borderRadius: 10, paddingVertical: 8,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  cancelBtnText: { color: C.text, fontSize: 12, fontFamily: 'Heebo_700Bold' },
});
