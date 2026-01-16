export interface Report {
  id: string;
  reporter_id: string;
  reporter_first_name?: string;
  reporter_last_name?: string;
  reporter_contact?: string;
  target_type: 'business' | 'event' | 'tourist_spot' | 'accommodation';
  target_id: string;
  title: string;
  description: string;
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
  reporter_email?: string;
  status_history?: ReportStatusHistory[];
  attachments?: ReportAttachment[];
  target_info?: { name: string; type: string; };
}

export interface ReportStatusHistory {
  id: string;
  report_id: string;
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
  remarks?: string;
  updated_by?: string;
  updated_by_email?: string;
  updated_at: string;
}

export interface ReportAttachment {
  id: string;
  report_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

export interface ReportFilters {
  status?: string;
  target_type?: string;
  date_from?: string;
  date_to?: string;
  priority?: string;
}

export interface ReportUpdateRequest {
  status: string;
  remarks?: string;
  updated_by?: string;
}
