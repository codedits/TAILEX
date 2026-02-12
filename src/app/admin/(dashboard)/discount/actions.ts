'use server'

import { StoreConfigService } from '@/services/config';
import { revalidatePath } from 'next/cache';
import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin';
import { GlobalDiscountConfig } from '@/lib/types';
import { verifyAdmin } from '@/lib/admin-auth';
import { processImage, generateImageFilename } from '@/lib/image-processor';

export async function updateGlobalDiscount(formData: FormData) {
    try {
        if (!await verifyAdmin()) throw new Error('Unauthorized');
        const enabled = formData.get('enabled') === 'true';
        const title = formData.get('title') as string || '';
        const percentage = parseInt(formData.get('percentage') as string) || 0;
        const delaySeconds = parseInt(formData.get('delaySeconds') as string) || 5;
        const showOncePerSession = formData.get('showOncePerSession') !== 'false';
        const existingImageUrl = formData.get('existingImageUrl') as string || '';
        const imageFile = formData.get('imageFile') as File | null;

        let imageUrl = existingImageUrl;

        // Handle image upload if new file provided
        if (imageFile && imageFile.size > 0) {
            await ensureBucketExists('site-assets');
            const supabase = await createAdminClient();

            // Process through Sharp: resize to card size, convert to WebP, generate blur
            const processed = await processImage(imageFile, 'card');
            const fileName = generateImageFilename('discount');

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(fileName, processed.buffer, {
                    contentType: processed.contentType,
                    cacheControl: '31536000'
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName);
            imageUrl = publicUrl;
        }

        const discountConfig: GlobalDiscountConfig = {
            enabled,
            title,
            percentage,
            imageUrl,
            delaySeconds,
            showOncePerSession
        };

        await StoreConfigService.updateConfig('global_discount', discountConfig);
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Update Global Discount Error:', error);
        return { error: error.message || 'Failed to update discount settings' };
    }
}

export async function deleteDiscountImage() {
    try {
        if (!await verifyAdmin()) throw new Error('Unauthorized');
        const supabase = await createAdminClient();

        // Get current config
        const { data } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'global_discount')
            .single();

        if (data?.value?.imageUrl) {
            const urlObj = new URL(data.value.imageUrl);
            const pathParts = urlObj.pathname.split('/site-assets/');
            if (pathParts.length >= 2) {
                await supabase.storage.from('site-assets').remove([pathParts[1]]);
            }

            // Update config to remove image
            await StoreConfigService.updateConfig('global_discount', {
                ...data.value,
                imageUrl: ''
            });
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Delete Discount Image Error:', error);
        return { error: error.message || 'Failed to delete image' };
    }
}

