// ==========================================
// ORDERS API - Server Actions
// ==========================================

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  Order, 
  OrderItem, 
  CreateOrderInput, 
  ApiResponse,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus
} from '@/lib/types'

// ==========================================
// CREATE ORDER
// ==========================================

export async function createOrder(input: CreateOrderInput): Promise<ApiResponse<Order>> {
  try {
    const supabase = await createAdminClient()
    
    // Validate input
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      return { error: 'Valid email is required' }
    }
    
    if (!input.items || input.items.length === 0) {
      return { error: 'Order must contain at least one item' }
    }
    
    if (!input.shipping_address || !input.shipping_address.address1) {
      return { error: 'Shipping address is required' }
    }
    
    // Fetch product data for all items
    const productIds = input.items.map(item => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, price, sale_price, cover_image, sku, stock')
      .in('id', productIds)
    
    if (productsError || !products) {
      return { error: 'Failed to fetch product data' }
    }
    
    // Create product lookup map
    const productMap = new Map(products.map(p => [p.id, p]))
    
    // Validate stock and calculate totals
    let subtotal = 0
    const orderItems: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[] = []
    
    for (const item of input.items) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return { error: `Product not found: ${item.product_id}` }
      }
      
      // Check stock
      if (product.stock !== null && product.stock < item.quantity) {
        return { error: `Insufficient stock for "${product.title}". Available: ${product.stock}` }
      }
      
      const unitPrice = product.sale_price || product.price
      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice
      
      orderItems.push({
        product_id: product.id,
        variant_id: item.variant_id || null,
        title: product.title,
        variant_title: null, // TODO: Get variant title
        sku: product.sku,
        image_url: product.cover_image,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_amount: 0,
        total_price: totalPrice,
        fulfilled_quantity: 0,
        requires_shipping: true,
        properties: {},
      })
    }
    
    // Apply discount if provided
    let discountTotal = 0
    const discountCodes: { code: string; type: string; value: number; amount: number }[] = []
    
    if (input.discount_code) {
      const { data: discount } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', input.discount_code.toUpperCase())
        .eq('is_active', true)
        .single()
      
      if (discount) {
        const now = new Date()
        const startsAt = new Date(discount.starts_at)
        const endsAt = discount.ends_at ? new Date(discount.ends_at) : null
        
        if (now >= startsAt && (!endsAt || now <= endsAt)) {
          if (subtotal >= discount.minimum_purchase) {
            if (discount.type === 'percentage') {
              discountTotal = subtotal * (discount.value / 100)
            } else if (discount.type === 'fixed_amount') {
              discountTotal = Math.min(discount.value, subtotal)
            }
            
            discountCodes.push({
              code: discount.code,
              type: discount.type,
              value: discount.value,
              amount: discountTotal,
            })
            
            // Increment usage count
            await supabase
              .from('discounts')
              .update({ usage_count: discount.usage_count + 1 })
              .eq('id', discount.id)
          }
        }
      }
    }
    
    // Calculate totals
    const shippingTotal = subtotal >= 100 ? 0 : 9.99 // Free shipping over $100
    const taxRate = 0 // TODO: Get from store config
    const taxTotal = (subtotal - discountTotal) * taxRate
    const total = subtotal - discountTotal + shippingTotal + taxTotal
    
    // Get customer ID if logged in
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user?.id || null,
        email: input.email,
        phone: input.phone || null,
        status: 'pending',
        payment_status: 'pending',
        fulfillment_status: 'unfulfilled',
        currency: 'USD',
        subtotal,
        discount_total: discountTotal,
        shipping_total: shippingTotal,
        tax_total: taxTotal,
        total,
        shipping_address: input.shipping_address,
        billing_address: input.billing_address || input.shipping_address,
        discount_codes: discountCodes,
        customer_note: input.customer_note || null,
        source: 'web',
      })
      .select()
      .single()
    
    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return { error: 'Failed to create order' }
    }
    
    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
    
    if (itemsError) {
      console.error('Order items error:', itemsError)
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id)
      return { error: 'Failed to create order items' }
    }
    
    // Update product stock
    for (const item of input.items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity,
      })
    }
    
    revalidatePath('/admin/orders')
    
    return { data: order as Order, message: 'Order created successfully' }
  } catch (error) {
    console.error('Unexpected error in createOrder:', error)
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

export async function updateOrderStatus(
  orderId: string, 
  updates: {
    status?: OrderStatus
    payment_status?: PaymentStatus
    fulfillment_status?: FulfillmentStatus
    tracking_number?: string
    tracking_url?: string
    internal_note?: string
  }
): Promise<ApiResponse<Order>> {
  try {
    const supabase = await createAdminClient()
    
    const updateData: Record<string, unknown> = { ...updates }
    
    // Add timestamps based on status changes
    if (updates.status === 'shipped' && !updateData.shipped_at) {
      updateData.shipped_at = new Date().toISOString()
    }
    
    if (updates.status === 'delivered' && !updateData.delivered_at) {
      updateData.delivered_at = new Date().toISOString()
    }
    
    if (updates.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }
    
    if (['delivered', 'cancelled', 'refunded'].includes(updates.status || '')) {
      updateData.closed_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    
    return { data: data as Order }
  } catch (error) {
    return { error: 'Failed to update order status' }
  }
}

// ==========================================
// GET ORDERS (Admin)
// ==========================================

export async function getOrders(options?: {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  customerId?: string
  limit?: number
  offset?: number
}): Promise<ApiResponse<Order[]>> {
  try {
    const supabase = await createAdminClient()
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false })
    
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.paymentStatus) {
      query = query.eq('payment_status', options.paymentStatus)
    }
    
    if (options?.customerId) {
      query = query.eq('customer_id', options.customerId)
    }
    
    if (options?.limit) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { error: error.message }
    }
    
    return { data: data as Order[] }
  } catch (error) {
    return { error: 'Failed to fetch orders' }
  }
}

// ==========================================
// GET SINGLE ORDER
// ==========================================

export async function getOrder(orderId: string): Promise<ApiResponse<Order>> {
  try {
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        customer:customers(*)
      `)
      .eq('id', orderId)
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    return { data: data as Order }
  } catch (error) {
    return { error: 'Failed to fetch order' }
  }
}

// ==========================================
// GET CUSTOMER ORDERS
// ==========================================

export async function getCustomerOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      return { error: error.message }
    }
    
    return { data: data as Order[] }
  } catch (error) {
    return { error: 'Failed to fetch orders' }
  }
}

// ==========================================
// CANCEL ORDER
// ==========================================

export async function cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<Order>> {
  try {
    const supabase = await createAdminClient()
    
    // Get order to check status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status, payment_status, items:order_items(product_id, quantity)')
      .eq('id', orderId)
      .single()
    
    if (fetchError || !order) {
      return { error: 'Order not found' }
    }
    
    if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return { error: `Cannot cancel order with status: ${order.status}` }
    }
    
    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
        internal_note: reason ? `Cancelled: ${reason}` : 'Order cancelled',
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    // Restore stock
    for (const item of order.items as Array<{ product_id: string; quantity: number }>) {
      await supabase.rpc('increment_stock', {
        product_id: item.product_id,
        quantity: item.quantity,
      })
    }
    
    revalidatePath('/admin/orders')
    
    return { data: data as Order, message: 'Order cancelled successfully' }
  } catch (error) {
    return { error: 'Failed to cancel order' }
  }
}
