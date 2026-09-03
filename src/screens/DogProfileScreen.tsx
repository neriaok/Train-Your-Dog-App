import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import PressableScale from '../components/PressableScale';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useDogProfile, AgeGroup, Experience, DogProfile } from '../profile/DogProfileContext';
import { useTheme, Colors, StylePack } from '../theme/ThemeContext';
import { makeStyles as makeAuthStyles } from './authStyles';
import { loadReminderTime, setReminderTime, ReminderTime } from '../notifications/reminders';

interface Props { onBack: () => void; onOpenJournal: () => void; }

function Chip<T extends string>({ value, selected, label, onPress, styles }: { value: T; selected: boolean; label: string; onPress: (v: T) => void; styles: ReturnType<typeof makeStyles> }) {
  return (
    <PressableScale onPress={() => onPress(value)} style={[styles.chip, selected && styles.chipActive]}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </PressableScale>
  );
}

export default function DogProfileScreen({ onBack, onOpenJournal }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).profile;
  const { profiles, activeProfile, setActiveId, saveProfile, removeProfile } = useDogProfile();
  const { colors: C, stylePack, setStylePack } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const authStyles = useMemo(() => makeAuthStyles(C), [C]);

  const [editingId, setEditingId] = useState<string | null>(activeProfile?.id ?? null);
  const [name, setName] = useState(activeProfile?.name ?? '');
  const [breed, setBreed] = useState(activeProfile?.breed ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(activeProfile?.photoUri ?? null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(activeProfile?.ageGroup ?? null);
  const [experience, setExperience] = useState<Experience | null>(activeProfile?.experience ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reminderTime, setReminderTimeState] = useState<ReminderTime>('off');
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  useEffect(() => {
    loadReminderTime().then(setReminderTimeState);
  }, []);

  const loadIntoForm = (p: DogProfile | null) => {
    setEditingId(p?.id ?? null);
    setName(p?.name ?? '');
    setBreed(p?.breed ?? '');
    setPhotoUri(p?.photoUri ?? null);
    setAgeGroup(p?.ageGroup ?? null);
    setExperience(p?.experience ?? null);
    setError(null);
    setConfirmDelete(false);
  };

  const selectDog = (p: DogProfile) => {
    setActiveId(p.id);
    loadIntoForm(p);
  };

  const handleReminderChange = async (next: ReminderTime) => {
    setReminderNotice(null);
    const ok = await setReminderTime(next, language);
    if (ok) {
      setReminderTimeState(next);
    } else {
      setReminderNotice(t.reminderPermissionDenied);
    }
  };

  const pickPhoto = async () => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.nameRequired);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await saveProfile({ name: trimmed, breed: breed.trim(), photoUri, ageGroup, experience }, editingId ?? undefined);
      onBack();
    } catch (e) {
      // Logged so a real cause (e.g. a Supabase schema/RLS error, which has
      // nothing to do with photo size) is visible in devtools even though
      // the user-facing message below covers the common case.
      console.error('Dog profile save failed:', e);
      setBusy(false);
      setError(t.saveFailed);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setBusy(true);
    try {
      await removeProfile(editingId);
      onBack();
    } catch {
      setBusy(false);
    }
  };

  const rowDir = { flexDirection: isRTL ? 'row-reverse' as const : 'row' as const };

  return (
    <SafeAreaView style={authStyles.safe}>
      <View style={authStyles.header}>
        <PressableScale onPress={onBack} style={authStyles.backBtn}>
          <Text style={authStyles.backText}>{isRTL ? '→' : '←'} {t.back}</Text>
        </PressableScale>
        <Text style={authStyles.title}>{t.title}</Text>
      </View>

      {profiles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.switcherRow}
          contentContainerStyle={[styles.switcherContent, rowDir]}
        >
          {profiles.map(p => (
            <PressableScale
              key={p.id}
              onPress={() => selectDog(p)}
              style={[styles.switcherChip, editingId === p.id && styles.switcherChipActive]}
            >
              {p.photoUri ? (
                <Image source={{ uri: p.photoUri }} style={styles.switcherAvatar} />
              ) : (
                <Text style={styles.switcherAvatarEmoji}>🐕</Text>
              )}
              <Text style={[styles.switcherName, editingId === p.id && styles.switcherNameActive]} numberOfLines={1}>
                {p.name}
              </Text>
            </PressableScale>
          ))}
          <PressableScale onPress={() => loadIntoForm(null)} style={[styles.switcherChip, editingId === null && styles.switcherChipActive]}>
            <Text style={[styles.switcherName, editingId === null && styles.switcherNameActive]}>{t.switcherAddNew}</Text>
          </PressableScale>
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled">
        <View style={authStyles.card}>
          <PressableScale onPress={pickPhoto} style={styles.photoWrap} scaleTo={0.96}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Text style={styles.photoPlaceholderEmoji}>🐕</Text>
              </View>
            )}
            <Text style={styles.photoHint}>{photoUri ? t.changePhoto : t.photoHint}</Text>
          </PressableScale>

          <View>
            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t.vibeLabel}</Text>
            <View style={[styles.chipRow, rowDir]}>
              <Chip value="classic" selected={stylePack === 'classic'} label={t.vibeClassic} onPress={setStylePack} styles={styles} />
              <Chip value="wolf" selected={stylePack === 'wolf'} label={t.vibeWolf} onPress={setStylePack} styles={styles} />
            </View>
            <Text style={styles.vibeHint}>{t.vibeHint}</Text>
          </View>

          <TextInput
            style={[authStyles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={name}
            onChangeText={setName}
            placeholder={t.namePlaceholder}
            placeholderTextColor={C.soft}
          />
          <TextInput
            style={[authStyles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={breed}
            onChangeText={setBreed}
            placeholder={t.breedPlaceholder}
            placeholderTextColor={C.soft}
          />

          <View>
            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t.ageGroupLabel}</Text>
            <View style={[styles.chipRow, rowDir]}>
              <Chip value="puppy" selected={ageGroup === 'puppy'} label={t.ageGroupPuppy} onPress={setAgeGroup} styles={styles} />
              <Chip value="adult" selected={ageGroup === 'adult'} label={t.ageGroupAdult} onPress={setAgeGroup} styles={styles} />
              <Chip value="senior" selected={ageGroup === 'senior'} label={t.ageGroupSenior} onPress={setAgeGroup} styles={styles} />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t.experienceLabel}</Text>
            <View style={[styles.chipRow, rowDir]}>
              <Chip value="beginner" selected={experience === 'beginner'} label={t.experienceBeginner} onPress={setExperience} styles={styles} />
              <Chip value="experienced" selected={experience === 'experienced'} label={t.experienceExperienced} onPress={setExperience} styles={styles} />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t.reminderLabel}</Text>
            <View style={[styles.chipRow, rowDir]}>
              <Chip value="off" selected={reminderTime === 'off'} label={t.reminderOff} onPress={handleReminderChange} styles={styles} />
              <Chip value="morning" selected={reminderTime === 'morning'} label={t.reminderMorning} onPress={handleReminderChange} styles={styles} />
              <Chip value="evening" selected={reminderTime === 'evening'} label={t.reminderEvening} onPress={handleReminderChange} styles={styles} />
            </View>
            {reminderNotice && <Text style={styles.reminderNotice}>{reminderNotice}</Text>}
          </View>

          {editingId && activeProfile?.startDate && (
            <Text style={styles.since}>{t.since(activeProfile.startDate)}</Text>
          )}
          {error && <Text style={authStyles.error}>{error}</Text>}

          <PressableScale onPress={handleSave} disabled={busy} style={authStyles.submitBtn}>
            <Text style={authStyles.submitText}>{busy ? '...' : t.saveBtn}</Text>
          </PressableScale>

          <PressableScale onPress={onOpenJournal} style={styles.journalBtn}>
            <Text style={styles.journalBtnText}>{t.journalBtn}</Text>
          </PressableScale>

          {editingId && (
            confirmDelete ? (
              <View style={styles.deleteConfirmRow}>
                <Text style={styles.deleteConfirmText}>{t.deleteConfirm}</Text>
                <View style={[styles.deleteConfirmBtns, rowDir]}>
                  <PressableScale onPress={handleDelete} disabled={busy} style={styles.deleteYesBtn}>
                    <Text style={styles.deleteYesText}>{t.deleteConfirmYes}</Text>
                  </PressableScale>
                  <PressableScale onPress={() => setConfirmDelete(false)} style={styles.deleteNoBtn}>
                    <Text style={styles.deleteNoText}>{t.deleteConfirmNo}</Text>
                  </PressableScale>
                </View>
              </View>
            ) : (
              <PressableScale onPress={() => setConfirmDelete(true)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>{t.deleteBtn}</Text>
              </PressableScale>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  switcherRow: { flexGrow: 0, marginBottom: 4 },
  switcherContent: { gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  switcherChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 140,
  },
  switcherChipActive: { borderColor: C.orange, backgroundColor: C.orangeL },
  switcherAvatar: { width: 22, height: 22, borderRadius: 11 },
  switcherAvatarEmoji: { fontSize: 16 },
  switcherName: { fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.text },
  switcherNameActive: { color: C.orangeText },
  photoWrap: { alignItems: 'center', marginBottom: 4 },
  photo: { width: 96, height: 96, borderRadius: 48 },
  photoPlaceholder: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderEmoji: { fontSize: 40 },
  photoHint: { marginTop: 8, fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.orangeText },
  since: { fontSize: 12, fontFamily: 'Heebo_400Regular', color: C.soft, textAlign: 'center' },
  fieldLabel: { fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.soft, marginBottom: 6 },
  chipRow: { flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.white,
  },
  chipActive: { backgroundColor: C.orange, borderColor: C.orange },
  chipText: { fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.text },
  chipTextActive: { color: 'white' },
  reminderNotice: { fontSize: 11, fontFamily: 'Heebo_400Regular', color: C.soft, marginTop: 6 },
  vibeHint: { fontSize: 11, fontFamily: 'Heebo_400Regular', color: C.soft, marginTop: 6, lineHeight: 16 },
  journalBtn: {
    alignItems: 'center', paddingVertical: 12, borderRadius: 14,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
  },
  journalBtnText: { fontSize: 14, fontFamily: 'Heebo_700Bold', color: C.text },
  deleteBtn: { alignItems: 'center', paddingVertical: 10 },
  deleteBtnText: { fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: '#E5484D' },
  deleteConfirmRow: {
    marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border,
  },
  deleteConfirmText: { fontSize: 12, fontFamily: 'Heebo_500Medium', color: C.text, marginBottom: 8, textAlign: 'center' },
  deleteConfirmBtns: { gap: 8 },
  deleteYesBtn: { flex: 1, backgroundColor: '#E5484D', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  deleteYesText: { color: 'white', fontSize: 12, fontFamily: 'Heebo_700Bold' },
  deleteNoBtn: {
    flex: 1, backgroundColor: C.bg, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  deleteNoText: { color: C.text, fontSize: 12, fontFamily: 'Heebo_700Bold' },
});
