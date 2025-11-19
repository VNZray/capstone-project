export type EntityType =
  | "tourist_spots"
  | "events"
  | "businesses";

export type ApprovalTableItem = Record<string, unknown> & {
  id: string;
  name: string;
  action_type: "new" | "edit";
  submitted_at?: string;
  created_at?: string;
  description?: string;
  entityType?: EntityType;
};