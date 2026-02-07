'use server';

import { OrderService } from '@/services/orders';
import { revalidatePath } from 'next/cache';

export async function deleteOrderAction(orderId: string) {
    try {
        console.log('Action: Deleting order', orderId);
        await OrderService.deleteOrder(orderId);
        // We will rely on the client refreshing itself via router.refresh() 
        // to avoid potential streaming errors in dev mode with revalidatePath.
        return {
            success: true,
            timestamp: Date.now()
        };
    } catch (err: any) {
        console.error('Server Action Error:', err);
        return {
            success: false,
            error: String(err.message || 'Unknown error occurred')
        };
    }
}
export async function updateOrderStatusAction(orderId: string, status: string, paymentStatus?: string) {
    try {
        await OrderService.updateStatus(orderId, {
            status: status as any,
            payment_status: paymentStatus as any
        });
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        console.error('Update Order Status Error:', error);
        return { error: error.message || 'Failed to update order status' };
    }
}

