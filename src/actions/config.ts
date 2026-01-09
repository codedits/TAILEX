'use server'

import { StoreConfigService } from '@/services/config';
import { revalidatePath } from 'next/cache';

export async function updateStoreConfigAction(key: string, value: any) {
    try {
        await StoreConfigService.updateConfig(key, value);
        revalidatePath('/', 'layout'); // Revalidate everything as config might affect navbar/footer
        return { success: true };
    } catch (error: any) {
        console.error('Update Store Config Error:', error);
        return { error: error.message || 'Failed to update configuration' };
    }
}
