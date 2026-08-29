import { StyleSheet } from 'react-native';
import { C } from '../data';

// Shared by AuthScreen.tsx (native) and AuthScreen.web.tsx (web) - kept in
// its own module so neither of the two platform-specific files needs to
// import the other. Importing "./AuthScreen" from AuthScreen.web.tsx would
// resolve back to itself under Metro's web platform resolution (a require
// cycle that leaves `styles` undefined at import time).
export const styles = StyleSheet.create({
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
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.purpleL, borderRadius: 14, borderWidth: 1.5, borderColor: C.purple + '40',
    padding: 12,
  },
  suggestionIcon: {
    fontSize: 20, backgroundColor: C.purpleL, borderRadius: 10,
    width: 34, height: 34, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden',
  },
  suggestionName: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.text },
  suggestionEmail: { fontSize: 11, fontFamily: 'Heebo_400Regular', color: C.soft },
  card: {
    backgroundColor: C.white, borderRadius: 28, padding: 24,
    borderWidth: 1, borderColor: C.border, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  tabs: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 14, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: C.orange },
  tabText: { fontSize: 13, fontFamily: 'Heebo_700Bold', color: C.soft },
  tabTextActive: { color: 'white' },
  input: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, fontFamily: 'Heebo_400Regular', color: C.text,
  },
  error: { color: '#E5484D', fontSize: 12, fontFamily: 'Heebo_500Medium', textAlign: 'center' },
  notice: { color: C.teal, fontSize: 12, fontFamily: 'Heebo_500Medium', textAlign: 'center' },
  submitBtn: {
    backgroundColor: C.orange, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4,
  },
  submitText: { color: 'white', fontSize: 15, fontFamily: 'Heebo_800ExtraBold' },
  switchBtn: { alignItems: 'center', paddingVertical: 6 },
  switchText: { color: C.soft, fontSize: 12, fontFamily: 'Heebo_500Medium' },
});
