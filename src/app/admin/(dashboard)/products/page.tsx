import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Products
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your store&apos;s inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">View Shop</span>
          </Link>
          <Button
            asChild
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 font-medium"
          >
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <ProductsTable />
      </Suspense>
    </div>
  );
}


