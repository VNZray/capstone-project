import { useEffect, useState } from "react";
import type { Category, EntityCategory } from "../types/Category";
import apiClient from "../services/apiClient";

/**
 * Hook to fetch categories for an entity using entity_categories
 * @param entityType - 'business' | 'tourist_spot' | 'event'
 * @param entityId - The entity's ID
 */
export function useEntityCategories(entityType?: string, entityId?: string) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EntityCategory[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState<EntityCategory | null>(null);

  useEffect(() => {
    if (!entityType || !entityId) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get<EntityCategory[]>(
          `/categories/entity/${entityType}/${entityId}`
        );
        const cats = data || [];
        setCategories(Array.isArray(cats) ? cats : []);
        const primary = (Array.isArray(cats) ? cats : []).find((c: EntityCategory) => c.is_primary) || (Array.isArray(cats) ? cats[0] : null) || null;
        setPrimaryCategory(primary);
      } catch (err) {
        console.error("Failed to fetch entity categories", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [entityType, entityId]);

  return { loading, categories, primaryCategory };
}

/**
 * Legacy hook - kept for backward compatibility
 * Now fetches from entity_categories instead of old type/category endpoints
 * @deprecated Use useEntityCategories instead
 */
export function useCategoryAndType(entityType?: string, entityId?: string) {
  const { loading, categories, primaryCategory } = useEntityCategories(
    entityType === 'business' ? 'business' : entityType === 'tourist_spot' ? 'tourist_spot' : undefined,
    entityId
  );

  // Map to legacy format for backward compatibility
  const category = primaryCategory ? {
    id: primaryCategory.category_id,
    category: primaryCategory.category_title,
  } : null;

  const type = primaryCategory?.parent_title ? {
    id: primaryCategory.parent_category || 0,
    type: primaryCategory.parent_title,
  } : null;

  return { loading, type, category, categories };
}

