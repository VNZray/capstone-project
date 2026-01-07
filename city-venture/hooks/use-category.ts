import apiClient from '@/services/apiClient';
import type { EntityCategory } from '@/types/Category';
import { useEffect, useState } from 'react';

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
          `/category-and-type/entity-categories/${entityType}/${entityId}`
        );
        setCategories(data);
        const primary = data.find(c => c.is_primary) || data[0] || null;
        setPrimaryCategory(primary);
      } catch (err) {
        console.error('Failed to fetch entity categories', err);
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
  const category = primaryCategory
    ? {
        id: primaryCategory.category_id,
        category: primaryCategory.category_title,
      }
    : null;

  const type = primaryCategory?.parent_title
    ? {
        id: primaryCategory.parent_category || 0,
        type: primaryCategory.parent_title,
      }
    : null;

  return { loading, type, category, categories };
}

/**
 * Hook to fetch all categories for multiple entities at once
 * Useful for list views
 */
export function useCategoriesForEntities(
  entityType: 'business' | 'tourist_spot' | 'event',
  entityIds: string[]
) {
  const [loading, setLoading] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, EntityCategory[]>>({});
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!entityIds || entityIds.length === 0) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          entityIds.map(async (id) => {
            const { data } = await apiClient.get<EntityCategory[]>(
              `/category-and-type/entity-categories/${entityType}/${id}`
            );
            return { id, categories: data };
          })
        );

        if (cancelled) return;

        const map: Record<string, EntityCategory[]> = {};
        for (const result of results) {
          map[result.id] = result.categories;
        }
        setCategoriesMap(map);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error('Failed to bulk fetch entity categories', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [entityType, JSON.stringify(entityIds)]);

  const getCategories = (entityId: string) => categoriesMap[entityId] || [];
  const getPrimaryCategory = (entityId: string) => {
    const cats = categoriesMap[entityId] || [];
    return cats.find((c) => c.is_primary) || cats[0] || null;
  };

  return { loading, error, categoriesMap, getCategories, getPrimaryCategory };
}
