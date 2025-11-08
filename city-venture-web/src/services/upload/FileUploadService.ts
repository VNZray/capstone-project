import { supabase } from "@/src/lib/supabase";

export interface UploadOptions {
  folderName: string;
  fileName?: string;
  uploadTo: string;
  storeLocally?: boolean;
}

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  localUrl?: string;
  filePath?: string;
  error?: string;
}

/**
 * Generates a unique filename with timestamp
 */
function generateUniqueFileName(
  originalFileName: string,
  prefix?: string
): string {
  const fileExt = originalFileName.split(".").pop();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = prefix
    ? prefix.replace(/\s+/g, "_")
    : originalFileName.split(".")[0];

  return `${baseName}_${timestamp}.${fileExt}`;
}

/**
 * Converts file to Base64 for local storage
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Stores file preview locally in sessionStorage
 */
function storeLocallyInSession(
  file: File,
  storageKey: string,
  base64: string
): string {
  const localUrl = URL.createObjectURL(file);

  // Also store in session storage for persistence
  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        base64,
        fileName: file.name,
        fileType: file.type,
        timestamp: new Date().toISOString(),
        localUrl,
      })
    );
  } catch (err) {
    console.warn("Session storage full, using object URL only", err);
  }

  return localUrl;
}

/**
 * Stores file preview locally in localStorage
 */
function storeLocallyInStorage(
  file: File,
  storageKey: string,
  base64: string
): string {
  const localUrl = URL.createObjectURL(file);

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        base64,
        fileName: file.name,
        fileType: file.type,
        timestamp: new Date().toISOString(),
        localUrl,
      })
    );
  } catch (err) {
    console.warn("Local storage full, using object URL only", err);
  }

  return localUrl;
}

/**
 * Uploads file to Supabase Storage
 */
async function uploadToSupabase(
  file: File,
  folderName: string,
  fileName: string,
  uploadTo: string
): Promise<UploadResult> {
  try {
    const filePath = `${folderName}/${fileName}`;

    // Upload file to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(uploadTo)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    if (!uploadData?.path) {
      return {
        success: false,
        error: "Upload failed: no file path returned",
      };
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(uploadTo)
      .getPublicUrl(uploadData.path);

    if (!publicData?.publicUrl) {
      return {
        success: false,
        error: "Failed to get public URL",
      };
    }

    return {
      success: true,
      publicUrl: publicData.publicUrl,
      filePath: uploadData.path,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Unknown upload error",
    };
  }
}

/**
 * Main upload handler - uploads file and optionally stores locally
 * @param file - File to upload
 * @param options - Upload options (folderName, fileName, uploadTo, storeLocally)
 * @returns Upload result with publicUrl (Supabase) or localUrl (local storage)
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    folderName,
    fileName: customFileName,
    uploadTo,
    storeLocally = true,
  } = options;

  // Validate inputs
  if (!file) {
    return { success: false, error: "No file provided" };
  }
  if (!folderName) {
    return { success: false, error: "Folder name is required" };
  }
  if (!uploadTo) {
    return { success: false, error: "Upload destination (bucket) is required" };
  }

  try {
    // Generate unique filename if not provided
    const finalFileName = customFileName || generateUniqueFileName(file.name);

    // Store locally if requested
    let localUrl: string | undefined;
    if (storeLocally) {
      try {
        const base64 = await fileToBase64(file);
        const storageKey = `upload_${folderName}_${finalFileName}`;

        // Try localStorage first, fall back to sessionStorage
        try {
          localUrl = storeLocallyInStorage(file, storageKey, base64);
        } catch {
          console.warn("localStorage full, using sessionStorage");
          localUrl = storeLocallyInSession(file, storageKey, base64);
        }
      } catch (storageErr) {
        console.warn("Failed to store locally, proceeding with upload only", storageErr);
      }
    }

    // Upload to Supabase
    const uploadResult = await uploadToSupabase(
      file,
      folderName,
      finalFileName,
      uploadTo
    );

    if (!uploadResult.success) {
      // If Supabase upload fails but we have local storage, return local URL
      if (localUrl) {
        console.warn(
          "Supabase upload failed, returning local preview:",
          uploadResult.error
        );
        return {
          success: true,
          localUrl,
          error: `Local preview only (Supabase failed: ${uploadResult.error})`,
        };
      }
      return uploadResult;
    }

    // Return success with Supabase URL (and local URL if available)
    return {
      success: true,
      publicUrl: uploadResult.publicUrl,
      localUrl,
      filePath: uploadResult.filePath,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Upload process failed",
    };
  }
}

/**
 * Retrieves stored local file from storage
 */
export function getLocallyStoredFile(folderName: string, fileName: string) {
  const storageKey = `upload_${folderName}_${fileName}`;

  try {
    // Try localStorage first
    let stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }

    // Try sessionStorage
    stored = sessionStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }

    return null;
  } catch (err) {
    console.error("Error retrieving stored file:", err);
    return null;
  }
}

/**
 * Clears locally stored file
 */
export function clearLocallyStoredFile(
  folderName: string,
  fileName: string
): void {
  const storageKey = `upload_${folderName}_${fileName}`;

  try {
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
  } catch (err) {
    console.error("Error clearing stored file:", err);
  }
}

/**
 * Creates an object URL from local storage for preview
 */
export function getPreviewUrl(
  folderName: string,
  fileName: string
): string | null {
  const stored = getLocallyStoredFile(folderName, fileName);
  if (stored) {
    return stored.localUrl || stored.base64;
  }
  return null;
}
