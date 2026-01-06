import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CollectionBrowser from "@/components/CollectionBrowser";
import { createClient } from "@/lib/supabase/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { type Product, type Collection } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60; // ISR

export const metadata = {
  title: 'Shop All Collections | TAILEX',
  description: 'Explore our complete range of premium fashion collections. Quality craftsmanship meets contemporary design.',
};

export default async function CollectionPage() {
  const supabase = await createClient();
  
  // Fetch all active Products (optimized columns)
  const { data: products } = await supabase
    .from('products')
    .select('id, category_id, title, slug, price, sale_price, cover_image, images')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  // Fetch Visible Collections with product count
  const { data: collections } = await supabase
    .from('collections')
    .select('id, title, slug, image_url, description')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });

  const safeProducts = (products || []) as Product[];
  const safeCollections = (collections || []) as Collection[];

  // Calculate product count per collection
  const collectionsWithCounts = safeCollections.map(col => ({
    ...col,
    product_count: safeProducts.filter(p => p.category_id === col.id).length
  }));

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 md:px-12">
        {/* Breadcrumbs */}
        <div className="mb-12">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shop All</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-4">
            The Collection
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg font-light">
            Timeless pieces designed for the modern wardrobe. Quality craftsmanship meets contemporary silhouette.
          </p>
        </div>

        {/* Collections Grid - High-end store style */}
        {safeCollections.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-8">
              Browse by Collection
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {collectionsWithCounts.map((collection) => (
                <Link 
                  key={collection.id} 
                  href={`/collection/${collection.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden bg-muted"
                >
                  {collection.image_url ? (
                    <Image
                      src={collection.image_url}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-white font-medium text-lg md:text-xl">{collection.title}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {collection.product_count} {collection.product_count === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="h-px bg-border mb-12" />

        {/* All Products */}
        <div className="mb-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            All Products ({safeProducts.length})
          </h2>
        </div>

        <CollectionBrowser products={safeProducts} collections={safeCollections} />
      </div>

      <Footer />
    </main>
  );
}
