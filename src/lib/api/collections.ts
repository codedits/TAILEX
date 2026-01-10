// ==========================================
// COLLECTIONS API - Server Actions
// ==========================================

'use server'

import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Collection, ApiResponse } from '@/lib/types'


// ==========================================
// IMAGE UPLOAD
// ==========================================

async function uploadImage(file: File): Promise<string> {
  const supabase = await createAdminClient()

  if (!file || file.size === 0) {
    throw new Error('Invalid file')
  }

  if (file.size > 6 * 1024 * 1024) {
    throw new Error('File size exceeds 6MB limit')
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('collections')
    .upload(fileName, file, {
      contentType: file.type,
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
          .upload(fileName, file, {
            contentType: file.type,
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

  return publicUrl
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

    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadImage(imageFile)
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
    revalidatePath('/')
    redirect('/admin/collections')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
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

    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadImage(imageFile)
      } catch (error) {
        return { error: 'Primary image upload failed' }
      }
    }

    const { data, error } = await supabase
      .from('collections')
      .update({
        title: title.trim(),
        slug: slug.toLowerCase().trim(),
        description: description?.trim() || null,
        image_url: imageUrl,
        is_visible: isVisible,
        seo_title: seoTitle?.trim() || null,
        seo_description: seoDescription?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/collections')
    revalidatePath(`/admin/collections/${id}`)
    revalidatePath('/collection')
    revalidatePath('/')
    redirect('/admin/collections')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// DELETE COLLECTION
// ==========================================

export async function deleteCollection(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/collections')
    revalidatePath('/collection')
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
