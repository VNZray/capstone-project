import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import Text from "@/src/components/Text";
import "./Steps.css";
import React from "react";
import axios from "axios";
import { supabase } from "@/src/utils/supabase";
import type { Business } from "@/src/types/Business";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepBasics: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  data,
  setData,
}) => {
  const [businessCategories, setBusinessCategories] = React.useState<
    { id: number; category: string }[]
  >([]);
  const [businessTypes, setBusinessTypes] = React.useState<
    { id: number; type: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [businessImage, setBusinessImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const fetchBusinessCategory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/category-and-type/business-category`
      );
      if (Array.isArray(response.data)) {
        setBusinessCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching business categories:", error);
    }
  };

  const fetchBusinessTypes = async (categoryId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/category-and-type/type/${categoryId}`
      );
      if (Array.isArray(response.data)) {
        setBusinessTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBusinessImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setData((prev) => ({
        ...prev,
        business_image: URL.createObjectURL(file),
      }));
    }
  };

  const handleUpload = async (businessName: string) => {
    if (!businessImage) return;

    // Format folder name and file name safely
    const folderName = businessName.trim().replace(/\s+/g, "-").toLowerCase();
    const fileExt = businessImage.name.split(".").pop();
    const fileName = `${folderName}.${fileExt}`;

    const filePath = `${businessName}/${fileName}`; // Folder = Actual Business Name

    const { data, error } = await supabase.storage
      .from("business-profiles")
      .upload(filePath, businessImage, {
        cacheControl: "3600",
        upsert: true, // overwrite if already exists
      });

    if (error) {
      console.error("Error uploading business profile:", error.message);
      return null;
    }

    console.log("File uploaded:", data);
    return data.path; // You can store this in DB
  };

  React.useEffect(() => {
    fetchBusinessCategory();
  }, []);

  React.useEffect(() => {
    if (selectedCategory) {
      fetchBusinessTypes(selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text variant="card-title">Basic Information</Text>

      <div className="content">
        <Input
          type="text"
          label="Business Name"
          placeholder="Enter the business name"
          value={data.business_name}
          onChange={(e) =>
            setData((prev) => ({ ...prev, business_name: e.target.value }))
          }
        />

        <Input
          type="select"
          label="Business Category"
          value={data.business_category_id}
          onChange={(e) => {
            const value = e.target.value;
            setData((prev) => ({
              ...prev,
              business_category_id: value,
            }));
            setSelectedCategory(value); // ✅ This ensures fetchBusinessTypes runs
          }}
          options={[
            { value: "", label: "-- Select a category --" },
            ...businessCategories.map((category) => ({
              value: category.id.toString(),
              label: category.category,
            })),
          ]}
        />

        <Input
          type="select"
          label="Business Type"
          value={data.business_type_id}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              business_type_id: e.target.value,
            }))
          }
          options={[
            { value: "", label: "-- Select a type --" },
            ...businessTypes.map((type) => ({
              value: type.id.toString(),
              label: type.type,
            })),
          ]}
        />

        <Input
          type="text"
          label="Description"
          placeholder="Enter the description"
          value={data.description}
          onChange={(e) =>
            setData((prev) => ({ ...prev, description: e.target.value }))
          }
        />

        {/* File upload input */}
        <label style={{ fontWeight: "bold" }}>Business Profile Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {/* Preview */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Business Preview"
            style={{
              width: 150,
              height: 150,
              objectFit: "cover",
              marginTop: 8,
              borderRadius: 8,
            }}
          />
        )}
      </div>

      <div style={{ display: "flex", gap: 400 }}>
        <Button onClick={onPrev} variant="secondary" style={{ flex: 1 }}>
          <Text variant="normal" color="white">
            Back
          </Text>
        </Button>
        <Button onClick={onNext} variant="primary" style={{ flex: 1 }}>
          <Text variant="normal" color="white">
            Next
          </Text>
        </Button>
      </div>
    </div>
  );
};

export default StepBasics;
