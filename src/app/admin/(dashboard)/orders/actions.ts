'use server';

import { OrderService } from '@/services/orders';
import { revalidatePath } from 'next/cache';

export async function deleteOrderAction(orderId: string) {
    try {
        await OrderService.deleteOrder(orderId);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        console.error('Delete Order Error:', error);
        return { error: error.message || 'Failed to delete order' };
    }
}
