import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "../product-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const supabase = await createAdminClient();
  const { data: collections } = await supabase.from('collections').select('*').order('title');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/50" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">New Product</h2>
          <p className="text-white/50 text-sm">Add a new product to your catalog</p>
        </div>
      </div>
      <ProductForm collections={collections || []} />
    </div>
  );
}
