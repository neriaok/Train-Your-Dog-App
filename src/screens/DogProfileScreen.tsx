import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import PressableScale from '../components/PressableScale';
import { useLanguage } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useDogProfile, AgeGroup, Experience } from '../profile/DogProfileContext';
import { C } from '../data';
import { styles as authStyles } from './authStyles';

interface Props { onBack: () => void; onOpenJournal: () => void; }

function Chip<T extends string>({ value, selected, label, onPress }: { value: T; selected: boolean; label: string; onPress: (v: T) => void }) {
  return (
    <PressableScale onPress={() => onPress(value)} style={[styles.chip, selected && styles.chipActive]}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </PressableScale>
  );
}

export default function DogProfileScreen({ onBack, onOpenJournal }: Props) {
  const { language, isRTL } = useLanguage();
  const t = useStrings(language).profile;
  const { profile, saveProfile } = useDogProfile();

  const [name, setName] = useState(profile?.name ?? '');
  const [breed, setBreed] = useState(profile?.breed ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(profile?.photoUri ?? null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(profile?.ageGroup ?? null);
  const [experience, setExperience] = useState<Experience | null>(profile?.experience ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      await saveProfile({ name: trimmed, breed: breed.trim(), photoUri, ageGroup, experience });
      onBack();
    } catch {
      setBusy(false);
      setError(t.saveFailed);
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
              <Chip value="puppy" selected={ageGroup === 'puppy'} label={t.ageGroupPuppy} onPress={setAgeGroup} />
              <Chip value="adult" selected={ageGroup === 'adult'} label={t.ageGroupAdult} onPress={setAgeGroup} />
              <Chip value="senior" selected={ageGroup === 'senior'} label={t.ageGroupSenior} onPress={setAgeGroup} />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t.experienceLabel}</Text>
            <View style={[styles.chipRow, rowDir]}>
              <Chip value="beginner" selected={experience === 'beginner'} label={t.experienceBeginner} onPress={setExperience} />
              <Chip value="experienced" selected={experience === 'experienced'} label={t.experienceExperienced} onPress={setExperience} />
            </View>
          </View>

          {profile?.startDate && (
            <Text style={styles.since}>{t.since(profile.startDate)}</Text>
          )}
          {error && <Text style={authStyles.error}>{error}</Text>}

          <PressableScale onPress={handleSave} disabled={busy} style={authStyles.submitBtn}>
            <Text style={authStyles.submitText}>{busy ? '...' : t.saveBtn}</Text>
          </PressableScale>

          <PressableScale onPress={onOpenJournal} style={styles.journalBtn}>
            <Text style={styles.journalBtnText}>{t.journalBtn}</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  photoWrap: { alignItems: 'center', marginBottom: 4 },
  photo: { width: 96, height: 96, borderRadius: 48 },
  photoPlaceholder: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderEmoji: { fontSize: 40 },
  photoHint: { marginTop: 8, fontSize: 12, fontFamily: 'Heebo_600SemiBold', color: C.orange },
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
  journalBtn: {
    alignItems: 'center', paddingVertical: 12, borderRadius: 14,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
  },
  journalBtnText: { fontSize: 14, fontFamily: 'Heebo_700Bold', color: C.text },
});
