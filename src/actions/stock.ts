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

        // First check if the product tracks inventory
        const { data: variant } = await supabase
            .from('product_variants')
            .select('product_id')
            .eq('id', variantId)
            .single();

        if (variant) {
            const { data: product } = await supabase
                .from('products')
                .select('track_inventory')
                .eq('id', variant.product_id)
                .single();

            // If product doesn't track inventory, always available
            if (product && product.track_inventory === false) {
                return { available: 999, isAvailable: true };
            }
        }

        // Check inventory_levels
        const { data, error } = await supabase
            .from('inventory_levels')
            .select('available')
            .eq('variant_id', variantId)
            .single();

        if (error || !data) {
            // No inventory record and product tracks inventory → 0 stock
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
