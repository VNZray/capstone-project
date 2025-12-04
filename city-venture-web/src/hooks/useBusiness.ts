// src/hooks/useBusinessBasics.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "@/src/lib/supabase";
import type { Business } from "@/src/types/Business";
import api from "../services/api";

type BusinessCategory = { id: number; category: string };
type BusinessType = { id: number; type: string };

export const useBusinessBasics = (data: Business, setData: React.Dispatch<React.SetStateAction<Business>>) => {
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch root-level categories for businesses
  const getBusinessCategories = async () => {
    try {
      const response = await axios.get(`${api}/category-and-type/business-type`);
      if (Array.isArray(response.data)) {
        setBusinessCategories(response.data);
        // Filter to only root categories (no parent)
        const roots = response.data.filter((c: Category) => c.parent_category === null);
        setRootCategories(roots);
      }
    } catch (error) {
      console.error("Error fetching business categories:", error);
    }
  };

  // Fetch category tree for hierarchical display
  const getCategoryTree = async () => {
    try {
      const response = await axios.get(`${api}/category-and-type/category/${type_id}`);
      if (Array.isArray(response.data)) {
        setCategoryTree(response.data);
      }
    } catch (error) {
      console.error("Error fetching category tree:", error);
    }
  };

  // Get child categories of a parent
  const getChildCategories = async (parentId: number): Promise<Category[]> => {
    try {
      const response = await axios.get(`${API_URL}/category-and-type/categories/${parentId}/children`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching child categories:", error);
      return [];
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
    if (API_URL) {
      getBusinessCategories();
      getCategoryTree();
    }
  }, [API_URL]);

  // Initialize selected categories from data.category_ids
  useEffect(() => {
    if (data.category_ids && data.category_ids.length > 0) {
      setSelectedCategories(data.category_ids);
    }
  }, [data.category_ids]);

  return {
    businessCategories,
    rootCategories,
    categoryTree,
    selectedCategories,
    setSelectedCategories,
    getChildCategories,
    previewUrl,
    handleImageChange,
    handleUpload,
  };
};
