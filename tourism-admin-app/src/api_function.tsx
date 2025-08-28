import axios from "axios";
import api from "@/src/services/api";
import { supabase } from "@/src/utils/supabase";

export const insertData = async (data: Record<string, unknown>, table: string) => {
  try {
    const response = await axios.post(`${api}/${table}`, data);
    return response.data;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
};

export const updateData = async (id: string, data: Record<string, unknown>, table: string) => {
  try {
    const response = await axios.put(`${api}/${table}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
};

export const deleteData = async (id: string, table: string) => {
  try {
    const response = await axios.delete(`${api}/${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

export const getData = async (table: string) => {
  try {
    const response = await axios.get(`${api}/${table}`);
    return response.data;
  } catch (error) {
    console.error("Get all failed:", error);
    throw error;
  }
};

export const getDataByIdAndStatus = async (
  table: string,
  id: string,
  status: string
) => {
  try {
    const response = await axios.get(`${api}/${table}/${id}?status=${status}`);
    return response.data;
  } catch (error) {
    console.error("Get all failed:", error);
    throw error;
  }
};

export const getDataById = async (table: string, id: string) => {
  try {
    const response = await axios.get(`${api}/${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get by ID failed:", error);
    throw error;
  }
};

// Supabase image upload template
export const imageUpload = async (table: string, id: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(table)
    .upload(`${id}/${file.name}`, file);

  if (error) {
    console.error("Image upload failed:", error);
    throw error;
  }

  return data;
};

// ===== TOURIST SPOT IMAGE SPECIFIC FUNCTIONS =====

// Upload image to Supabase and add to tourist spot
export const uploadTouristSpotImage = async (
  touristSpotId: string,
  file: File,
  isPrimary: boolean = false,
  altText?: string
) => {
  try {
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${touristSpotId}_${timestamp}.${fileExt}`;
    const filePath = fileName;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tourist-spot-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;
    if (!uploadData?.path) throw new Error("Upload failed: no file path");
    const { data: publicData } = supabase.storage
      .from("tourist-spot-images")
      .getPublicUrl(uploadData.path);

    if (!publicData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    // 3. Add image record to database
    const imageData = {
      file_url: publicData.publicUrl,
      file_format: fileExt || 'jpg',
      file_size: file.size,
      is_primary: isPrimary,
      alt_text: altText || null,
    };

    const response = await axios.post(`${api}/tourist-spots/${touristSpotId}/images`, imageData);
    return response.data;

  } catch (error) {
    console.error("Tourist spot image upload failed:", error);
    throw error;
  }
};

// Get all images for a tourist spot
export const getTouristSpotImages = async (touristSpotId: string) => {
  try {
    const response = await axios.get(`${api}/tourist-spots/${touristSpotId}/images`);
    return response.data;
  } catch (error) {
    console.error("Get tourist spot images failed:", error);
    throw error;
  }
};

// Delete tourist spot image (both from database and Supabase storage)
export const deleteTouristSpotImage = async (touristSpotId: string, imageId: string, fileUrl: string) => {
  try {
    // 1. Delete from database
    await axios.delete(`${api}/tourist-spots/${touristSpotId}/images/${imageId}`);

    // 2. Extract file path from URL and delete from Supabase
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from("tourist-spot-images")
      .remove([fileName]);

    if (error) {
      console.warn("Failed to delete file from Supabase storage:", error);
      // Don't throw here since database deletion succeeded
    }

    return { success: true };
  } catch (error) {
    console.error("Delete tourist spot image failed:", error);
    throw error;
  }
};

// Set primary image for a tourist spot
export const setPrimaryTouristSpotImage = async (touristSpotId: string, imageId: string) => {
  try {
    const response = await axios.put(`${api}/tourist-spots/${touristSpotId}/images/${imageId}/set-primary`);
    return response.data;
  } catch (error) {
    console.error("Set primary image failed:", error);
    throw error;
  }
};

// Update image metadata (alt text, primary status)
export const updateTouristSpotImage = async (
  touristSpotId: string,
  imageId: string,
  updateData: { is_primary?: boolean; alt_text?: string }
) => {
  try {
    const response = await axios.put(`${api}/tourist-spots/${touristSpotId}/images/${imageId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update tourist spot image failed:", error);
    throw error;
  }
};
