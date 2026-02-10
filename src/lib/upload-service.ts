/**
 * Client-side upload service with background upload, progress tracking,
 * concurrency limiting, and cancellation support.
 *
 * Design goals:
 * - No large buffers stored in React state
 * - Object URLs revoked on deletion / unmount
 * - Concurrent upload limit (default 3) to prevent memory spikes
 * - Per-image progress, error, and cancellation
 * - Integrates with server-side Sharp processing via API route
 */

// ─── Types ───────────────────────────────────────────────────────────────

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadedImage {
  /** Client-side unique ID */
  id: string;
  /** Object URL for instant preview (revoke on cleanup!) */
  previewUrl: string;
  /** Remote URL after successful upload */
  remoteUrl: string | null;
  /** LQIP blur data URL from server processing */
  blurDataUrl: string | null;
  /** Upload progress 0–100 */
  progress: number;
  /** Current status */
  status: UploadStatus;
  /** Error message if failed */
  error: string | null;
  /** Original file name */
  fileName: string;
  /** Original file size in bytes */
  fileSize: number;
  /** Whether this image already existed (edit mode) */
  isExisting: boolean;
  /** The raw File reference — only kept while upload is pending/in-progress */
  _file: File | null;
  /** AbortController for cancelling in-flight upload */
  _abortController: AbortController | null;
}

export interface UploadResult {
  url: string;
  blurDataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
}

// ─── ID Generation ───────────────────────────────────────────────────────

let counter = 0;
export function generateUploadId(): string {
  return `img_${Date.now()}_${++counter}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Upload Queue ────────────────────────────────────────────────────────

type UploadTask = {
  image: UploadedImage;
  onProgress: (id: string, progress: number) => void;
  onSuccess: (id: string, result: UploadResult) => void;
  onError: (id: string, error: string) => void;
  onStatusChange: (id: string, status: UploadStatus) => void;
};

class UploadQueue {
  private queue: UploadTask[] = [];
  private active = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue(task: UploadTask) {
    this.queue.push(task);
    this.processNext();
  }

  cancel(id: string) {
    // Remove from queue if not yet started
    this.queue = this.queue.filter(t => t.image.id !== id);
  }

  private async processNext() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) return;

    const task = this.queue.shift()!;
    this.active++;

    try {
      await this.executeUpload(task);
    } finally {
      this.active--;
      this.processNext();
    }
  }

  private async executeUpload(task: UploadTask) {
    const { image, onProgress, onSuccess, onError, onStatusChange } = task;

    // File may have been cleared if cancelled before starting
    if (!image._file) {
      onStatusChange(image.id, 'cancelled');
      return;
    }

    const controller = new AbortController();
    image._abortController = controller;
    onStatusChange(image.id, 'uploading');

    try {
      const result = await uploadFileWithProgress(
        image._file,
        controller.signal,
        (progress) => onProgress(image.id, progress)
      );

      if (controller.signal.aborted) {
        onStatusChange(image.id, 'cancelled');
        return;
      }

      onSuccess(image.id, result);
    } catch (err) {
      if (controller.signal.aborted) {
        onStatusChange(image.id, 'cancelled');
        return;
      }
      const message = err instanceof Error ? err.message : 'Upload failed';
      onError(image.id, message);
    }
  }
}

// ─── Singleton upload queue ──────────────────────────────────────────────

let _queue: UploadQueue | null = null;

export function getUploadQueue(maxConcurrent = 3): UploadQueue {
  if (!_queue) {
    _queue = new UploadQueue(maxConcurrent);
  }
  return _queue;
}

// ─── Core upload function with XHR for progress ─────────────────────────

async function uploadFileWithProgress(
  file: File,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Abort handling
    const abortHandler = () => {
      xhr.abort();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };
    signal.addEventListener('abort', abortHandler);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      signal.removeEventListener('abort', abortHandler);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.data as UploadResult);
          }
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const errBody = JSON.parse(xhr.responseText);
          reject(new Error(errBody.error || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      signal.removeEventListener('abort', abortHandler);
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      signal.removeEventListener('abort', abortHandler);
      reject(new DOMException('Upload cancelled', 'AbortError'));
    });

    xhr.open('POST', '/api/uploads/process');
    xhr.send(formData);
  });
}

// ─── Delete uploaded image from storage ──────────────────────────────────

export async function deleteUploadedImage(remoteUrl: string): Promise<boolean> {
  try {
    const response = await fetch('/api/uploads/cleanup', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: remoteUrl }),
    });
    return response.ok;
  } catch {
    console.error('Failed to delete uploaded image:', remoteUrl);
    return false;
  }
}

// ─── Preview URL management ──────────────────────────────────────────────

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string) {
  // Only revoke blob: URLs, not remote URLs
  if (url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Silently ignore if already revoked
    }
  }
}

// ─── File validation ─────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_IMAGES = 10;

export interface FileValidationResult {
  valid: File[];
  errors: string[];
}

export function validateFiles(
  files: File[],
  currentCount: number,
  maxImages = MAX_IMAGES,
  maxSize = MAX_FILE_SIZE
): FileValidationResult {
  const errors: string[] = [];
  const remainingSlots = maxImages - currentCount;

  if (remainingSlots <= 0) {
    errors.push(`Maximum ${maxImages} images allowed`);
    return { valid: [], errors };
  }

  const sliced = files.slice(0, remainingSlots);
  if (files.length > remainingSlots) {
    errors.push(`Only ${remainingSlots} more image${remainingSlots > 1 ? 's' : ''} can be added`);
  }

  const valid: File[] = [];
  for (const file of sliced) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`"${file.name}" is not a supported format (JPEG, PNG, WebP)`);
      continue;
    }
    if (file.size > maxSize) {
      errors.push(`"${file.name}" exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      continue;
    }
    valid.push(file);
  }

  return { valid, errors };
}
