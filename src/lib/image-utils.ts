/**
 * Converts a File object to WebP format using:
 * 1. OffscreenCanvas in a Web Worker (if supported) for high performance without thread blocking.
 * 2. Fallback to main thread Canvas API (standard HTML5).
 * 
 * @param file The input file (image)
 * @param quality Quality between 0 and 1 (default 0.8)
 * @returns Promise resolving to a new File object in WebP format
 */
export async function convertFileToWebP(file: File, quality = 0.8): Promise<File> {
    // If already webp, return as is
    if (file.type === 'image/webp') return file;

    // Check for Worker and OffscreenCanvas support
    if (typeof window !== 'undefined' && window.Worker && typeof OffscreenCanvas !== 'undefined') {
        try {
            return await convertWithWorker(file, quality);
        } catch (error) {
            console.warn('Web Worker conversion failed, falling back to main thread:', error);
            return convertWithMainThread(file, quality);
        }
    } else {
        return convertWithMainThread(file, quality);
    }
}

async function convertWithWorker(file: File, quality: number): Promise<File> {
    return new Promise(async (resolve, reject) => {
        try {
            // Create ImageBitmap from file (efficient and transferrable)
            const bitmap = await createImageBitmap(file);

            // Adjust worker path as needed based on Next.js setup
            // This pattern works with standard Webpack/Next.js
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

function convertWithMainThread(file: File, quality: number): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0);

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
