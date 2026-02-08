'use server'

import { createAdminClient } from '@/lib/supabase/admin';

export type StockCheckResult = {
    available: number;
    isAvailable: boolean;
    error?: string;
};

export async function checkVariantStock(variantId: string, quantity: number): Promise<StockCheckResult> {
    try {
        const supabase = await createAdminClient();

        // Check inventory_levels
        const { data, error } = await supabase
            .from('inventory_levels')
            .select('available')
            .eq('variant_id', variantId)
            .single();

        if (error || !data) {
            // If no record, assume 0 stock or error
            // Check if product track_inventory is false? 
            // Ideally we should know product context, but strict mode implies 0 if missing.
            // For now, let's duplicate the logic: if no inventory record, it's safer to say 0.
            return { available: 0, isAvailable: false };
        }

        return {
            available: data.available || 0,
            isAvailable: (data.available || 0) >= quantity
        };
    } catch (error) {
        console.error('Stock Check Error:', error);
        return { available: 0, isAvailable: false, error: 'Failed to check stock' };
    }
}
