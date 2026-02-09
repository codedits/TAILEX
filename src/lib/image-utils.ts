/**
 * Client-side image optimization before upload.
 * 
 * Pipeline:
 * 1. Resize to maxWidth (prevents uploading massive originals)
 * 2. Convert to WebP (smaller than JPEG/PNG)
 * 3. Use Web Worker with OffscreenCanvas when available (non-blocking)
 * 4. Fallback to main thread Canvas API
 * 
 * Sharp on the server handles final optimization — this just reduces upload bandwidth.
 * 
 * @param file The input image file
 * @param quality Quality between 0 and 1 (default 0.8)
 * @param maxWidth Maximum width in pixels (default 2400 — large enough for hero, small enough to not upload 6000px originals)
 * @returns Promise resolving to an optimized WebP File
 */
export async function convertFileToWebP(file: File, quality = 0.8, maxWidth = 2400): Promise<File> {
    // If already webp and small enough, return as is
    if (file.type === 'image/webp' && file.size < 500_000) return file;

    // Check for Worker and OffscreenCanvas support
    if (typeof window !== 'undefined' && window.Worker && typeof OffscreenCanvas !== 'undefined') {
        try {
            return await convertWithWorker(file, quality, maxWidth);
        } catch (error) {
            console.warn('Web Worker conversion failed, falling back to main thread:', error);
            return convertWithMainThread(file, quality, maxWidth);
        }
    } else {
        return convertWithMainThread(file, quality, maxWidth);
    }
}

async function convertWithWorker(file: File, quality: number, maxWidth: number): Promise<File> {
    return new Promise(async (resolve, reject) => {
        try {
            // Create ImageBitmap from file (efficient and transferrable)
            let bitmap = await createImageBitmap(file);

            // Resize if needed (createImageBitmap supports resize options)
            if (bitmap.width > maxWidth) {
                const ratio = maxWidth / bitmap.width;
                const newHeight = Math.round(bitmap.height * ratio);
                bitmap.close();
                bitmap = await createImageBitmap(file, {
                    resizeWidth: maxWidth,
                    resizeHeight: newHeight,
                    resizeQuality: 'high',
                });
            }

            const worker = new Worker(new URL('./image.worker.ts', import.meta.url));

            worker.onmessage = (e) => {
                const { success, blob, error } = e.data;

                if (success && blob) {
                    const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const newFile = new File([blob], newName, {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });
                    worker.terminate();
                    resolve(newFile);
                } else {
                    worker.terminate();
                    reject(new Error(error || 'Worker conversion failed'));
                }
            };

            worker.onerror = (err) => {
                worker.terminate();
                reject(err);
            };

            // Send bitmap to worker, transferring ownership
            worker.postMessage({ bitmap, quality }, [bitmap]);

        } catch (error) {
            reject(error);
        }
    });
}

function convertWithMainThread(file: File, quality: number, maxWidth: number): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Resize if needed
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Conversion failed'));
                    return;
                }

                // Create new file with .webp extension
                const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const newFile = new File([blob], newName, {
                    type: 'image/webp',
                    lastModified: Date.now()
                });

                // Clean up
                URL.revokeObjectURL(img.src);
                resolve(newFile);
            }, 'image/webp', quality);
        };

        img.onerror = (e) => {
            URL.revokeObjectURL(img.src);
            reject(e);
        };
    });
}
