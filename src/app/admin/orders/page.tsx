import { DataTable } from '@/components/admin/ui/data-table';
import { columns } from '@/components/admin/orders/columns';
import { createAdminClient } from '@/lib/supabase/admin';

async function getOrders() {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Orders</h2>
          <p className="text-white/40 mt-1">Manage and track customer orders here.</p>
        </div>
      </div>

      <DataTable columns={columns} data={orders as any} filterColumn="email" filterPlaceholder="Filter by email..." />
    </div>
  );
}
