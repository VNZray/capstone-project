export interface Permit {
  id: string;
  business_id: string;
  permit_type: string;
  file_url: string;
  file_format: string;
  file_size: number;
  file_name?: string;
  status: "pending" | "approved" | "rejected";
  expiration_date?: string;
  approved_at?: string;
  submitted_at: string;
  updated_at?: string;
}
