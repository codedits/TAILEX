import { OrderService } from '@/services/orders';
import OrderList from '@/components/account/OrderList';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const orders = await OrderService.getCustomerOrders(user.id);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-light text-white mb-2">Order History</h2>
                <p className="text-white/40 text-sm">Track your shipments and view past purchases.</p>
            </div>

            <OrderList initialOrders={orders} />
        </div>
    );
}
