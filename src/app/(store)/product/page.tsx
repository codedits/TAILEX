import Navbar from "@/components/layout/Navbar";

import ProductFeed from "@/components/product/ProductFeed";
import { createClient } from "@/lib/supabase/server";
import { type Product } from "@/lib/types";
import { getNavigation, getBrandConfig, getFooterConfig, getSocialConfig } from "@/lib/theme";

export const revalidate = 300; // 5 minutes - aggressive cache

export default async function ProductPage() {
  const supabase = await createClient();
  const [navItems, brand, footerConfig, socialConfig, productsResult] = await Promise.all([
    getNavigation('main-menu'),
    getBrandConfig(),
    getFooterConfig(),
    getSocialConfig(),
    supabase
      .from('products')
      .select('id, title, slug, price, sale_price, cover_image, images, category_id, tags, product_type')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
  ]);

  const allProducts = (productsResult.data || []) as Product[];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar brandName={brand.name} navItems={navItems} />

      {/* Hero Banner */}
      <section className="pt-24 pb-16 px-6 md:px-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="section-title text-foreground mb-4">All Products</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Explore our complete collection of premium fashion essentials.
            {allProducts.length === 0 && <span className="block mt-2 text-amber-500 text-sm">(Database empty: Add products in Admin Panel)</span>}
          </p>
        </div>
      </section>

      <ProductFeed initialProducts={allProducts} />


    </main>
  );
}
