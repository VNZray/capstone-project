import { useEffect, useState } from "react";
import { fetchCategoryAndType } from "../services/CategoryAndType";

interface CategoryAndType {
  category_name: string;
  type_name: string;
}

export function useCategoryAndType(type_id?: string) {
  const [categoryAndType, setCategoryAndType] =
    useState<CategoryAndType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type_id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchCategoryAndType(type_id);
        setCategoryAndType(data[0]);
      } catch (err) {
        console.error("Failed to fetch Category and Type", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [type_id]);

  return { categoryAndType, loading };
}
