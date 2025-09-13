// src/hooks/useBusinessBasics.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "@/src/lib/supabase";
import type { Business } from "@/src/types/Business";

type BusinessCategory = { id: number; category: string };
type BusinessType = { id: number; type: string };

export const useBusinessBasics = (API_URL: string, data: Business, setData: React.Dispatch<React.SetStateAction<Business>>) => {
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch types
  const getBusinessTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/category-and-type/business-type`);
      if (Array.isArray(response.data)) {
        setBusinessTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  // Fetch categories based on type
  const getBusinessCategories = async (type_id: number) => {
    try {
      const response = await axios.get(`${API_URL}/category-and-type/category/${type_id}`);
      if (Array.isArray(response.data)) {
        setBusinessCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching business categories:", error);
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

  useEffect(() => {
    getBusinessTypes();
  }, []);

  // whenever data.business_type_id changes, fetch categories
  useEffect(() => {
    if (data.business_type_id) {
      setSelectedType(data.business_type_id);
      getBusinessCategories(data.business_type_id);
    }
  }, [data.business_type_id]);

  return {
    businessTypes,
    businessCategories,
    selectedType,
    setSelectedType,
    previewUrl,
    handleImageChange,
    handleUpload,
  };
};
