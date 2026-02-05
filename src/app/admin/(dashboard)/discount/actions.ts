'use server'

import { StoreConfigService } from '@/services/config';
import { revalidatePath } from 'next/cache';
import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin';
import { GlobalDiscountConfig } from '@/lib/types';

export async function updateGlobalDiscount(formData: FormData) {
    try {
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

            const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `discount/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(fileName, imageFile, {
                    contentType: imageFile.type,
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

