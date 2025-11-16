import { useState, useCallback } from "react";
import type { UploadOptions, UploadResult } from "@/src/services/upload/FileUploadService";
import {
  uploadFile,
  clearLocallyStoredFile,
} from "@/src/services/upload/FileUploadService";

export interface UseFileUploadReturn {
  previewUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  publicUrl: string | null;
  filePath: string | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<UploadResult>;
  handleFileUpload: (file: File) => Promise<UploadResult>;
  clearUpload: () => void;
  resetError: () => void;
}

/**
 * React hook for handling file uploads with local storage support
 * @param options - Upload options (folderName, uploadTo, etc.)
 * @returns Upload state and handlers
 */
export function useFileUpload(options: UploadOptions): UseFileUploadReturn {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const result = await uploadFile(file, options);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success) {
          // Set preview URL (prefer local, fallback to public)
          const preview = result.localUrl || result.publicUrl || null;
          setPreviewUrl(preview);
          setPublicUrl(result.publicUrl || null);
          setFilePath(result.filePath || null);

          // Clear error if there was a warning
          if (result.error) {
            setError(result.error);
          }
        } else {
          setError(result.error || "Upload failed");
          setPreviewUrl(null);
        }

        return result;
      } catch (err: any) {
        const errorMsg = err?.message || "Upload process failed";
        setError(errorMsg);
        setPreviewUrl(null);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<UploadResult> => {
      const file = e.target.files?.[0];
      if (!file) {
        return { success: false, error: "No file selected" };
      }

      // Create immediate preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Then upload
      return await handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const clearUpload = useCallback(() => {
    if (filePath && options.folderName) {
      clearLocallyStoredFile(options.folderName, filePath);
    }
    setPreviewUrl(null);
    setPublicUrl(null);
    setFilePath(null);
    setUploadProgress(0);
  }, [options.folderName, filePath]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    previewUrl,
    isUploading,
    uploadProgress,
    error,
    publicUrl,
    filePath,
    handleFileSelect,
    handleFileUpload,
    clearUpload,
    resetError,
  };
}
