import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollectionBrowser from "@/components/collection/CollectionBrowser";
import { Product, Collection } from "@/lib/types";
import { notFound } from "next/navigation";
import { getNavigation, getBrandConfig, getFooterConfig, getSocialConfig } from "@/lib/theme";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Props = {
  params: Promise<{ slug: string }>;
};

// High-end store: Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: collection } = await supabase
    .from('collections')
    .select('title, seo_title, seo_description, description')
    .eq('slug', slug)
    .single();
  
  if (!collection) {
    return { title: 'Collection Not Found' };
  }
  
  return {
    title: collection.seo_title || `${collection.title} Collection | TAILEX`,
    description: collection.seo_description || collection.description || `Shop our ${collection.title} collection`,
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the collection details
  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!collection) {
    notFound();
  }

  // Fetch products in this collection by category_id
  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', collection.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Also fetch all collections for the filter sidebar
  const { data: allCollections } = await supabase
    .from('collections')
    .select('*')
    .eq('is_visible', true)
    .order('title');

  const products = (productsData || []) as Product[];
  const collections = (allCollections || []) as Collection[];
  const productCount = products.length;

  // Hero image for collection (like high-end stores)
  const heroImage = collection.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070';

  // Fetch all config in parallel
  const [navItems, brand, footerConfig, socialConfig] = await Promise.all([
    getNavigation('main-menu'),
    getBrandConfig(),
    getFooterConfig(),
    getSocialConfig()
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar brandName={brand.name} navItems={navItems} />
      
      {/* Collection Hero - Like Loro Piana, Zegna style */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src={heroImage}
          alt={collection.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium text-white tracking-tight mb-4">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-white/80 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                {collection.description}
              </p>
            )}
            <p className="text-white/60 text-sm mt-6 uppercase tracking-widest">
              {productCount} {productCount === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="px-6 md:px-12 pt-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/collection">Collections</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{collection.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Products with filters */}
      <section className="px-6 md:px-12 py-12 pb-20">
        {products.length > 0 ? (
          <CollectionBrowser 
            products={products} 
            collections={collections}
            initialCollectionId={collection.id}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body text-lg">No products found in this collection yet.</p>
            <p className="text-muted-foreground/60 text-sm mt-2">Check back soon for new arrivals.</p>
          </div>
        )}
      </section>

      <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
    </main>
  );
}
