import React, { useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import PressableScale from './PressableScale';
import { useLanguage, AVAILABLE_LANGUAGES } from '../i18n/LanguageContext';
import { useStrings } from '../i18n/strings';
import { useTheme, Colors } from '../theme/ThemeContext';

export default function LanguagePicker() {
  const { language, setLanguage, isRTL } = useLanguage();
  const strings = useStrings(language);
  const { colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [open, setOpen] = useState(false);
  const current = AVAILABLE_LANGUAGES.find(l => l.code === language) ?? AVAILABLE_LANGUAGES[0];

  return (
    <>
      <PressableScale onPress={() => setOpen(true)} style={styles.button}>
        <Text style={styles.buttonText}>{current.flag} {current.label}</Text>
      </PressableScale>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { direction: isRTL ? 'rtl' : 'ltr' }]}>
            <Text style={styles.sheetTitle}>{strings.languagePicker.title}</Text>
            {AVAILABLE_LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                style={[styles.row, l.code === language && styles.rowActive]}
                onPress={() => { setLanguage(l.code); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={styles.rowText}>{l.flag}  {l.label}</Text>
                {l.code === language && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  button: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6,
  },
  buttonText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  overlay: {
    flex: 1, backgroundColor: 'rgba(26,26,46,0.4)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  sheet: {
    backgroundColor: C.white, borderRadius: 22, padding: 10,
    width: '100%', maxWidth: 320,
  },
  sheetTitle: {
    fontSize: 15, fontFamily: 'Heebo_800ExtraBold', color: C.text,
    textAlign: 'center', paddingVertical: 12,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14,
  },
  rowActive: { backgroundColor: C.orangeL },
  rowText: { fontSize: 15, fontFamily: 'Heebo_600SemiBold', color: C.text },
  check: { fontSize: 16, fontFamily: 'Heebo_800ExtraBold', color: C.orangeText },
});
