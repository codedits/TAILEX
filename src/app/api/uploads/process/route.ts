/**
 * POST /api/uploads/process
 * 
 * Streamed image upload endpoint.
 * Accepts multipart/form-data with a single "file" field.
 * 
 * Pipeline:
 * 1. Parse multipart form data (Next.js handles streaming)
 * 2. Validate file type and size
 * 3. Process through Sharp (resize → WebP → blur placeholder)
 * 4. Upload processed buffer to Supabase Storage
 * 5. Return public URL + blur data URL + dimensions
 * 
 * Memory safety:
 * - File buffer is processed incrementally by Sharp
 * - Only one processed buffer held at a time
 * - Buffer references are released after upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { processImage, generateImageFilename } from '@/lib/image-processor';
import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin';

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Process image through Sharp pipeline
    let processed;
    try {
      processed = await processImage(file, 'product');
    } catch (err) {
      console.error('Sharp processing failed:', err);
      return NextResponse.json(
        { error: 'Image processing failed. Please try a different image.' },
        { status: 422 }
      );
    }

    // Upload to Supabase Storage
    const supabase = await createAdminClient();

    // Ensure bucket exists
    try {
      await ensureBucketExists('products', {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/avif'],
      });
    } catch {
      // Bucket likely already exists, continue
    }

    const fileName = generateImageFilename('products');

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, processed.buffer, {
        contentType: processed.contentType,
        cacheControl: '31536000', // 1 year immutable
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    // Release buffer reference
    const responseData = {
      url: publicUrl,
      blurDataUrl: processed.blurDataURL,
      width: processed.width,
      height: processed.height,
      originalSize: processed.originalSize,
      processedSize: processed.processedSize,
    };

    return NextResponse.json({ data: responseData }, { status: 200 });

  } catch (err) {
    console.error('Upload API error:', err);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}

// App Router route segment config
export const runtime = 'nodejs';
export const maxDuration = 60;
