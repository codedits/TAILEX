// ==========================================
// COLLECTIONS API - Server Actions
// ==========================================

'use server'

import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Collection, ApiResponse } from '@/lib/types'
import { processImage, generateImageFilename } from '@/lib/image-processor'


// ==========================================
// IMAGE UPLOAD
// ==========================================

async function uploadImage(file: File): Promise<{ url: string; blurDataURL: string }> {
  const supabase = await createAdminClient()

  if (!file || file.size === 0) {
    throw new Error('Invalid file')
  }

  if (file.size > 6 * 1024 * 1024) {
    throw new Error('File size exceeds 6MB limit')
  }

  // Process through Sharp: resize, convert to WebP, generate blur
  const processed = await processImage(file, 'collection');
  const fileName = generateImageFilename('collections');

  const { error: uploadError } = await supabase.storage
    .from('collections')
    .upload(fileName, processed.buffer, {
      contentType: processed.contentType,
      cacheControl: '31536000',
    })

  if (uploadError) {
    // If bucket doesn't exist, try to create it and retry once
    const msg = (uploadError.message || '').toLowerCase()
    if (msg.includes('bucket not found') || msg.includes('not found')) {
      try {
        await ensureBucketExists('collections')
        const { error: retryErr } = await supabase.storage
          .from('collections')
          .upload(fileName, processed.buffer, {
            contentType: processed.contentType,
            cacheControl: '31536000',
          })

        if (retryErr) {
          throw new Error(`Upload failed after bucket create: ${retryErr.message}`)
        }
      } catch (err) {
        throw new Error(`Upload failed and bucket create attempt failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    } else {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('collections')
    .getPublicUrl(fileName)

  return { url: publicUrl, blurDataURL: processed.blurDataURL }
}

async function deleteImageFromStorage(url: string) {
  if (!url) return
  try {
    const supabase = await createAdminClient()

    // Extract filename/path from URL
    // URL: https://.../storage/v1/object/public/collections/filename.webp
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/')
    const bucketIndex = parts.indexOf('collections') // Find bucket name in path

    let storagePath = ''
    if (bucketIndex !== -1 && bucketIndex < parts.length - 1) {
      storagePath = parts.slice(bucketIndex + 1).join('/')
    } else {
      // Fallback to filename
      storagePath = parts[parts.length - 1]
    }

    if (storagePath) {
      const { error } = await supabase.storage
        .from('collections')
        .remove([storagePath])

      if (error) {
        console.error(`Failed to delete image ${storagePath} from collections:`, error.message)
      } else {
        console.log(`Deleted old collection image: ${storagePath}`)
      }
    }
  } catch (err) {
    console.error('Error in deleteImageFromStorage:', err)
  }
}

// ==========================================
// CREATE COLLECTION
// ==========================================

export async function createCollection(formData: FormData): Promise<ApiResponse<Collection>> {
  try {
    const supabase = await createAdminClient()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const isVisible = formData.get('is_visible') === 'on'
    const seoTitle = formData.get('seo_title') as string
    const seoDescription = formData.get('seo_description') as string

    // Validation
    if (!title || title.trim().length < 2) {
      return { error: 'Collection title must be at least 2 characters' }
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' }
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return { error: 'A collection with this slug already exists' }
    }

    // Handle image uploads
    const imageFile = formData.get('imageFile') as File
    let imageUrl: string | null = null
    let blurDataURL: string | null = null

    if (imageFile && imageFile.size > 0) {
      try {
        const result = await uploadImage(imageFile)
        imageUrl = result.url
        blurDataURL = result.blurDataURL
      } catch (error) {
        console.error('Image upload error:', error)
        return { error: 'Primary image upload failed' }
      }
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        title: title.trim(),
        slug: slug.toLowerCase().trim(),
        description: description?.trim() || null,
        image_url: imageUrl,
        is_visible: isVisible,
        metadata: blurDataURL && imageUrl ? { blurDataUrls: { [imageUrl]: blurDataURL } } : undefined,
        seo_title: seoTitle?.trim() || null,
        seo_description: seoDescription?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return { error: error.message }
    }

    revalidatePath('/admin/collections')
    revalidatePath('/collection')
    revalidatePath('/shop')
    revalidatePath('/')

    return { data: data as Collection }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// UPDATE COLLECTION
// ==========================================

export async function updateCollection(formData: FormData): Promise<ApiResponse<Collection>> {
  try {
    const supabase = await createAdminClient()

    const id = formData.get('id') as string
    if (!id) {
      return { error: 'Collection ID is required' }
    }

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const isVisible = formData.get('is_visible') === 'on'
    const seoTitle = formData.get('seo_title') as string
    const seoDescription = formData.get('seo_description') as string
    const existingImage = formData.get('existing_image') as string

    // Validation
    if (!title || title.trim().length < 2) {
      return { error: 'Collection title must be at least 2 characters' }
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { error: 'Invalid slug format' }
    }

    // Check for duplicate slug (excluding current collection)
    const { data: duplicate } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (duplicate) {
      return { error: 'A collection with this slug already exists' }
    }

    // Handle image uploads
    const imageFile = formData.get('imageFile') as File

    let imageUrl: string | null = existingImage || null
    let oldImageUrl: string | null = null
    let blurDataURL: string | null = null

    if (imageFile && imageFile.size > 0) {
      try {
        oldImageUrl = existingImage || null
        const result = await uploadImage(imageFile)
        imageUrl = result.url
        blurDataURL = result.blurDataURL
      } catch (error) {
        return { error: 'Primary image upload failed' }
      }
    }

    const updatePayload: Record<string, any> = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      description: description?.trim() || null,
      image_url: imageUrl,
      is_visible: isVisible,
      seo_title: seoTitle?.trim() || null,
      seo_description: seoDescription?.trim() || null,
    }

    // Store blur in metadata if we uploaded a new image
    if (blurDataURL && imageUrl) {
      updatePayload.metadata = { blurDataUrls: { [imageUrl]: blurDataURL } }
    }

    const { data, error } = await supabase
      .from('collections')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // If we successfully updated with a new image, delete the old one
    if (oldImageUrl && imageUrl !== oldImageUrl) {
      await deleteImageFromStorage(oldImageUrl)
    }

    revalidatePath('/admin/collections')
    revalidatePath(`/admin/collections/${id}`)
    revalidatePath('/collection')
    revalidatePath('/shop')
    revalidatePath('/')

    return { data: data as Collection }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// DELETE COLLECTION
// ==========================================

export async function deleteCollection(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createAdminClient()

    // Fetch the collection first to get the image URL
    const { data: collection } = await supabase
      .from('collections')
      .select('image_url')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    // If deletion from DB was successful, delete the image from storage
    if (collection?.image_url) {
      await deleteImageFromStorage(collection.image_url)
    }

    revalidatePath('/admin/collections')
    revalidatePath('/collection')
    revalidatePath('/shop')
    revalidatePath('/')

    return { message: 'Collection deleted successfully' }
  } catch (error) {
    return { error: 'Failed to delete collection' }
  }
}

// ==========================================
// GET COLLECTIONS
// ==========================================

export async function getCollections(options?: {
  visible?: boolean
  limit?: number
}): Promise<ApiResponse<Collection[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })

    if (options?.visible !== undefined) {
      query = query.eq('is_visible', options.visible)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { data: data as Collection[] }
  } catch (error) {
    return { error: 'Failed to fetch collections' }
  }
}

// ==========================================
// GET SINGLE COLLECTION
// ==========================================

export async function getCollection(slug: string): Promise<ApiResponse<Collection & { products: unknown[] }>> {
  try {
    const supabase = await createClient()

    const { data: collection, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      return { error: error.message }
    }

    // Fetch products in this collection
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', collection.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20)


    return {
      data: {
        ...collection,
        products: products || []
      } as Collection & { products: unknown[] }
    }
  } catch (error) {
    return { error: 'Failed to fetch collection' }
  }
}
