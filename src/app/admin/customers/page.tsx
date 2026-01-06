import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Users, Mail, ShoppingBag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CustomersPage() {
  const supabase = await createAdminClient();
  const { data: customers } = await supabase.from("customers").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Customers</h2>
            <p className="text-white/50 text-sm">View and manage your customer base.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white/50" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Total Customers</p>
              <p className="text-2xl font-semibold text-white">{customers?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 font-medium px-6 py-4">Customer</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Email</TableHead>
              <TableHead className="text-white/40 font-medium px-4 text-center">Orders</TableHead>
              <TableHead className="text-white/40 font-medium px-4 text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-white/50 uppercase font-medium">
                          {customer.first_name?.[0] || customer.email?.[0] || '?'}
                        </div>
                        <span className="font-medium text-white">
                          {customer.first_name && customer.last_name 
                            ? `${customer.first_name} ${customer.last_name}` 
                            : customer.email}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-white/70 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/30" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/70">
                      {customer.total_orders || 0}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 text-right font-mono text-white">
                    ${(customer.total_spent || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-white/30 text-sm">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
