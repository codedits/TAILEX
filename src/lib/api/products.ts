// ==========================================
// PRODUCTS API - Server Actions
// ==========================================

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Product, ProductVariant, ApiResponse, PaginatedResponse } from '@/lib/types'

// ==========================================
// IMAGE UPLOAD HELPER
// ==========================================

async function uploadImage(file: File, folder: string = 'products'): Promise<string> {
  const supabase = await createAdminClient()
  
  // Validate file
  if (!file || file.size === 0) {
    throw new Error('Invalid file')
  }
  
  if (file.size > 6 * 1024 * 1024) { // 6MB limit
    throw new Error('File size exceeds 6MB limit')
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
  }
  
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year cache
    })
  
  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error(`Upload failed: ${uploadError.message}`)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName)
  
  return publicUrl
}

// ==========================================
// CREATE PRODUCT
// ==========================================

export async function createProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createAdminClient()
    
    // Extract form data
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const salePrice = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null
    const stock = parseInt(formData.get('stock') as string) || 0
    const sku = formData.get('sku') as string || null
    const status = (formData.get('status') as string) || 'draft'
    const isFeatured = formData.get('is_featured') === 'on'
    const categoryId = formData.get('category_id') as string || null
    const tagsRaw = formData.get('tags') as string
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
    
    // Validation
    if (!title || title.trim().length < 2) {
      return { error: 'Product title must be at least 2 characters' }
    }
    
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' }
    }
    
    if (price < 0) {
      return { error: 'Price cannot be negative' }
    }
    
    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existing) {
      return { error: 'A product with this slug already exists' }
    }
    
    // Handle image uploads
    const existingImagesJson = formData.get('existing_images') as string
    let imageUrls: string[] = []
    
    try {
      if (existingImagesJson) {
        imageUrls = JSON.parse(existingImagesJson)
      }
    } catch {
      // Ignore parse errors
    }
    
    const files = formData.getAll('imageFiles') as File[]
    const validFiles = files.filter(f => f && f.size > 0)
    
    if (validFiles.length > 0) {
      const uploadPromises = validFiles.slice(0, 10).map(file => uploadImage(file))
      const uploadedUrls = await Promise.allSettled(uploadPromises)
      
      const successfulUploads = uploadedUrls
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value)
      
      imageUrls = [...imageUrls, ...successfulUploads]
    }
    
    const coverImage = imageUrls[0] || null
    
    // SEO fields
    const seoTitle = formData.get('seo_title') as string || null
    const seoDescription = formData.get('seo_description') as string || null
    
    // Insert product
    const product = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      description: description?.trim() || null,
      price,
      sale_price: salePrice,
      stock,
      sku: sku?.trim() || null,
      status,
      is_featured: isFeatured,
      category_id: categoryId || null,
      tags,
      cover_image: coverImage,
      images: imageUrls,
      seo_title: seoTitle?.trim() || null,
      seo_description: seoDescription?.trim() || null,
      published_at: status === 'active' ? new Date().toISOString() : null,
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return { error: error.message }
    }
    
    revalidatePath('/admin/products')
    revalidatePath('/collection')
    revalidatePath('/')
    redirect('/admin/products')
  } catch (error) {
    console.error('Unexpected error in createProduct:', error)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Let Next.js handle the redirect
    }
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// UPDATE PRODUCT
// ==========================================

export async function updateProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createAdminClient()
    
    const id = formData.get('id') as string
    if (!id) {
      return { error: 'Product ID is required' }
    }
    
    // Check if product exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, slug, images')
      .eq('id', id)
      .single()
    
    if (!existingProduct) {
      return { error: 'Product not found' }
    }
    
    // Extract form data
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const salePrice = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null
    const stock = parseInt(formData.get('stock') as string) || 0
    const sku = formData.get('sku') as string || null
    const status = (formData.get('status') as string) || 'draft'
    const isFeatured = formData.get('is_featured') === 'on'
    const categoryId = formData.get('category_id') as string || null
    const tagsRaw = formData.get('tags') as string
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
    
    // Validation
    if (!title || title.trim().length < 2) {
      return { error: 'Product title must be at least 2 characters' }
    }
    
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { error: 'Invalid slug format' }
    }
    
    if (price < 0) {
      return { error: 'Price cannot be negative' }
    }
    
    // Check for duplicate slug (excluding current product)
    if (slug !== existingProduct.slug) {
      const { data: duplicate } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()
      
      if (duplicate) {
        return { error: 'A product with this slug already exists' }
      }
    }
    
    // Handle image uploads
    const existingImagesJson = formData.get('existing_images') as string
    let imageUrls: string[] = []
    
    try {
      if (existingImagesJson) {
        imageUrls = JSON.parse(existingImagesJson)
      }
    } catch {
      // Use existing images from DB if parse fails
      imageUrls = (existingProduct.images as string[]) || []
    }
    
    const files = formData.getAll('imageFiles') as File[]
    const validFiles = files.filter(f => f && f.size > 0)
    
    if (validFiles.length > 0) {
      const uploadPromises = validFiles.slice(0, 10 - imageUrls.length).map(file => uploadImage(file))
      const uploadedUrls = await Promise.allSettled(uploadPromises)
      
      const successfulUploads = uploadedUrls
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value)
      
      imageUrls = [...imageUrls, ...successfulUploads]
    }
    
    const coverImage = imageUrls[0] || null
    
    // Update product
    const updateData = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      description: description?.trim() || null,
      price,
      sale_price: salePrice,
      stock,
      sku: sku?.trim() || null,
      status,
      is_featured: isFeatured,
      category_id: categoryId || null,
      tags,
      cover_image: coverImage,
      images: imageUrls,
      seo_title: (formData.get('seo_title') as string)?.trim() || null,
      seo_description: (formData.get('seo_description') as string)?.trim() || null,
      published_at: status === 'active' ? new Date().toISOString() : null,
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return { error: error.message }
    }
    
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)
    revalidatePath(`/product/${slug}`)
    revalidatePath('/collection')
    revalidatePath('/')
    redirect('/admin/products')
  } catch (error) {
    console.error('Unexpected error in updateProduct:', error)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// DELETE PRODUCT
// ==========================================

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createAdminClient()
    
    if (!id) {
      return { error: 'Product ID is required' }
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Delete error:', error)
      return { error: error.message }
    }
    
    revalidatePath('/admin/products')
    revalidatePath('/collection')
    revalidatePath('/')
    
    return { message: 'Product deleted successfully' }
  } catch (error) {
    console.error('Unexpected error in deleteProduct:', error)
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// GET PRODUCTS (Public)
// ==========================================

export async function getProducts(options?: {
  status?: 'active' | 'draft' | 'archived'
  categoryId?: string
  featured?: boolean
  limit?: number
  offset?: number
  search?: string
  orderBy?: 'created_at' | 'price' | 'title'
  order?: 'asc' | 'desc'
}): Promise<ApiResponse<PaginatedResponse<Product>>> {
  try {
    const supabase = await createClient()
    
    let query = supabase.from('products').select('*', { count: 'exact' })
    
    // Apply filters
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }
    
    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured)
    }
    
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }
    
    // Ordering
    const orderBy = options?.orderBy || 'created_at'
    const order = options?.order || 'desc'
    query = query.order(orderBy, { ascending: order === 'asc' })
    
    // Pagination
    const limit = options?.limit || 20
    const offset = options?.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      return { error: error.message }
    }
    
    return {
      data: {
        data: data as Product[],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { error: 'Failed to fetch products' }
  }
}

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

export async function getProduct(slug: string): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, title, slug),
        variants:product_variants(*),
        options:product_options(*)
      `)
      .eq('slug', slug)
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    return { data: data as Product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { error: 'Failed to fetch product' }
  }
}

// ==========================================
// PRODUCT VARIANTS
// ==========================================

export async function createVariant(productId: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> {
  try {
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        ...variant,
      })
      .select()
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    revalidatePath(`/admin/products/${productId}`)
    return { data: data as ProductVariant }
  } catch (error) {
    return { error: 'Failed to create variant' }
  }
}

export async function updateVariant(id: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> {
  try {
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('product_variants')
      .update(variant)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    return { data: data as ProductVariant }
  } catch (error) {
    return { error: 'Failed to update variant' }
  }
}

export async function deleteVariant(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createAdminClient()
    
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)
    
    if (error) {
      return { error: error.message }
    }
    
    return { message: 'Variant deleted' }
  } catch (error) {
    return { error: 'Failed to delete variant' }
  }
}
