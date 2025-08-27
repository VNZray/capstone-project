export interface Permit {
  id: string;
  business_id: string;
  permit_type: string;
  file_url: string;
  file_format: string;
  file_size?: number;
  status: "Pending" | "Approved" | "Rejected";
  submitted_at?: Date;
  approved_at?: Date | null;
}
