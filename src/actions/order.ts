'use server'

import { OrderService } from '@/services/orders';
import { CreateOrderInput } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createOrderAction(input: CreateOrderInput) {
    try {
        const order = await OrderService.createOrder(input);
        revalidatePath('/admin/orders');
        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error('Create Order Error:', error);
        return { success: false, error: error.message || 'Failed to create order' };
    }
}
