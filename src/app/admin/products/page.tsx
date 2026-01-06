import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct } from "./actions";
import { DeleteButton } from "@/components/DeleteButton";

export default async function ProductsPage() {
  const supabase = await createAdminClient();
  const { data: products } = await supabase.from("products").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Catalog</h2>
            <p className="text-white/50 text-sm">Manage your store's private inventory.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 font-medium px-6 py-4">Product</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Price</TableHead>
              <TableHead className="text-white/40 font-medium px-4 text-center">Stock</TableHead>
              <TableHead className="text-white/40 font-medium px-4 text-center">Status</TableHead>
              <TableHead className="text-white/40 font-medium px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        {product.cover_image ? (
                            <img src={product.cover_image} alt={product.title} className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                        ) : (
                            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                              <span className="text-white/20 text-xs">No img</span>
                            </div>
                        )}
                        <div>
                          <span className="font-medium text-white block">{product.title}</span>
                          <span className="text-white/40 text-xs">{product.sku || product.slug}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 font-mono text-white">
                    <div className="flex flex-col">
                      <span>${product.price?.toFixed(2)}</span>
                      {product.sale_price && (
                        <span className="text-emerald-400 text-xs">${product.sale_price?.toFixed(2)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <span className={`font-mono ${
                      (product.stock ?? 0) === 0 ? 'text-red-400' : 
                      (product.stock ?? 0) < 10 ? 'text-yellow-400' : 
                      'text-white/60'
                    }`}>
                      {product.stock ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 
                      product.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' : 
                      product.status === 'archived' ? 'bg-red-500/10 text-red-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                        {product.status || 'draft'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-white/5 hover:text-white rounded-lg">
                            <Link href={`/admin/products/${product.id}`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <DeleteButton 
                          id={product.id} 
                          onDelete={deleteProduct} 
                          itemName={product.title}
                        />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-white/30 text-sm">
                  Your inventory is empty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
