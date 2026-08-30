import { supabase } from './supabaseClient';

/**
 * Uploads a locally-picked photo/video (a data:/blob:/file: URI from
 * expo-image-picker) to the shared "media" Storage bucket, under the
 * signed-in user's own folder (see backend/supabase/sync_schema.sql for the
 * bucket + policies), and returns its public URL for storing in the DB.
 */
export async function uploadMedia(uri: string, userId: string, folder: string): Promise<string> {
  if (!supabase) throw new Error('Backend not configured');
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = (blob.type.split('/')[1] || 'jpg').split('+')[0];
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, blob, {
    contentType: blob.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
