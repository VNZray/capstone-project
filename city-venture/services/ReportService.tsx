import apiClient from '@/services/apiClient';
import { supabase } from '@/utils/supabase';

export interface CreateReportInput { reporter_id:string; target_type:string; target_id:string; title:string; description:string; attachments?: { file_url:string; file_name:string; file_type?:string; file_size?:number }[] }

export async function createReport(data:CreateReportInput){
  const res = await apiClient.post(`/reports`, data);
  return res.data;
}

export async function bulkAddAttachments(reportId:string, attachments:{ file_url:string; file_name:string; file_type?:string; file_size?:number }[]){
  const res = await apiClient.post(`/reports/${reportId}/attachments/bulk`, { attachments });
  return res.data;
}

export async function createReportWithAttachments(input:CreateReportInput){
  const { attachments = [], ...rest } = input;
  const reportResp = await createReport(rest as CreateReportInput);
  if(attachments.length){
    await bulkAddAttachments(reportResp.report_id, attachments);
  }
  return reportResp;
}

export async function getReportsByReporter(reporterId:string){
  const res = await apiClient.get(`/reports/reporter/${reporterId}`);
  const raw = res.data;
  if(Array.isArray(raw)) return raw;
  if(raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

export async function getReportById(id:string){
  const res = await apiClient.get(`/reports/${id}`);
  return res.data;
}

export async function uploadReportFileAndGetPublicUrl(
  uri:string,
  name:string,
  mimeType:string,
  reporterId?: string
){
  const res = await fetch(uri);
  let fileBody: any;
  try {
    const buf = await res.arrayBuffer();
    fileBody = new Uint8Array(buf);
  } catch {
    if ((res as any).blob) {
      fileBody = await (res as any).blob();
    } else {
      throw new Error('Unable to read file data for upload');
    }
  }
  // Determine extension
  let ext = '';
  if(name.includes('.')) ext = name.split('.').pop() || '';
  if(!ext && mimeType){
    if(mimeType === 'image/jpeg') ext = 'jpg';
    else if(mimeType === 'image/png') ext = 'png';
    else if(mimeType === 'image/gif') ext = 'gif';
    else if(mimeType === 'image/webp') ext = 'webp';
  }
  if(!ext) ext = 'bin';

  const safeReporter = (reporterId || 'anonymous').toLowerCase().replace(/[^a-z0-9-]/g,'-');
  const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
  const fileName = `${timestamp}.${ext}`;
  const path = `user-${safeReporter}/attachments/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('reports')
    .upload(path, fileBody, { contentType: mimeType, upsert: true });
  if(uploadError) throw uploadError;
  const finalPath = uploadData?.path || path;
  const { data: publicData } = supabase.storage.from('reports').getPublicUrl(finalPath);
  if(!publicData?.publicUrl) throw new Error('Failed to obtain public URL');
  return { publicUrl: publicData.publicUrl, path: finalPath };
}
