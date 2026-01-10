import OrderList from '@/components/account/OrderList';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const user = await requireAuth();

    // Fetch orders by email (since we don't set customer_id in new auth flow)
    const supabase = await createAdminClient();
    const { data: orders } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-light text-black mb-2">Order History</h2>
                <p className="text-neutral-500 text-sm">Track your shipments and view past purchases.</p>
            </div>

            <OrderList initialOrders={orders || []} />
        </div>
    );
}

