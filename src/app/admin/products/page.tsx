import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/ui/data-table";
import { columns } from "@/components/admin/products/columns";

export default async function ProductsPage() {
  const supabase = await createAdminClient();
  const { data: products } = await supabase.from("products").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white mb-1">Catalog</h2>
          <p className="text-white/50 text-sm">Manage your store's private inventory.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products || []}
        filterColumn="title"
        filterPlaceholder="Filter products..."
      />
    </div>
  );
}
