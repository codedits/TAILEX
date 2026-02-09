import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppError } from './errors';
import { Product, ProductVariant, PaginatedResponse } from '@/lib/types';
import { unstable_cache } from 'next/cache';
import { processImage, generateBlurDataURL, generateImageFilename, type ImageCategory } from '@/lib/image-processor';

type ProductInput = Partial<Product> & {
    track_quantity?: boolean;
    existing_images?: string[];
};

function normalizeProductPayload(data: ProductInput) {
    const now = new Date().toISOString();

    const price = typeof data.price === 'string' ? Number(data.price) : data.price;
    const saleRaw = data.sale_price;
    const sale_price = (saleRaw === null || saleRaw === undefined || (saleRaw as unknown) === '')
        ? null
        : typeof saleRaw === 'string'
            ? Number(saleRaw)
            : saleRaw;

    // Note: stock is now managed in inventory_levels, not on products
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];

    const coverImage = data.cover_image && images.includes(data.cover_image)
        ? data.cover_image
        : images[0] || null;

    const trackInventory = typeof data.track_inventory === 'boolean'
        ? data.track_inventory
        : (typeof data.track_quantity === 'boolean' ? data.track_quantity : true);

    return {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        short_description: data.short_description ?? null,
        price: price ?? 0,
        sale_price,
        cost_per_item: data.cost_per_item ?? null,
        cover_image: coverImage,
        images,
        sku: data.sku ?? null,
        barcode: data.barcode ?? null,
        // stock is now in inventory_levels, not here
        track_inventory: trackInventory,
        allow_backorder: data.allow_backorder ?? false,
        weight: data.weight ?? null,
        weight_unit: data.weight_unit ?? 'kg',
        category_id: data.category_id ?? null,
        tags,
        vendor: data.vendor ?? null,
        product_type: data.product_type ?? null,
        status: data.status ?? 'draft',
        is_featured: data.is_featured ?? false,
        seo_title: data.seo_title ?? null,
        seo_description: data.seo_description ?? null,
        metadata: data.metadata ?? {},
        updated_at: now,
        published_at: (data.status === 'active') ? (data.published_at ?? now) : null,
        // Variant configuration
        enable_color_variants: data.enable_color_variants ?? false,
        enable_size_variants: data.enable_size_variants ?? false,
        available_colors: data.available_colors ?? [],
        available_sizes: data.available_sizes ?? [],
    } as Partial<Product>;
}

export const ProductService = {
    async getProducts(options?: {
        status?: 'active' | 'draft' | 'archived';
        categoryId?: string;
        featured?: boolean;
        limit?: number;
        offset?: number;
        search?: string;
        orderBy?: 'created_at' | 'price' | 'title';
        order?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Product>> {
        const supabase = await createClient();

        let query = supabase.from('products').select('*', { count: 'exact' });

        if (options?.status) query = query.eq('status', options.status);
        if (options?.categoryId) query = query.eq('category_id', options.categoryId);
        if (options?.featured !== undefined) query = query.eq('is_featured', options.featured);
        if (options?.search) {
            query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
        }

        const orderBy = options?.orderBy || 'created_at';
        const order = options?.order || 'desc';
        query = query.order(orderBy, { ascending: order === 'asc' });

        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw new AppError(error.message, 'DB_ERROR', 500);

        return {
            data: data as Product[],
            total: count || 0,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    },

    async getProductBySlug(slug: string): Promise<Product> {
        const supabase = await createClient();

        // Optimized query: Fetch product and minimal relation data
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        collection:collections(id, title, slug),
        variants:product_variants(*),
        options:product_options(*)
      `)
            .eq('slug', slug)
            .single();

        if (error) throw new AppError(error.message, 'DB_ERROR', 500);
        if (!data) throw AppError.notFound(`Product with slug "${slug}" not found`);

        // Fetch inventory levels for all variants
        if (data.variants && data.variants.length > 0) {
            const variantIds = data.variants.map((v: any) => v.id);
            const { data: inventory } = await supabase
                .from('inventory_levels')
                .select('variant_id, available')
                .in('variant_id', variantIds);

            // Map inventory to variants
            if (inventory) {
                const inventoryMap: Record<string, number> = {};
                for (const inv of inventory) {
                    inventoryMap[inv.variant_id] = (inventoryMap[inv.variant_id] || 0) + (inv.available || 0);
                }
                data.variants = data.variants.map((v: any) => ({
                    ...v,
                    inventory_quantity: inventoryMap[v.id] || 0
                }));
            }
        }

        return data as Product;
    },

    async deleteProduct(id: string): Promise<void> {
        const supabase = await createAdminClient();
        if (!id) throw AppError.badRequest('Product ID is required');

        // Fetch product first to get image URLs
        const { data: product } = await supabase
            .from('products')
            .select('images')
            .eq('id', id)
            .single();

        // Delete from database
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw new AppError(error.message, 'DB_ERROR', 500);

        // Delete all associated images from storage
        if (product?.images && Array.isArray(product.images)) {
            for (const imageUrl of product.images) {
                if (!imageUrl) continue;
                try {
                    // Extract filename from URL
                    const parts = imageUrl.split('/');
                    const fileName = `products/${parts[parts.length - 1]}`;
                    await supabase.storage.from('products').remove([fileName]);
                } catch (err) {
                    console.error('Failed to delete product image:', err);
                    // Continue deleting other images even if one fails
                }
            }
        }
    },

    async createProduct(data: Partial<Product>, imageFiles: File[]): Promise<Product> {
        const supabase = await createAdminClient();

        // Validate slug uniqueness
        if (data.slug) {
            const { data: existing, error: existsError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', data.slug)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                throw new AppError('Failed to validate product slug', 'DB_ERROR', 500);
            }

            if (existing) {
                throw AppError.badRequest(`Product with slug "${data.slug}" already exists`);
            }
        }

        const existingImages = Array.isArray(data.images) ? data.images : [];
        const { urls: imageUrls, blurDataUrls } = await this.handleImageUploads(imageFiles, existingImages);

        // Merge blur placeholders into metadata.blurDataUrls
        const existingBlurs = (data.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> || {};
        const productData = normalizeProductPayload({
            ...data,
            images: imageUrls,
            metadata: {
                ...(data.metadata || {}),
                blurDataUrls: { ...existingBlurs, ...blurDataUrls },
            },
        });
        productData.created_at = new Date().toISOString();

        const { data: newProduct, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw AppError.badRequest('Product with this slug or SKU already exists');
            }
            throw new AppError(error.message, 'DB_ERROR', 500);
        }
        return newProduct as Product;
    },

    async updateProduct(id: string, data: Partial<Product>, imageFiles: File[]): Promise<Product> {
        const supabase = await createAdminClient();

        // Validate slug uniqueness if changing
        if (data.slug) {
            const { data: existing, error: existsError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', data.slug)
                .neq('id', id)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                throw new AppError('Failed to validate product slug', 'DB_ERROR', 500);
            }

            if (existing) {
                throw AppError.badRequest(`Another product with slug "${data.slug}" already exists`);
            }
        }

        const existingImages = Array.isArray(data.images) ? data.images : [];
        const { urls: imageUrls, blurDataUrls } = await this.handleImageUploads(imageFiles, existingImages);

        // Merge blur placeholders into metadata.blurDataUrls
        const existingBlurs = (data.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> || {};
        const productData = normalizeProductPayload({
            ...data,
            images: imageUrls,
            metadata: {
                ...(data.metadata || {}),
                blurDataUrls: { ...existingBlurs, ...blurDataUrls },
            },
        });

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw AppError.badRequest('Product with this slug or SKU already exists');
            }
            throw new AppError(error.message, 'DB_ERROR', 500);
        }
        return updatedProduct as Product;
    },

    // Variant Management
    async createVariant(productId: string, variant: Partial<ProductVariant>): Promise<ProductVariant> {
        const supabase = await createAdminClient();
        const { data, error } = await supabase.from('product_variants').insert({ product_id: productId, ...variant }).select().single();
        if (error) throw new AppError(error.message, 'DB_ERROR');
        return data as ProductVariant;
    },

    async updateVariant(id: string, variant: Partial<ProductVariant>): Promise<ProductVariant> {
        const supabase = await createAdminClient();
        const { data, error } = await supabase.from('product_variants').update(variant).eq('id', id).select().single();
        if (error) throw new AppError(error.message, 'DB_ERROR');
        return data as ProductVariant;
    },

    async deleteVariant(id: string): Promise<void> {
        const supabase = await createAdminClient();
        const { error } = await supabase.from('product_variants').delete().eq('id', id);
        if (error) throw new AppError(error.message, 'DB_ERROR');
    },

    /**
     * Sync variants for a product
     * Deletes all existing variants and creates new ones
     */
    async syncVariants(
        productId: string,
        variants: Partial<ProductVariant>[],
        basePrice: number,
        baseSalePrice?: number | null
    ): Promise<ProductVariant[]> {
        const supabase = await createAdminClient();

        // Delete existing variants (Note: this is destructive to cart items if ON DELETE CASCADE is set)
        // TODO: Future refactor should update existing variants instead of delete/recreate
        const { error: deleteError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', productId);

        if (deleteError) {
            console.error('Error deleting variants:', deleteError);
            throw new AppError(deleteError.message, 'DB_ERROR');
        }

        // Return early if no variants to create
        if (variants.length === 0) {
            return [];
        }

        // Prepare variants for insert
        const variantsToInsert = variants.map((v, index) => ({
            product_id: productId,
            title: v.title || null,
            color: v.color || null,
            size: v.size || null,
            price: basePrice, // Enforce base price
            sale_price: baseSalePrice ?? null, // Enforce base sale price
            sku: v.sku || null,
            status: v.status || 'active',
            position: v.position ?? index,
            image_url: v.image_url
        }));

        const { data: insertedVariants, error: insertError } = await supabase
            .from('product_variants')
            .insert(variantsToInsert)
            .select();

        if (insertError) {
            console.error('Error inserting variants:', insertError);
            throw new AppError(insertError.message, 'DB_ERROR');
        }

        // Handle Inventory Updates
        if (insertedVariants && insertedVariants.length > 0) {
            // Get default location
            const { data: location } = await supabase
                .from('inventory_locations')
                .select('id')
                .eq('is_default', true)
                .maybeSingle();

            // If no default, get any location or create one
            let locationId = location?.id;
            if (!locationId) {
                const { data: anyLocation } = await supabase
                    .from('inventory_locations')
                    .select('id')
                    .limit(1)
                    .maybeSingle();

                if (anyLocation) {
                    locationId = anyLocation.id;
                } else {
                    // Create a default location if absolutely none exist
                    const { data: newLocation } = await supabase
                        .from('inventory_locations')
                        .insert({ name: 'Default Warehouse', is_default: true })
                        .select('id')
                        .single();
                    locationId = newLocation?.id;
                }
            }

            if (locationId) {
                // Prepare inventory records
                // We need to match inserted variants back to the input variants to get inventory_quantity
                // Since we inserted in order, we can map by index
                const inventoryToInsert = insertedVariants.map((v, index) => ({
                    location_id: locationId,
                    variant_id: v.id,
                    available: variants[index].inventory_quantity ?? 0
                }));

                const { error: invError } = await supabase
                    .from('inventory_levels')
                    .insert(inventoryToInsert);

                if (invError) {
                    console.error('Error creating inventory levels:', invError);
                    // Don't fail the whole request, but log it. Inventory will be 0.
                } else {
                    // Update returned variants with the inventory quantity we just set
                    return insertedVariants.map((v, i) => ({
                        ...v,
                        inventory_quantity: inventoryToInsert[i].available
                    }));
                }
            }
        }

        return (insertedVariants || []) as ProductVariant[];
    },

    // Cart Validation
    // Extended to support variant-aware cart items
    // Stock is now queried from inventory_levels (single source of truth)
    async validateCartItems(items: { id: string; productId?: string; variantId?: string; quantity: number; size?: string; color?: string }[]): Promise<any> {
        const supabase = await createClient();
        if (!items || items.length === 0) return { isValid: true, items: [], errors: [] };

        // Extract unique product IDs and variant IDs
        const productIds = [...new Set(items.map(i => i.productId || i.id))];
        const variantIds = [...new Set(items.filter(i => i.variantId).map(i => i.variantId!))];

        // Fetch products with variants
        const { data: products, error } = await supabase
            .from('products')
            .select(`id, title, price, sale_price, slug, cover_image, status, variants:product_variants(id, title, price, sale_price, image_url, color, size)`)
            .in('id', productIds);

        if (error || !products) return { isValid: false, items: [], errors: ['Failed to validate items'] };

        // Fetch inventory levels for all variants
        let inventoryMap: Record<string, number> = {};
        if (variantIds.length > 0) {
            const { data: inventory } = await supabase
                .from('inventory_levels')
                .select('variant_id, available')
                .in('variant_id', variantIds);

            if (inventory) {
                // Sum available stock across all locations for each variant
                for (const inv of inventory) {
                    inventoryMap[inv.variant_id] = (inventoryMap[inv.variant_id] || 0) + (inv.available || 0);
                }
            }
        }

        const validatedItems = [];
        const errors = [];
        let allValid = true;

        for (const item of items) {
            const productId = item.productId || item.id;
            const product = products.find(p => p.id === productId);
            if (!product || product.status !== 'active') {
                errors.push(`Product "${productId}" is unavailable`);
                allValid = false;
                continue;
            }

            // Find matching variant
            let variant = null;
            if (item.variantId && product.variants) {
                variant = (product.variants as any[]).find(v => v.id === item.variantId);
            }

            // Stock validation from inventory_levels
            const availableStock = item.variantId ? (inventoryMap[item.variantId] || 0) : 0;
            if (availableStock < item.quantity) {
                errors.push(`Insufficient stock for "${product.title}". Available: ${availableStock}`);
                allValid = false;
                continue;
            }

            // Calculate final price (variant price takes precedence)
            const basePrice = variant?.price ?? product.price;
            const salePrice = variant?.sale_price ?? product.sale_price;
            const finalPrice = (salePrice !== null && salePrice !== undefined && salePrice < basePrice)
                ? salePrice
                : basePrice;

            validatedItems.push({
                id: item.id,
                productId: productId,
                variantId: item.variantId,
                quantity: item.quantity,
                currentPrice: finalPrice,
                slug: product.slug,
                name: product.title,
                image: variant?.image_url || product.cover_image,
                size: item.size,
                color: item.color
            });
        }

        return { isValid: allValid, items: validatedItems, errors };
    },

    // Helper for image uploads — now with Sharp processing
    async handleImageUploads(files: File[], existingUrls: string[]): Promise<{
        urls: string[];
        blurDataUrls: Record<string, string>;
    }> {
        const supabase = await createAdminClient();
        const preservedUrls = Array.isArray(existingUrls) ? existingUrls.filter(Boolean) : [];
        const validFiles = files.filter(f => f && f.size > 0);
        const newUrls: string[] = [];
        const blurMap: Record<string, string> = {};

        for (const file of validFiles) {
            try {
                // Process through Sharp: resize, convert to WebP, generate blur
                const processed = await processImage(file, 'product');

                const fileName = generateImageFilename('products');

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, processed.buffer, {
                        contentType: processed.contentType,
                        cacheControl: '31536000',
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                newUrls.push(publicUrl);
                blurMap[publicUrl] = processed.blurDataURL;
            } catch (err) {
                console.error('Image processing error:', err);
                // Fallback: upload raw file if Sharp fails
                const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, file, { contentType: file.type, cacheControl: '31536000' });

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                    newUrls.push(publicUrl);
                }
            }
        }

        const allUrls = Array.from(new Set([...preservedUrls, ...newUrls]));

        return { urls: allUrls, blurDataUrls: blurMap };
    },
};
