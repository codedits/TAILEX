'use server'

import { ProductService } from '@/services/products';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Product, ProductVariant, ApiResponse, PaginatedResponse } from '@/lib/types';
import { validateProductData } from '@/lib/logic/product-logic';
import { AppError } from '@/services/errors';

// Helper to handle Service errors in Actions
function handleActionError(error: unknown): ApiResponse<any> {
  console.error('Action Error:', error);
  if (error instanceof AppError) {
    return { error: error.message };
  }
  return { error: 'An unexpected error occurred' };
}

// ==========================================
// PRODUCTS
// ==========================================

import { productSchema } from '@/lib/validations/product';

// ...

export async function createProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const rawData: any = Object.fromEntries(formData.entries());

    // Manual adjustments for Zod
    rawData.status = formData.get('status') || 'draft';
    rawData.is_featured = formData.get('is_featured') === 'on';
    rawData.price = formData.get('price');
    rawData.sale_price = formData.get('sale_price');
    rawData.stock = formData.get('stock');
    rawData.category_id = formData.get('category_id') || null;

    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      console.error("Validation Error:", validatedFields.error.flatten());
      return { error: 'Invalid inputs: ' + Object.values(validatedFields.error.flatten().fieldErrors).join(', ') };
    }

    const productData = {
      ...validatedFields.data,
      tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    const imageFiles = formData.getAll('imageFiles') as File[];

    const product = await ProductService.createProduct(productData as any, imageFiles);

    revalidatePath('/admin/products');
    revalidatePath('/collection');
    revalidatePath('/');
    redirect('/admin/products');
  } catch (error) {
    if ((error as any).message === 'NEXT_REDIRECT') throw error;
    return handleActionError(error);
  }
}

export async function updateProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const id = formData.get('id') as string;
    if (!id) return { error: 'Product ID is required' };

    const rawData: any = Object.fromEntries(formData.entries());

    // Manual adjustments for Zod
    rawData.status = formData.get('status') || 'draft';
    rawData.is_featured = formData.get('is_featured') === 'on';
    rawData.price = formData.get('price');
    rawData.sale_price = formData.get('sale_price');
    rawData.stock = formData.get('stock');
    rawData.category_id = formData.get('category_id') || null;

    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      console.error("Validation Error:", validatedFields.error.flatten());
      return { error: 'Invalid inputs: ' + Object.values(validatedFields.error.flatten().fieldErrors).join(', ') };
    }

    const productData = {
      ...validatedFields.data,
      tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean) : [],
      existing_images: formData.get('existing_images') ? JSON.parse(formData.get('existing_images') as string) : undefined
    };

    const imageFiles = formData.getAll('imageFiles') as File[];

    // Pass validated data merging existing_images as expected by service
    const product = await ProductService.updateProduct(id, { ...productData as any, images: productData.existing_images }, imageFiles);

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath(`/product/${productData.slug}`);
    revalidatePath('/collection');
    revalidatePath('/');
    redirect('/admin/products');
  } catch (error) {
    if ((error as any).message === 'NEXT_REDIRECT') throw error;
    return handleActionError(error);
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  try {
    await ProductService.deleteProduct(id);
    revalidatePath('/admin/products');
    revalidatePath('/collection');
    return { message: 'Product deleted successfully' };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProducts(options?: any): Promise<ApiResponse<PaginatedResponse<Product>>> {
  try {
    const result = await ProductService.getProducts(options);
    return { data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProduct(slug: string): Promise<ApiResponse<Product>> {
  try {
    const product = await ProductService.getProductBySlug(slug);
    return { data: product };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// VARIANTS
// ==========================================

export async function createVariant(id: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> {
  try {
    const result = await ProductService.createVariant(id, variant);
    revalidatePath(`/admin/products/${id}`);
    return { data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateVariant(id: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> {
  try {
    const result = await ProductService.updateVariant(id, variant);
    return { data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteVariant(id: string): Promise<ApiResponse<null>> {
  try {
    await ProductService.deleteVariant(id);
    return { message: 'Variant deleted' };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// CART
// ==========================================

export async function validateCartItems(items: any[]): Promise<any> {
  try {
    return await ProductService.validateCartItems(items);
  } catch (error) {
    return { isValid: false, items: [], errors: ['Validation failed'] };
  }
}
