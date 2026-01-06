import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductFeed from "@/components/ProductFeed";
import { createClient } from "@/lib/supabase/server";
import { type Product } from "@/lib/types";

export const revalidate = 60; // ISR

export default async function ProductPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, title, slug, price, sale_price, cover_image, images, category_id, tags')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Fallback for demo if no DB connection or empty, but in prod we want real data.
  // We'll pass empty array if null.
  const allProducts = (products || []) as Product[];

  // Fetch Site Config for Hero text if we wanted dynamic page headers
  // const { data: pageConfig } = ...

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="section-title text-foreground mb-4">All Products</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Explore our complete collection of premium menswear essentials.
            {allProducts.length === 0 && <span className="block mt-2 text-amber-500 text-sm">(Database empty: Add products in Admin Panel)</span>}
          </p>
        </div>
      </section>

      <ProductFeed initialProducts={allProducts} />

      <Footer />
    </main>
  );
}
