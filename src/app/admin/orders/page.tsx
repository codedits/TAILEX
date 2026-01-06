import { createAdminClient } from "@/lib/supabase/admin";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function OrdersPage() {
  const supabase = await createAdminClient();
  const { data: orders } = await supabase.from("orders").select("*").order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-white/50 border-white/10';
    }
  };

  return (
    <div className="space-y-8">
      <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Orders</h2>
          <p className="text-white/50 text-sm">Manage transactions and fulfillment.</p>
      </div>

      <div className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 font-medium px-6 py-4">Order #</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Date</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Customer</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Total</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Status</TableHead>
              <TableHead className="text-right px-6 py-4 text-white/40 font-medium">Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-6 py-4 font-mono text-white text-sm">#{order.order_number}</TableCell>
                  <TableCell className="px-4 text-white/50 text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 text-white/90 text-sm">
                    {order.customer_id ? "Authenticated User" : "Guest Checkout"}
                  </TableCell>
                  <TableCell className="px-4 font-mono text-white">${order.total_price}</TableCell>
                  <TableCell className="px-4">
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <Badge variant="outline" className={getStatusColor(order.payment_status)}>
                        {order.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-white/20 text-sm italic">No orders recorded yet.</span>
                        <div className="text-[10px] text-white/10 uppercase tracking-widest">Awaiting first sale</div>
                    </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
