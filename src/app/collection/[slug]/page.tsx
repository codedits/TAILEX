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
    const supabase = await createClient();

    const collectionPromise = supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single();

    const collectionsListPromise = supabase
        .from('collections')
        .select('id, title, slug')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
        .order('title');

    const configPromises = Promise.all([
        getNavigation('main-menu'),
        getBrandConfig(),
        getFooterConfig(),
        getSocialConfig()
    ]);

    const [collectionResult, collectionsListResult, [navItems, brand, footerConfig, socialConfig]] = await Promise.all([
        collectionPromise,
        collectionsListPromise,
        configPromises
    ]);

    const collection = collectionResult.data;
    if (!collection) notFound();

    const allCollections = (collectionsListResult.data || []) as Collection[];

    const productsPromise = supabase
        .from('products')
        .select('*')
        .eq('category_id', collection.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)
        .then(res => (res.data || []) as Product[]) as Promise<Product[]>;


    // Use image_url as hero
    const heroImage = collection.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070';

    return (
        <main className="min-h-screen bg-neutral-950 text-white selection:bg-white selection:text-black font-sans">
            <Navbar brandName={brand.name} navItems={navItems} />

            {/* Sticky Stacking Context - Editorial Parallax Layout */}
            <div className="relative">

                {/* Hero Section */}
                <section className="relative h-[90vh] w-full overflow-hidden sticky top-0">
                    <Image
                        src={heroImage}
                        alt={collection.title}
                        fill
                        className="object-cover transition-transform duration-[30s] ease-linear scale-105 hover:scale-110 motion-reduce:transition-none"
                        priority
                        sizes="100vw"
                        quality={95}
                    />
                    {/* Refined Gradients for legibility without killing the vibe */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

                    <div className="absolute inset-0 flex flex-col justify-end pb-32 md:pb-40 px-6 md:px-12 lg:px-24">
                        <div className="max-w-[90rem] w-full mx-auto space-y-10 animate-fade-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-t border-white/20 pt-8">
                                <div>
                                    <span className="block text-white/80 text-xs tracking-[0.4em] uppercase font-mono mb-4">
                                        Collection / 0{(allCollections.findIndex(c => c.id === collection.id) + 1) || 1}
                                    </span>
                                    <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-display font-medium text-white tracking-tighter leading-[0.85] -ml-1 md:-ml-2">
                                        {collection.title}
                                    </h1>
                                </div>

                                {collection.description && (
                                    <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed max-w-md text-pretty md:pb-2">
                                        {collection.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section - Surfaces over the sticky hero */}
                <div className="relative z-10 bg-neutral-950 min-h-screen -mt-20 pt-24 md:pt-32 shadow-[0_-25px_50px_rgba(0,0,0,0.9)] rounded-t-[2.5rem] md:rounded-t-[4rem]">

                    {/* Layout Grid */}
                    <div className="px-6 md:px-12 lg:px-24 max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16 lg:gap-32">

                        {/* Sidebar Navigation - Sticky & Minimal */}
                        <aside className="hidden lg:block space-y-16 sticky top-40 self-start h-fit animate-fade-in opacity-0" style={{ animationDelay: "500ms" }}>
                            <div className="space-y-8">
                                <Link href="/collection" className="inline-flex items-center gap-3 text-white/50 hover:text-white transition-colors group">
                                    <span className="w-8 h-px bg-white/30 group-hover:bg-white transition-colors" />
                                    <span className="text-xs uppercase tracking-widest">Back to All</span>
                                </Link>

                                <div className="pt-8">
                                    <h3 className="font-display text-2xl font-medium text-white mb-6">Explore</h3>
                                    <nav>
                                        <ul className="space-y-3">
                                            {allCollections.map(col => {
                                                const isActive = col.slug === slug;
                                                return (
                                                    <li key={col.id}>
                                                        <Link
                                                            href={`/collection/${col.slug}`}
                                                            className={`group flex items-center justify-between text-base tracking-wide transition-all duration-300 py-2 ${isActive
                                                                ? "text-white translate-x-2"
                                                                : "text-neutral-500 hover:text-white hover:translate-x-2"
                                                                }`}
                                                        >
                                                            <span>{col.title}</span>
                                                            <span className={`h-1.5 w-1.5 rounded-full bg-white transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="space-y-16">
                            {/* Controls / Beadcrumbs (Mobile Only or Secondary) */}
                            <div className="lg:hidden pb-8 border-b border-white/5">
                                <Breadcrumb>
                                    <BreadcrumbList className="text-white/40 text-xs uppercase tracking-widest">
                                        <BreadcrumbItem><BreadcrumbLink href="/" className="hover:text-white">Home</BreadcrumbLink></BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem><BreadcrumbPage className="text-white">{collection.title}</BreadcrumbPage></BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>

                            <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-12 animate-fade-in opacity-0" style={{ animationDelay: "600ms" }}>
                                <span className="text-white/40 text-xs uppercase tracking-widest font-mono">
                                    Catalog
                                </span>
                                <span className="text-white/40 text-xs uppercase tracking-widest font-mono">
                                    Showing Results
                                </span>
                            </div>

                            {/* Products */}
                            <div className="min-h-[50vh] animate-fade-up opacity-0 transform-gpu" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
                                <Suspense fallback={<GridSkeleton />}>
                                    <AsyncProductGrid productsPromise={productsPromise} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
        </main>
    );
}

// Elegant minimal skeleton
function GridSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-6">
                    <div className="w-full aspect-[3/4] bg-neutral-900/50 grayscale opacity-50 animate-pulse" />
                    <div className="space-y-3">
                        <div className="h-2 w-12 bg-neutral-900 rounded-full" />
                        <div className="h-4 w-32 bg-neutral-900 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
