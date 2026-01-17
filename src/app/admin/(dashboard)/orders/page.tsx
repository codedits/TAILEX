import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { TableSkeleton } from '@/components/admin/ui/TableSkeleton';
import { OrderTableClient } from '@/components/admin/orders/OrderTableClient';

async function OrdersTable() {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return <OrderTableClient orders={data || []} />;
}

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">Orders</h2>
          <p className="text-white/40 mt-1 text-sm">Manage and track customer orders.</p>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <OrdersTable />
      </Suspense>
    </div>
  );
}
