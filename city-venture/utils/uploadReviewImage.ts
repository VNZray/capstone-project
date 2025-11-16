import { supabase } from '@/utils/supabase';

export interface UploadReviewImageOptions {
  uri: string;
  businessName: string;
  mimeType?: string;
}

export async function uploadReviewImage({
  uri,
  businessName,
  mimeType = 'image/jpeg',
}: UploadReviewImageOptions): Promise<string> {
  try {
    // Fetch the image data
    const response = await fetch(uri);
    let fileBody: any;

    try {
      const buffer = await response.arrayBuffer();
      fileBody = new Uint8Array(buffer);
    } catch {
      if ((response as any).blob) {
        fileBody = await (response as any).blob();
      } else {
        throw new Error('Unable to read file data for upload');
      }
    }

    // Determine file extension
    let ext = 'jpg';
    if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/gif') ext = 'gif';
    else if (mimeType === 'image/webp') ext = 'webp';

    // Create safe business name for folder
    const safeName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();
    const fileName = `review-${date}-${timestamp}.${ext}`;

    // Build path: [business-name]-reviews/review-[date]
    const path = `${safeName}-reviews/${fileName}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('business-profile')
      .upload(path, fileBody, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('business-profile')
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return publicData.publicUrl;
  } catch (error) {
    console.error('Error uploading review image:', error);
    throw error;
  }
}

export async function deleteReviewImage(imageUrl: string): Promise<void> {
  try {
    // Extract path from public URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/reviews/');
    if (pathParts.length < 2) {
      throw new Error('Invalid image URL');
    }
    const path = pathParts[1];

    const { error } = await supabase.storage.from('business-profile').remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting review image:', error);
    throw error;
  }
}
