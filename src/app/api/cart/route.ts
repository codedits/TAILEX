import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jwtVerify } from 'jose';

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

// Helper to get or create a cart for the user
async function getOrCreateCart(supabase: any, userId: string) {
    // Try to find existing cart
    const { data: existingCart } = await supabase
        .from('carts')
        .select('id')
        .eq('customer_id', userId)
        .single();

    if (existingCart) {
        return existingCart.id;
    }

    // Create new cart
    const { data: newCart, error } = await supabase
        .from('carts')
        .insert({ customer_id: userId })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to create cart:', error);
        throw new Error('Failed to create cart');
    }

    return newCart.id;
}

// GET: Fetch user's cart with product details
export async function GET(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createAdminClient();

        // Get user's cart
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', tokenData.userId)
            .single();

        if (!cart) {
            return NextResponse.json({ cart: [] });
        }

        // Get cart items with product details
        const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
                id,
                quantity,
                variant_id,
                product:products(id, title, slug, price, sale_price, cover_image),
                variant:product_variants(id, title, price, sale_price, color, size)
            `)
            .eq('cart_id', cart.id);

        if (error) {
            console.error('Cart Fetch Error:', error);
            return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
        }

        return NextResponse.json({ cart: cartItems || [] });
    } catch (error) {
        console.error('Cart GET Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add item to cart (upsert)
export async function POST(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { product_id, variant_id, quantity = 1 } = await request.json();

        if (!product_id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const supabase = await createAdminClient();
        const cartId = await getOrCreateCart(supabase, tokenData.userId);

        // Check if item already exists in cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cartId)
            .eq('product_id', product_id)
            .eq('variant_id', variant_id || null)
            .single();

        // Check inventory availability (enforcing usage of inventory_levels)
        if (variant_id) {
            const { data: inventory } = await supabase
                .from('inventory_levels')
                .select('available')
                .eq('variant_id', variant_id)
                .single(); // Assuming single location for now, or use .sum() logic if multiple

            // If we have multiple locations, we should sum them up. 
            // However, .single() might fail if there are multiple rows.
            // Let's use the safer accumulation approach:

            const { data: allInventory } = await supabase
                .from('inventory_levels')
                .select('available')
                .eq('variant_id', variant_id);

            const totalAvailable = allInventory?.reduce((sum, item) => sum + (item.available || 0), 0) ?? 0;

            // Check existing qty in cart to ensure total doesn't exceed stock
            const existingQty = existingItem?.quantity || 0;

            if (existingQty + quantity > totalAvailable) {
                return NextResponse.json({
                    error: `Only ${totalAvailable} items available in stock`
                }, { status: 400 });
            }
        }

        // Check if item already exists in cart
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id);

            if (error) {
                return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
            }
            return NextResponse.json({ success: true, message: 'Cart updated' });
        }

        // Insert new item
        const { error: insertError } = await supabase.from('cart_items').insert({
            cart_id: cartId,
            product_id,
            variant_id: variant_id || null,
            quantity,
        });

        if (insertError) {
            console.error('Cart Insert Error:', insertError);
            return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        console.error('Cart POST Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Remove item from cart
export async function DELETE(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('id');

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // Get user's cart first to verify ownership
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', tokenData.userId)
            .single();

        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)
            .eq('cart_id', cart.id); // Ensure user owns the item

        if (error) {
            console.error('Cart Delete Error:', error);
            return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Cart DELETE Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update item quantity
export async function PATCH(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { item_id, quantity } = await request.json();

        if (!item_id || typeof quantity !== 'number') {
            return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // Get user's cart first to verify ownership
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', tokenData.userId)
            .single();

        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', item_id)
                .eq('cart_id', cart.id);

            if (error) {
                return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
            }
            return NextResponse.json({ success: true, message: 'Item removed' });
        }

        const { error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', item_id)
            .eq('cart_id', cart.id);

        if (error) {
            console.error('Cart Update Error:', error);
            return NextResponse.json({ error: 'Failed to update quantity' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Quantity updated' });
    } catch (error) {
        console.error('Cart PATCH Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
