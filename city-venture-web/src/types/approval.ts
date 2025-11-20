export type EntityType =
  | "tourist_spots"
  | "events"
  | "businesses";

export type ApprovalTableItem = Record<string, unknown> & {
  id: string | number;
  // Generic name (tourist spot name, business_name, edit request name)
  name?: string;
  business_name?: string;
  description?: string;
  // Action type for approval workflow
  action_type?: "new" | "edit";
  // Dates
  submitted_at?: string; // for edit requests
  created_at?: string; // for newly submitted entities
  // Entity type classification
  entityType?: EntityType;
  // Type & category meta
  type?: string; // tourist spot type
  business_type_name?: string;
  business_category_name?: string;
  categories?: { id: number | string; category: string; type_id?: number }[];
  current_categories?: { id: number | string; category: string; type_id?: number }[];
  // Images
  primary_image?: string | null; // tourist spot primary image
  business_image?: string | null; // business image
};

// Unified approval item used for the new compact card layout across all types
export interface UnifiedApprovalItem {
  // base identifiers
  id: string | number;
  entityType: EntityType; // tourist_spots | businesses | edits
  actionType: 'new' | 'edit';
  // display fields
  name: string; // resolved name/business_name
  typeLabel: string; // e.g. 'tourist spot', 'business', 'tourist spot edit'
  categoryLabel: string; // first category or business_category_name
  submittedDate: string; // created_at or submitted_at ISO string
  image?: string | null; // primary_image | business_image
  // original raw item for view details modal
  raw: ApprovalTableItem;
}