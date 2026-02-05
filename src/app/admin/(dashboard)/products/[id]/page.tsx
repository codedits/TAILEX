import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "../product-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createAdminClient();

  // Fetch product and collections in parallel
  const [productResult, collectionsResult] = await Promise.all([
    supabase.from('products').select('*').eq('id', resolvedParams.id).single(),
    supabase.from('collections').select('*').order('title')
  ]);

  const product = productResult.data;
  const collections = collectionsResult.data || [];

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
        <Link href="/admin/products" className="text-gray-700 hover:text-gray-900 underline">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Edit Product</h2>
          <p className="text-gray-500 text-sm">Update details for {product.title}</p>
        </div>
      </div>
      <ProductForm initialData={product} collections={collections} />
    </div>
  );
}
