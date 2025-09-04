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
  altText?: string,
  categoryName?: string,
  touristSpotName?: string
) => {
  try {
    // 1. Get tourist spot details if category and name not provided
    let category = categoryName;
    let spotName = touristSpotName;
    
    if (!category || !spotName) {
      const touristSpot = await getDataById('tourist-spots', touristSpotId);
      category = category || touristSpot.category || 'uncategorized';
      spotName = spotName || touristSpot.name || `spot-${touristSpotId}`;
    }
    
    // 2. Create file path with better folder structure: category/tourist-spot-name/filename
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${timestamp}.${fileExt}`;
    
    // Clean category and spot name for folder (remove spaces, special chars, lowercase)
    const categoryFolder = (category || 'uncategorized').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const spotNameFolder = (spotName || `spot-${touristSpotId}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filePath = `${categoryFolder}/${spotNameFolder}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("touristspots-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;
    if (!uploadData?.path) throw new Error("Upload failed: no file path");
    const { data: publicData } = supabase.storage
      .from("touristspots-images")
      .getPublicUrl(uploadData.path);

    if (!publicData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

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
    return response.data.data || [];
  } catch (error) {
    console.error("Get tourist spot images failed:", error);
    throw error;
  }
};

export const deleteTouristSpotImage = async (touristSpotId: string, imageId: string, fileUrl: string) => {
  try {
    // Delete from database
    await axios.delete(`${api}/tourist-spots/${touristSpotId}/images/${imageId}`);

    // Extract file path from URL and delete from Supabase
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'touristspots-images');
    
    let filePath;
    if (bucketIndex !== -1 && bucketIndex + 3 < urlParts.length) {
      const category = urlParts[bucketIndex + 1];
      const spotId = urlParts[bucketIndex + 2]; 
      const fileName = urlParts[bucketIndex + 3];
      filePath = `${category}/${spotId}/${fileName}`;
    } else {
      filePath = urlParts[urlParts.length - 1];
    }
    
    const { error } = await supabase.storage
      .from("touristspots-images")
      .remove([filePath]);

    if (error) {
      console.warn("Failed to delete file from Supabase storage:", error);
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

// ===== TOURIST SPOT CATEGORY FUNCTIONS =====

// Get categories for a tourist spot
export const getTouristSpotCategories = async (touristSpotId: string) => {
  try {
    const response = await axios.get(`${api}/tourist-spots/${touristSpotId}/categories`);
    return response.data.data || [];
  } catch (error) {
    console.error("Get tourist spot categories failed:", error);
    throw error;
  }
};

// Update categories for a tourist spot
export const updateTouristSpotCategories = async (touristSpotId: string, categoryIds: number[]) => {
  try {
    const response = await axios.put(`${api}/tourist-spots/${touristSpotId}/categories`, {
      category_ids: categoryIds
    });
    return response.data;
  } catch (error) {
    console.error("Update tourist spot categories failed:", error);
    throw error;
  }
};
