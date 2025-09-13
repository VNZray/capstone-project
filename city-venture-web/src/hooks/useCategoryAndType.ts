import { useEffect, useState } from "react";
import { getDataById } from "../services/Service";
import type { Category, Type } from "../types/TypeAndCategeory";

export function useCategoryAndType(type_id?: number, category_id?: number) {

  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<Type | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!type_id || !category_id) return;

    const load = async () => {
      setLoading(true);
      try {
        const typeRes = await getDataById("category-and-type/type", type_id);
        setType({ id: typeRes.id, type: typeRes.type });

        const categoryRes = await getDataById("category-and-type/category-by-id", category_id);
        setCategory({
          id: categoryRes.id,
          category: categoryRes.category,
          type_id: categoryRes.type_id,
        });

      } catch (err) {
        console.error("Failed to fetch Category and Type", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [type_id, category_id]);

  return { loading, type, category };
}

