// src/hooks/useBusinessBasics.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "@/src/utils/supabase";
import type { Business } from "@/src/types/Business";

type BusinessCategory = { id: number; category: string };
type BusinessType = { id: number; type: string };

export const useBusinessBasics = (API_URL: string, data: Business, setData: React.Dispatch<React.SetStateAction<Business>>) => {
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch categories
  const fetchBusinessCategory = async () => {
    try {
      const response = await axios.get(`${API_URL}/category-and-type/business-category`);
      if (Array.isArray(response.data)) {
        setBusinessCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching business categories:", error);
    }
  };

  // Fetch types based on category
  const fetchBusinessTypes = async (categoryId: string) => {
    try {
      const response = await axios.get(`${API_URL}/category-and-type/type/${categoryId}`);
      if (Array.isArray(response.data)) {
        setBusinessTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBusinessImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setData((prev) => ({
        ...prev,
        business_image: preview,
      }));
    }
  };

  // Upload image to Supabase
  const handleUpload = async (businessName: string) => {
    if (!businessImage) return null;

    const folderName = businessName.trim().replace(/\s+/g, "-").toLowerCase();
    const fileExt = businessImage.name.split(".").pop();
    const fileName = `${folderName}.${fileExt}`;
    const filePath = `${businessName}/${fileName}`;

    const { data: uploadData, error } = await supabase.storage
      .from("business-profiles")
      .upload(filePath, businessImage, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading business profile:", error.message);
      return null;
    }

    return uploadData.path;
  };

  // Load categories on mount
  useEffect(() => {
    fetchBusinessCategory();
  }, []);

  // Fetch types when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchBusinessTypes(selectedCategory);
    }
  }, [selectedCategory]);

  return {
    businessCategories,
    businessTypes,
    selectedCategory,
    setSelectedCategory,
    previewUrl,
    handleImageChange,
    handleUpload,
  };
};
