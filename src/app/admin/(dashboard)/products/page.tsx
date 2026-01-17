import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/admin/ui/TableSkeleton";
import { ProductTableClient } from "@/components/admin/products/ProductTableClient";

async function ProductsTable() {
  const supabase = await createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return <ProductTableClient products={products || []} />;
}

export default function ProductsPage() {
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-1">
            Catalog
          </h2>
          <p className="text-white/50 text-sm">
            Manage your store&apos;s private inventory.
          </p>
        </div>
        <Button
          asChild
          className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium"
        >
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <ProductsTable />
      </Suspense>
    </div>
  );
}

