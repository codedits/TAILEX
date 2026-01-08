'use server'

import { StoreConfigService } from '@/services/config';
import { revalidatePath } from 'next/cache';

export async function updateStoreConfigAction(key: string, value: any) {
    try {
        await StoreConfigService.updateConfig(key, value);
        revalidatePath('/', 'layout'); // Revalidate everything as config might affect navbar/footer
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update configuration' };
    }
}
