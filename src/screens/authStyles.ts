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
  // Small, plain dropdown for the dev-only saved-account shortcut - kept
  // deliberately unstyled/quiet (not a branded card) since it's a
  // development convenience, not a real product feature.
  fieldWrap: { position: 'relative', zIndex: 20 },
  suggestionDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 3,
    backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 6,
    paddingVertical: 8, paddingHorizontal: 10,
  },
  suggestionName: { fontSize: 12, fontFamily: 'Heebo_500Medium', color: C.text },
  suggestionEmail: { fontSize: 10, fontFamily: 'Heebo_400Regular', color: C.soft },
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 11, fontFamily: 'Heebo_500Medium', color: C.soft },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: 'white', borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    paddingVertical: 13,
  },
  googleIcon: { fontSize: 15, fontFamily: 'Heebo_800ExtraBold', color: '#4285F4' },
  googleBtnText: { fontSize: 14, fontFamily: 'Heebo_700Bold', color: C.text },
  switchBtn: { alignItems: 'center', paddingVertical: 6 },
  switchText: { color: C.soft, fontSize: 12, fontFamily: 'Heebo_500Medium' },
});
