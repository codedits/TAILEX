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

