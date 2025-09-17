import { getDataById } from '@/query/mainQuery';
import type { Category, Type } from '@/types/TypeAndCategory';
import { useEffect, useState } from 'react';

export function useCategoryAndType(type_id?: number, category_id?: number) {
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<Type | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!type_id || !category_id) return;

    const load = async () => {
      setLoading(true);
      try {
        const typeRes = await getDataById('category-and-type/type', type_id);
        setType({ id: typeRes.id, type: typeRes.type });

        const categoryRes = await getDataById(
          'category-and-type/category-by-id',
          category_id
        );
        setCategory({
          id: categoryRes.id,
          category: categoryRes.category,
          type_id: categoryRes.type_id,
        });
      } catch (err) {
        console.error('Failed to fetch Category and Type', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [type_id, category_id]);

  return { loading, type, category };
}

// Bulk variant: fetch all distinct type & category details for a list of businesses once.
// Provides O(T + C) network calls instead of O(N).
export function useCategoriesAndTypesForBusinesses(
  businesses: { business_type_id?: number; business_category_id?: number }[]
) {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<Record<number, Type>>({});
  const [categories, setCategories] = useState<Record<number, Category>>({});
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!businesses || businesses.length === 0) return;

    const uniqueTypeIds = Array.from(
      new Set(
        businesses
          .map((b) => b.business_type_id)
          .filter((id): id is number => typeof id === 'number')
      )
    );
    const uniqueCategoryIds = Array.from(
      new Set(
        businesses
          .map((b) => b.business_category_id)
          .filter((id): id is number => typeof id === 'number')
      )
    );

    if (uniqueTypeIds.length === 0 && uniqueCategoryIds.length === 0) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all types
        const typePromises = uniqueTypeIds.map(async (id) => {
          if (types[id]) return types[id];
          const res = await getDataById('category-and-type/type', id);
          return { id: res.id, type: res.type } as Type;
        });
        const categoryPromises = uniqueCategoryIds.map(async (id) => {
          if (categories[id]) return categories[id];
          const res = await getDataById('category-and-type/category-by-id', id);
          return {
            id: res.id,
            category: res.category,
            type_id: res.type_id,
          } as Category;
        });

        const [typeResults, categoryResults] = await Promise.all([
          Promise.all(typePromises),
          Promise.all(categoryPromises),
        ]);

        if (cancelled) return;

        setTypes((prev) => {
          const next = { ...prev };
          for (const t of typeResults) {
            if (t) next[t.id] = t;
          }
          return next;
        });
        setCategories((prev) => {
          const next = { ...prev };
          for (const c of categoryResults) {
            if (c) next[c.id] = c;
          }
          return next;
        });
      } catch (err) {
        if (!cancelled) setError(err);
        console.error('Failed to bulk fetch categories/types', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Depend on a stable signature of the IDs to avoid refetch loops
    JSON.stringify(
      businesses.map((b) => [b.business_type_id, b.business_category_id])
    ),
  ]);

  const getType = (id?: number) => (id ? types[id] : undefined);
  const getCategory = (id?: number) => (id ? categories[id] : undefined);

  return { loading, error, types, categories, getType, getCategory };
}
