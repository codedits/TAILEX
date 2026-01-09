// Web Worker for processing images off the main thread

self.onmessage = async (e: MessageEvent) => {
    const { bitmap, quality } = e.data;

    try {
        // Create an OffscreenCanvas
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get OffscreenCanvas context');
        }

        // Draw the bitmap onto the canvas
        ctx.drawImage(bitmap, 0, 0);

        // Convert the canvas content to a WebP Blob
        const blob = await canvas.convertToBlob({
            type: 'image/webp',
            quality: quality || 0.8,
        });

        // Send the result back to the main thread
        self.postMessage({ success: true, blob });
    } catch (error) {
        self.postMessage({ success: false, error: (error as Error).message });
    } finally {
        // Clean up the bitmap
        if (bitmap) {
            bitmap.close();
        }
    }
};
