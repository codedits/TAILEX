import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
import { Product, Collection } from "@/lib/types";
import { notFound } from "next/navigation";
import { getNavigation, getBrandConfig, getFooterConfig, getSocialConfig } from "@/lib/theme";
import Image from "next/image";
import Link from "next/link";
import Loading from "./loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

export default async function CollectionDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams; // Await searchParams for dynamic handling
  const supabase = await createClient();

  // 1. Parallel Fetching: Start all critical data fetches simultaneously
  // We don't await products here to allow streaming, but we await the promise in the grid component?
  // Actually, to use Suspense effectively for the grid specifically, we should pass the PROMISE to the grid,
  // or let the Grid fetch. But Grid props need to be serializable.
  // The best pattern with Promise.all for Page Data + Streaming Grid is:
  // Await Page Data (Meta, Hero).
  // Start Grid Data fetch.

  const collectionPromise = supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  const collectionsListPromise = supabase
    .from('collections')
    .select('id, title, slug')
    .eq('is_visible', true)
    .order('title');

  const configPromises = Promise.all([
    getNavigation('main-menu'),
    getBrandConfig(),
    getFooterConfig(),
    getSocialConfig()
  ]);

  // Await critical shell data
  const [collectionResult, collectionsListResult, [navItems, brand, footerConfig, socialConfig]] = await Promise.all([
    collectionPromise,
    collectionsListPromise,
    configPromises
  ]);

  const collection = collectionResult.data;
  if (!collection) notFound();

  const allCollections = (collectionsListResult.data || []) as Collection[];

  // 2. Fetch Products (Dynamic/Streamed Data) based on current collection
  // We pass this promise to the AsyncProductGrid
  const productsPromise = supabase
    .from('products')
    .select('*')
    .eq('category_id', collection.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .then(res => (res.data || []) as Product[]) as Promise<Product[]>;

  // Hero image with fallback
  const heroImage = collection.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070';
  const productCount = "approx"; // We could count, but for speed we skip count query if not needed critically

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar brandName={brand.name} navItems={navItems} />

      {/* Sticky Stacking Context Provider (Implicit via CSS) */}
      <div className="relative">

        {/* Collection Hero - Sticky Parallax Header */}
        <section className="relative h-[60vh] w-full overflow-hidden sticky top-0 -z-10">
          <Image
            src={heroImage}
            alt={collection.title}
            fill
            className="object-cover opacity-80"
            priority // LCP Optimization
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
            <div className="max-w-4xl animate-in fade-in-50 slide-in-from-bottom-5 duration-700">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-white tracking-tighter mb-6">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="text-white/80 text-lg md:text-xl max-w-xl font-light leading-relaxed mb-8">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Section - Slides over the sticky hero */}
        <div className="relative z-10 bg-background min-h-screen border-t border-white/10 rounded-t-[3rem] -mt-12 pt-12 shadow-2xl">

          {/* Breadcrumbs */}
          <div className="px-6 md:px-12 mb-12">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-white/40 hover:text-white">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/20" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/collection" className="text-white/40 hover:text-white">Collections</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/20" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">{collection.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="px-6 md:px-12 pb-24 grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* Sidebar (Server Component) - Navigation based filtering (High Perf) */}
            <aside className="hidden lg:block space-y-12 sticky top-32 self-start">
              <div>
                <h3 className="font-display text-xs uppercase tracking-[0.2em] text-white/40 mb-6">Collections</h3>
                <ul className="space-y-4">
                  {allCollections.map(col => (
                    <li key={col.id}>
                      <Link
                        href={`/collection/${col.slug}`}
                        className={`text-sm tracking-wide transition-colors ${col.slug === slug
                          ? "text-white font-medium pl-2 border-l-2 border-white"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        {col.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Product Grid Area - Streaming */}
            <div className="lg:col-span-3">
              <Suspense fallback={<GridSkeleton />}>
                <AsyncProductGrid productsPromise={productsPromise} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
    </main>
  );
}

// Inline Skeleton for granular Loading state of just the grid (if page loads faster than products)
function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-4 animate-pulse">
          <div className="w-full aspect-[3/4] bg-neutral-900 rounded-sm" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-neutral-900" />
            <div className="h-3 w-1/4 bg-neutral-900" />
          </div>
        </div>
      ))}
    </div>
  );
}
