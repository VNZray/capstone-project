import axios from "axios";
import api from "@/src/services/api";
import { supabase } from "@/src/lib/supabase";

export const insertData = async (data: any, table: string) => {
  try {
    const response = await axios.post(`${api}/${table}`, data);
    return response.data;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
};

export const updateData = async (id: string | number, data: any, table: string) => {
  try {
    const response = await axios.put(`${api}/${table}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
};

export const deleteData = async (id: string | number, table: string) => {
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

export const getArrayData = async (table: string) => {
  try {
    const response = await axios.get(`${api}/${table}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Get array data failed:", error);
    throw error;
  }
};

export const getDataById = async (table: string, id: string | number) => {
  try {
    const response = await axios.get(`${api}/${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get by ID failed:", error);
    throw error;
  }
};

export const getDataByForeignId = async (table: string, foreignId: string | number) => {
  try {
    const response = await axios.get(`${api}/${table}/${foreignId}`);
    return response.data;
  } catch (error) {
    console.error("Get by foreign ID failed:", error);
    throw error;
  }
};

export const getArrayDataByForeignId = async (table: string, foreignId: string | number) => {
  try {
    const response = await axios.get(`${api}/${table}/${foreignId}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Get array data by foreign ID failed:", error);
    throw error;
  }
};


// ===== TOURIST SPOT IMAGE SPECIFIC FUNCTIONS =====

// Upload image to Supabase and add to tourist spot
export const uploadTouristSpotImage = async (
  touristSpotId: string,
  file: File,
  isPrimary: boolean = false,
  altText?: string,
  touristSpotName?: string,
  spotFolderName?: string // always use this for folder
) => {
  try {
    // 1. Get tourist spot details if category and name not provided
    // Always use spotFolderName if provided
    let folderName = spotFolderName;
    if (!folderName) {
      // Fallback: clean touristSpotName or DB value
      let spotName = touristSpotName;
      if (!spotName) {
        const touristSpot = await getDataById('tourist-spots', touristSpotId);
        spotName = touristSpot.name || `spot-${touristSpotId}`;
      }
      folderName = (spotName ?? `spot-${touristSpotId}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${folderName}/imgs/${fileName}`;

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
