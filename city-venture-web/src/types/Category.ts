/**
 * Hierarchical Category Types
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
  entity_type: 'business' | 'tourist_spot' | 'event';
  category_id: number;
  /** Priority level: 1=Primary, 2=Secondary, 3=Tertiary */
  level: 1 | 2 | 3;
  /** Computed from level === 1 */
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
/** Priority levels for entity category assignments */
export type CategoryPriority = 1 | 2 | 3;
