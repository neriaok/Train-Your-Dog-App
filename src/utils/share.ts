import { Platform, Share } from 'react-native';

/**
 * Shares a plain text message through whatever the platform offers - the
 * native share sheet (iOS/Android via RN's Share, or a browser that
 * supports the Web Share API), falling back to the clipboard on browsers
 * that don't (most desktop browsers). Returns 'shared', 'copied', or
 * 'cancelled' so the caller can show the right confirmation.
 */
export async function shareText(message: string): Promise<'shared' | 'copied' | 'cancelled'> {
  if (Platform.OS === 'web') {
    const nav = navigator as Navigator & { share?: (data: { text: string }) => Promise<void> };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ text: message });
        return 'shared';
      } catch {
        return 'cancelled';
      }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      return 'copied';
    }
    return 'cancelled';
  }
  const result = await Share.share({ message });
  return result.action === Share.dismissedAction ? 'cancelled' : 'shared';
}
