/**
 * useImageUpload — Comprehensive React hook for image upload management.
 *
 * Features:
 * - Instant preview via URL.createObjectURL (revoked on cleanup)
 * - Background upload with progress tracking per image
 * - Concurrency limiting (max 3 simultaneous uploads)
 * - Cancellation of in-flight uploads
 * - Deletion of already-uploaded images from storage
 * - Drag-and-drop reordering via external DnD library
 * - Memory safety: no raw buffers in state, all blob URLs revoked
 * - Batch cleanup on unmount
 * - Support for existing images (edit mode)
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type UploadedImage,
  type UploadStatus,
  type UploadResult,
  generateUploadId,
  createPreviewUrl,
  revokePreviewUrl,
  validateFiles,
  deleteUploadedImage,
  getUploadQueue,
  type FileValidationResult,
} from '@/lib/upload-service';

export interface UseImageUploadOptions {
  /** Maximum number of images allowed (default: 10) */
  maxImages?: number;
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize?: number;
  /** Maximum concurrent uploads (default: 3) */
  maxConcurrent?: number;
  /** Initial existing images (for edit mode) */
  initialImages?: Array<{
    url: string;
    blurDataUrl?: string;
  }>;
  /** Callback when validation errors occur */
  onValidationError?: (errors: string[]) => void;
}

export interface UseImageUploadReturn {
  /** Current list of all images (existing + new + uploading) */
  images: UploadedImage[];
  /** Add files from input or drop */
  addFiles: (files: FileList | File[]) => void;
  /** Remove image by ID — handles preview revocation, upload cancellation, and remote deletion */
  removeImage: (id: string) => Promise<void>;
  /** Reorder images (move from oldIndex to newIndex) */
  reorderImages: (oldIndex: number, newIndex: number) => void;
  /** Replace an image with a new file (e.g., after cropping) */
  replaceImage: (id: string, file: File) => void;
  /** Get all successfully uploaded remote URLs (in order) */
  getUploadedUrls: () => string[];
  /** Get blur data URL map { remoteUrl: blurDataUrl } */
  getBlurDataUrls: () => Record<string, string>;
  /** Whether all images are done uploading (no pending/uploading) */
  isAllUploaded: boolean;
  /** Whether any image is currently uploading */
  isUploading: boolean;
  /** Count of images currently uploading */
  uploadingCount: number;
  /** Clean up all state — revoke all previews, cancel uploads */
  cleanup: () => void;
  /** Clean up orphaned uploads (images uploaded but not linked to a product) */
  cleanupOrphans: () => Promise<void>;
  /** Total image count */
  totalCount: number;
  /** Successfully uploaded count */
  successCount: number;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    maxImages = 10,
    maxFileSize = 10 * 1024 * 1024,
    maxConcurrent = 3,
    initialImages = [],
    onValidationError,
  } = options;

  // Core state: all images (existing + new)
  const [images, setImages] = useState<UploadedImage[]>(() =>
    initialImages.map(img => ({
      id: generateUploadId(),
      previewUrl: img.url,
      remoteUrl: img.url,
      blurDataUrl: img.blurDataUrl ?? null,
      progress: 100,
      status: 'success' as const,
      error: null,
      fileName: img.url.split('/').pop() || 'existing',
      fileSize: 0,
      isExisting: true,
      _file: null,
      _abortController: null,
    }))
  );

  // Ref to track images for cleanup without stale closures
  const imagesRef = useRef<UploadedImage[]>(images);
  imagesRef.current = images;

  // Upload queue ref
  const queueRef = useRef(getUploadQueue(maxConcurrent));

  // ─── Updater helpers ──────────────────────────────────────────────────

  const updateImage = useCallback((id: string, updates: Partial<UploadedImage>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  }, []);

  // ─── Add files ────────────────────────────────────────────────────────

  const addFiles = useCallback((filesInput: FileList | File[]) => {
    const files = Array.from(filesInput);
    const currentCount = imagesRef.current.length;

    const validation: FileValidationResult = validateFiles(files, currentCount, maxImages, maxFileSize);

    if (validation.errors.length > 0) {
      onValidationError?.(validation.errors);
    }

    if (validation.valid.length === 0) return;

    // Create image entries with preview URLs
    const newImages: UploadedImage[] = validation.valid.map(file => ({
      id: generateUploadId(),
      previewUrl: createPreviewUrl(file),
      remoteUrl: null,
      blurDataUrl: null,
      progress: 0,
      status: 'pending' as const,
      error: null,
      fileName: file.name,
      fileSize: file.size,
      isExisting: false,
      _file: file,
      _abortController: null,
    }));

    setImages(prev => [...prev, ...newImages]);

    // Enqueue uploads
    for (const image of newImages) {
      queueRef.current.enqueue({
        image,
        onProgress: (id, progress) => {
          updateImage(id, { progress });
        },
        onSuccess: (id, result: UploadResult) => {
          updateImage(id, {
            remoteUrl: result.url,
            blurDataUrl: result.blurDataUrl,
            progress: 100,
            status: 'success',
            error: null,
            _file: null, // Release file reference
            _abortController: null,
          });
        },
        onError: (id, error) => {
          updateImage(id, {
            status: 'error',
            error,
            _file: null,
            _abortController: null,
          });
        },
        onStatusChange: (id, status) => {
          updateImage(id, { status });
        },
      });
    }
  }, [maxImages, maxFileSize, onValidationError, updateImage]);

  // ─── Remove image ─────────────────────────────────────────────────────

  const removeImage = useCallback(async (id: string) => {
    const image = imagesRef.current.find(img => img.id === id);
    if (!image) return;

    // 1. Cancel in-flight upload if any
    if (image._abortController) {
      image._abortController.abort();
    }

    // 2. Cancel from queue if pending
    queueRef.current.cancel(id);

    // 3. Revoke preview URL
    revokePreviewUrl(image.previewUrl);

    // 4. Remove from state immediately (UI responsiveness)
    setImages(prev => prev.filter(img => img.id !== id));

    // 5. Delete from remote storage if already uploaded (fire and forget)
    if (image.remoteUrl && !image.isExisting) {
      deleteUploadedImage(image.remoteUrl).catch(() => {
        // Silent failure — orphan cleanup can handle this later
      });
    }
  }, []);

  // ─── Reorder images ───────────────────────────────────────────────────

  const reorderImages = useCallback((oldIndex: number, newIndex: number) => {
    setImages(prev => {
      const result = [...prev];
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, []);

  // ─── Replace image (e.g., after cropping) ─────────────────────────────

  const replaceImage = useCallback((id: string, file: File) => {
    const image = imagesRef.current.find(img => img.id === id);
    if (!image) return;

    // Cancel existing upload if any
    if (image._abortController) {
      image._abortController.abort();
    }

    // Revoke old preview
    revokePreviewUrl(image.previewUrl);

    // Delete old remote if uploaded (fire and forget)
    if (image.remoteUrl && !image.isExisting) {
      deleteUploadedImage(image.remoteUrl).catch(() => {});
    }

    const newPreviewUrl = createPreviewUrl(file);

    // Update the image entry
    updateImage(id, {
      previewUrl: newPreviewUrl,
      remoteUrl: null,
      blurDataUrl: null,
      progress: 0,
      status: 'pending',
      error: null,
      fileName: file.name,
      fileSize: file.size,
      isExisting: false,
      _file: file,
      _abortController: null,
    });

    // Re-fetch the updated image for the queue
    const updatedImage: UploadedImage = {
      ...image,
      id,
      previewUrl: newPreviewUrl,
      remoteUrl: null,
      blurDataUrl: null,
      progress: 0,
      status: 'pending',
      error: null,
      fileName: file.name,
      fileSize: file.size,
      isExisting: false,
      _file: file,
      _abortController: null,
    };

    queueRef.current.enqueue({
      image: updatedImage,
      onProgress: (imgId, progress) => updateImage(imgId, { progress }),
      onSuccess: (imgId, result: UploadResult) => {
        updateImage(imgId, {
          remoteUrl: result.url,
          blurDataUrl: result.blurDataUrl,
          progress: 100,
          status: 'success',
          error: null,
          _file: null,
          _abortController: null,
        });
      },
      onError: (imgId, error) => {
        updateImage(imgId, {
          status: 'error',
          error,
          _file: null,
          _abortController: null,
        });
      },
      onStatusChange: (imgId, status) => {
        updateImage(imgId, { status });
      },
    });
  }, [updateImage]);

  // ─── Getters ──────────────────────────────────────────────────────────

  const getUploadedUrls = useCallback((): string[] => {
    return imagesRef.current
      .filter(img => img.remoteUrl !== null)
      .map(img => img.remoteUrl!);
  }, []);

  const getBlurDataUrls = useCallback((): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const img of imagesRef.current) {
      if (img.remoteUrl && img.blurDataUrl) {
        map[img.remoteUrl] = img.blurDataUrl;
      }
    }
    return map;
  }, []);

  // ─── Computed state ───────────────────────────────────────────────────

  const isUploading = images.some(img => img.status === 'uploading' || img.status === 'pending');
  const isAllUploaded = images.length > 0 && images.every(
    img => img.status === 'success' || img.status === 'error' || img.status === 'cancelled'
  );
  const uploadingCount = images.filter(img => img.status === 'uploading' || img.status === 'pending').length;
  const successCount = images.filter(img => img.status === 'success').length;

  // ─── Cleanup ──────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    for (const image of imagesRef.current) {
      // Cancel in-flight uploads
      if (image._abortController) {
        image._abortController.abort();
      }
      // Cancel queued uploads
      queueRef.current.cancel(image.id);
      // Revoke preview URLs
      revokePreviewUrl(image.previewUrl);
    }
    setImages([]);
  }, []);

  const cleanupOrphans = useCallback(async () => {
    // Delete any uploaded-but-not-linked images
    const orphans = imagesRef.current.filter(
      img => img.remoteUrl && !img.isExisting
    );
    await Promise.allSettled(
      orphans.map(img => deleteUploadedImage(img.remoteUrl!))
    );
    cleanup();
  }, [cleanup]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────

  useEffect(() => {
    return () => {
      // Revoke all preview URLs on unmount
      for (const image of imagesRef.current) {
        revokePreviewUrl(image.previewUrl);
        if (image._abortController) {
          image._abortController.abort();
        }
        queueRef.current.cancel(image.id);
      }
    };
  }, []);

  return {
    images,
    addFiles,
    removeImage,
    reorderImages,
    replaceImage,
    getUploadedUrls,
    getBlurDataUrls,
    isAllUploaded,
    isUploading,
    uploadingCount,
    cleanup,
    cleanupOrphans,
    totalCount: images.length,
    successCount,
  };
}
