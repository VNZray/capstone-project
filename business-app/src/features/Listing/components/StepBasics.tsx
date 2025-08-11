import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import Text from "@/src/components/Text";
import "./Steps.css";
import React from "react";
import axios from "axios";

type Props = {
  onNext: () => void;
  onPrev: () => void;
};

const StepBasics: React.FC<Props> = ({ onNext, onPrev }) => {
  const [businessCategories, setBusinessCategories] = React.useState<
    { id: number; category: string }[]
  >([]);
  const [businessTypes, setBusinessTypes] = React.useState<
    { id: number; type: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = React.useState("");

  const API_URL = "http://192.168.1.8:3000/api";

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
        />

        <Input
          type="select"
          label="Business Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
        />
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
