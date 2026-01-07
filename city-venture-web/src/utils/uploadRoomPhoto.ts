import { supabase } from '@/src/lib/supabase';

export interface UploadRoomPhotoOptions {
    file: File;
    businessName: string;
    roomNumber: string;
    isProfile?: boolean;
}

export interface UploadRoomPhotoResult {
    fileUrl: string;
    fileFormat: string;
    fileSize: number;
}

/**
 * Uploads a room photo to Supabase storage
 * Bucket: business-profile
 * Path: {Accommodation-name}/room/{room-number}/photos/{timestamp}-{filename}
 * Profile Path: {Accommodation-name}/room/{room-number}/profile/{timestamp}-profile.jpg
 */
export async function uploadRoomPhoto({
    file,
    businessName,
    roomNumber,
    isProfile = false,
}: UploadRoomPhotoOptions): Promise<UploadRoomPhotoResult> {
    try {
        // Create safe business name for folder
        const safeName = businessName
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // Determine file extension
        const ext = file.type.split('/')[1] || 'jpg';

        // Get file format (jpg, png, etc.)
        const fileFormat = ext;

        // Get file size in bytes
        const fileSize = file.size;

        // Generate filename with timestamp
        const timestamp = Date.now();
        const fileName = isProfile
            ? `${timestamp}-profile.${ext}`
            : `${timestamp}-${file.name}`;

        // Build path: Accommodation-name/room/room-number/photos or profile
        const folderType = isProfile ? 'profile' : 'photos';
        const path = `${safeName}/room/${roomNumber}/${folderType}/${fileName}`;

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from('business-profile')
            .upload(path, file, {
                contentType: file.type,
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

        return {
            fileUrl: publicData.publicUrl,
            fileFormat,
            fileSize,
        };
    } catch (error) {
        console.error('Error uploading room photo:', error);
        throw error;
    }
}

/**
 * Deletes a room photo from Supabase storage
 */
export async function deleteRoomPhoto(fileUrl: string): Promise<void> {
    try {
        // Extract path from public URL
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split('/business-profile/');
        if (pathParts.length < 2) {
            throw new Error('Invalid image URL');
        }
        const path = pathParts[1];

        const { error } = await supabase.storage
            .from('business-profile')
            .remove([path]);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error deleting room photo:', error);
        throw error;
    }
}
