import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jwtVerify } from 'jose';
import { EmailService } from '@/services/email';
import { StoreConfigService } from '@/services/config';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// Helper to get user from JWT cookie
async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string; email: string };
    } catch {
        return null;
    }
}

// Helper to generate order number
function generateOrderNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

export async function POST(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            items,
            shipping_address,
            payment_method,
            payment_proof, // { transaction_id, screenshot_url } for COD
            user_name,
            phone,
            address,
        } = body;

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
        }

        if (!shipping_address || !shipping_address.address1 || !shipping_address.city) {
            return NextResponse.json({ error: 'Valid shipping address is required' }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // Stock Validation
        const productIds = items.map((item: any) => item.product_id);
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, title, stock, price, sale_price, cover_image') // ADDED cover_image
            .in('id', productIds);

        if (productsError || !products) {
            return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 });
        }

        const productMap = new Map(products.map((p) => [p.id, p]));
        const stockErrors: string[] = [];
        let subtotal = 0;

        for (const item of items) {
            const product = productMap.get(item.product_id);
            if (!product) {
                stockErrors.push(`Product ${item.product_id} not found`);
                continue;
            }
            if (product.stock < item.quantity) {
                stockErrors.push(`Insufficient stock for "${product.title}" (available: ${product.stock})`);
            }
            const price = product.sale_price || product.price;
            subtotal += price * item.quantity;
        }

        if (stockErrors.length > 0) {
            return NextResponse.json(
                { error: 'Stock validation failed', details: stockErrors },
                { status: 400 }
            );
        }

        // COD Verification
        if (payment_method === 'COD' && !payment_proof?.screenshot_url) {
            return NextResponse.json(
                { error: 'Payment proof is required for Cash on Delivery' },
                { status: 400 }
            );
        }

        const config = await StoreConfigService.getStoreConfig();
        const currencyCode = config.currency?.code || 'PKR';

        // Create Order
        // NOTE: customer_id is set to null because the existing schema has a FK to `customers` table.
        // Our new auth system uses the `users` table. Email is still tracked for order lookup.
        const orderNumber = generateOrderNumber();
        const orderData = {
            order_number: orderNumber,
            customer_id: null, // Avoid FK constraint with legacy `customers` table
            email: tokenData.email,
            phone: phone || null,
            status: 'pending',
            payment_status: payment_method === 'COD' ? 'proof_submitted' : 'paid', // Default to paid for card, proof for COD
            fulfillment_status: 'unfulfilled',
            currency: currencyCode,
            subtotal,
            discount_total: 0,
            shipping_total: 250, // Fixed shipping for now to match CheckoutWizard
            tax_total: 0,
            total: subtotal + 250,
            shipping_address,
            billing_address: shipping_address,
            payment_method,
            payment_proof: payment_proof || null,
            source: 'web',
        };

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError || !order) {
            console.error('Order Creation Error:', orderError);
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        // Create Order Items
        const orderItems = items.map((item: any) => {
            const product = productMap.get(item.product_id)!;
            const price = product.sale_price || product.price;
            return {
                order_id: order.id,
                product_id: item.product_id,
                variant_id: item.variant_id || null,
                title: product.title,
                sku: null,
                image_url: product.cover_image, // FIXED
                quantity: item.quantity,
                unit_price: price,
                discount_amount: 0,
                total_price: price * item.quantity,
                fulfilled_quantity: 0,
                requires_shipping: true,
            };
        });

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) {
            console.error('Order Items Error:', itemsError);
            // Consider rolling back the order here in production
        }

        // Atomic Stock Decrement
        for (const item of items) {
            try {
                const { error: rpcError } = await supabase.rpc('decrement_stock', {
                    p_id: item.product_id,
                    qty: item.quantity,
                });

                if (rpcError) {
                    // Fallback to manual update
                    await supabase
                        .from('products')
                        .update({ stock: productMap.get(item.product_id)!.stock - item.quantity })
                        .eq('id', item.product_id);
                }
            } catch (e) {
                console.error('Stock Decrement Error:', e);
            }
        }

        // Clear User Cart
        await supabase.from('user_cart').delete().eq('user_id', tokenData.userId);

        // Update User Profile (non-blocking) - Use Structured Address
        if (user_name || phone || shipping_address) {
            supabase
                .from('users')
                .update({
                    name: user_name,
                    phone: phone || shipping_address.phone, // fallback to shipping phone
                    address: shipping_address, // Save the full shipping address object
                    updated_at: new Date().toISOString(),
                })
                .eq('id', tokenData.userId)
                .then(() => { });
        }

        // Send Confirmation Email
        try {
            const emailOrder = {
                id: order.id,
                order_number: order.order_number,
                subtotal: order.subtotal,
                shipping_total: order.shipping_total,
                discount_total: order.discount_total,
                tax_total: order.tax_total,
                total: order.total,
                items: orderItems.map((i: any) => ({
                    title: i.title,
                    variant_title: null,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                })),
            };
            await EmailService.sendOrderConfirmation(tokenData.email, emailOrder as any);
        } catch (emailError) {
            console.error('Email Send Error:', emailError);
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.order_number,
        });
    } catch (error) {
        console.error('Orders POST Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET: Fetch user's orders
export async function GET(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createAdminClient();
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
        id,
        order_number,
        status,
        payment_status,
        fulfillment_status,
        total,
        created_at,
        items:order_items(id, title, quantity, unit_price, image_url)
      `)
            .eq('customer_id', tokenData.userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Orders Fetch Error:', error);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        return NextResponse.json({ orders: orders || [] });
    } catch (error) {
        console.error('Orders GET Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
