/**
 * Hierarchical Category Types for Mobile App
 */

export interface Category {
  id: number;
  parent_category: number | null;
  alias: string;
  title: string;
  description: string | null;
  applicable_to: 'business' | 'tourist_spot' | 'event' | 'business,tourist_spot' | 'business,event' | 'tourist_spot,event' | 'all';
  status: 'active' | 'inactive';
  sort_order: number;
  /** Tree depth - computed from parent_category chain, not stored in DB */
  level?: number;
  created_at: string;
  updated_at: string;
  parent_title?: string;
  children_count?: number;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface EntityCategory {
  id: number;
  entity_id: string;
  entity_type: EntityType;
  category_id: number;
  /** Priority level: 1=Primary, 2=Secondary, 3=Tertiary */
  level: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  category_title: string;
  category_alias: string;
  parent_category: number | null;
  parent_title?: string;
}

export type EntityType = 'business' | 'tourist_spot' | 'event';
export type ApplicableTo = Category['applicable_to'];
