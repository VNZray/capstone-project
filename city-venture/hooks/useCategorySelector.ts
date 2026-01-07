/**
 * Hook for fetching and managing hierarchical categories in mobile app
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchCategoryTree,
  fetchCategoryChildren,
  fetchEntityCategories,
  addEntityCategory,
  removeEntityCategory,
} from '@/services/BusinessService';
import type { Category, CategoryTree, EntityCategory, EntityType } from '@/types/Category';

interface SelectedCategories {
  level1: number | null;
  level2: number | null;
  level3: number | null;
}

interface UseCategorySelectorOptions {
  entityType?: EntityType;
  entityId?: string;
  onCategoryChange?: (categories: SelectedCategories) => void;
}

export function useCategorySelector(options: UseCategorySelectorOptions = {}) {
  const { entityType = 'business', entityId, onCategoryChange } = options;

  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [level1Categories, setLevel1Categories] = useState<CategoryTree[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({
    level1: null,
    level2: null,
    level3: null,
  });
  
  const [entityCategories, setEntityCategories] = useState<EntityCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load category tree on mount
  useEffect(() => {
    const loadCategoryTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const tree = await fetchCategoryTree(entityType);
        setCategoryTree(tree);
        setLevel1Categories(tree);
      } catch (err) {
        console.error('Error loading category tree:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    loadCategoryTree();
  }, [entityType]);

  // Load entity categories if entityId provided
  useEffect(() => {
    if (entityId && entityType) {
      const loadEntityCategories = async () => {
        try {
          const categories = await fetchEntityCategories(entityType, entityId);
          setEntityCategories(categories);
          
          const primary = categories.find(c => c.level === 1);
          const secondary = categories.find(c => c.level === 2);
          const tertiary = categories.find(c => c.level === 3);
          
          setSelectedCategories({
            level1: primary?.category_id ?? null,
            level2: secondary?.category_id ?? null,
            level3: tertiary?.category_id ?? null,
          });
        } catch (err) {
          console.error('Error loading entity categories:', err);
        }
      };
      loadEntityCategories();
    }
  }, [entityId, entityType]);

  // Update level2 options when level1 changes
  useEffect(() => {
    if (selectedCategories.level1) {
      const loadLevel2 = async () => {
        try {
          const children = await fetchCategoryChildren(selectedCategories.level1!);
          setLevel2Categories(children);
          setLevel3Categories([]);
        } catch (err) {
          console.error('Error loading level 2 categories:', err);
        }
      };
      loadLevel2();
    } else {
      setLevel2Categories([]);
      setLevel3Categories([]);
    }
  }, [selectedCategories.level1]);

  // Update level3 options when level2 changes
  useEffect(() => {
    if (selectedCategories.level2) {
      const loadLevel3 = async () => {
        try {
          const children = await fetchCategoryChildren(selectedCategories.level2!);
          setLevel3Categories(children);
        } catch (err) {
          console.error('Error loading level 3 categories:', err);
        }
      };
      loadLevel3();
    } else {
      setLevel3Categories([]);
    }
  }, [selectedCategories.level2]);

  // Notify parent of category changes
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategories);
    }
  }, [selectedCategories, onCategoryChange]);

  const selectLevel1 = useCallback((categoryId: number | null) => {
    setSelectedCategories({
      level1: categoryId,
      level2: null,
      level3: null,
    });
  }, []);

  const selectLevel2 = useCallback((categoryId: number | null) => {
    setSelectedCategories(prev => ({
      ...prev,
      level2: categoryId,
      level3: null,
    }));
  }, []);

  const selectLevel3 = useCallback((categoryId: number | null) => {
    setSelectedCategories(prev => ({
      ...prev,
      level3: categoryId,
    }));
  }, []);

  const saveEntityCategories = useCallback(async (targetEntityId: string) => {
    if (!targetEntityId) return;

    try {
      for (const ec of entityCategories) {
        await removeEntityCategory(entityType, targetEntityId, ec.category_id);
      }

      if (selectedCategories.level1) {
        await addEntityCategory(entityType, targetEntityId, selectedCategories.level1, 1, true);
      }
      if (selectedCategories.level2) {
        await addEntityCategory(entityType, targetEntityId, selectedCategories.level2, 2, false);
      }
      if (selectedCategories.level3) {
        await addEntityCategory(entityType, targetEntityId, selectedCategories.level3, 3, false);
      }
    } catch (err) {
      console.error('Error saving entity categories:', err);
      throw err;
    }
  }, [entityType, entityCategories, selectedCategories]);

  const getSelectedTitles = useCallback(() => {
    const titles: string[] = [];
    
    if (selectedCategories.level1) {
      const cat = level1Categories.find(c => c.id === selectedCategories.level1);
      if (cat) titles.push(cat.title);
    }
    if (selectedCategories.level2) {
      const cat = level2Categories.find(c => c.id === selectedCategories.level2);
      if (cat) titles.push(cat.title);
    }
    if (selectedCategories.level3) {
      const cat = level3Categories.find(c => c.id === selectedCategories.level3);
      if (cat) titles.push(cat.title);
    }
    
    return titles;
  }, [selectedCategories, level1Categories, level2Categories, level3Categories]);

  const getPrimaryCategoryId = useCallback(() => {
    return selectedCategories.level3 || selectedCategories.level2 || selectedCategories.level1;
  }, [selectedCategories]);

  // For category filtering in lists - get all level 1 categories for tabs/chips
  const getCategoryFilterOptions = useCallback(() => {
    return [
      { id: 0, title: 'All', alias: 'all' },
      ...level1Categories.map(c => ({ id: c.id, title: c.title, alias: c.alias })),
    ];
  }, [level1Categories]);

  return {
    categoryTree,
    level1Categories,
    level2Categories,
    level3Categories,
    selectedCategories,
    entityCategories,
    loading,
    error,
    selectLevel1,
    selectLevel2,
    selectLevel3,
    saveEntityCategories,
    getSelectedTitles,
    getPrimaryCategoryId,
    getCategoryFilterOptions,
    hasLevel2Options: level2Categories.length > 0,
    hasLevel3Options: level3Categories.length > 0,
  };
}

export default useCategorySelector;
