/**
 * Cloudinary Direct Upload Service
 * Uses client-side Web Crypto API to sign upload requests securely without external dependencies.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: "wyydkkqm",
  apiKey: "421412387668829",
  apiSecret: "AKzf8VNGqvZ6ATFZLo-MMtRPh3o",
  uploadFolder: "kayan_menu",
};

/**
 * Computes SHA-1 hash of a string using the browser's built-in Web Crypto API
 */
async function sha1Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface UploadProgressCallback {
  (progressPercent: number, fileName: string): void;
}

/**
 * Upload a single image file or base64 string to Cloudinary
 */
export async function uploadImageToCloudinary(
  file: File | Blob | string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { cloudName, apiKey, apiSecret, uploadFolder } = CLOUDINARY_CONFIG;
  const timestamp = Math.round(Date.now() / 1000).toString();

  // Cloudinary signature parameters must be sorted alphabetically by key name
  const paramsToSign = `folder=${uploadFolder}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1Hex(paramsToSign);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", uploadFolder);
  formData.append("signature", signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch (e) {
          reject(new Error("فشل في تحليل استجابة Cloudinary"));
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          reject(new Error(errorResp.error?.message || "فشل رفع الصورة إلى Cloudinary"));
        } catch {
          reject(new Error(`خطأ في الرفع: كود ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("حدث خطأ في الاتصال أثناء رفع الصورة"));
    };

    xhr.send(formData);
  });
}

/**
 * Upload multiple files sequentially or with progress tracking
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  onOverallProgress?: (completedCount: number, totalCount: number, currentPercent: number) => void,
): Promise<string[]> {
  const results: string[] = [];
  const total = files.length;

  for (const [i, file] of files.entries()) {
    const url = await uploadImageToCloudinary(file, (percent) => {
      if (onOverallProgress) {
        onOverallProgress(i, total, percent);
      }
    });
    results.push(url);
    if (onOverallProgress) {
      onOverallProgress(i + 1, total, 100);
    }
  }

  return results;
}

/**
 * Helper to get optimized Cloudinary image URL with auto format and quality
 */
export function getOptimizedImageUrl(url: string, width = 800): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
