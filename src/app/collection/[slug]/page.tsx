import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
import MobileCollectionList from "@/components/shop/MobileCollectionList";
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

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white font-sans overflow-visible">
            <Navbar brandName={brand.name} navItems={navItems} />

            <div className="pt-32 pb-24 px-6 md:px-12">
                {/* Breadcrumbs */}
                <div className="mb-8 hidden md:block">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{collection.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 fade-in-up">
                    <div className="w-full md:w-2/3">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 block">
                            Collection / 0{(allCollections.findIndex(c => c.id === collection.id) + 1) || 1}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight mb-6 text-foreground">
                            {collection.title}
                        </h1>
                        {collection.description && (
                            <p className="text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
                                {collection.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Collections Menu (Visible on all screens) */}
                <div className="mb-12">
                    <MobileCollectionList collections={allCollections} />
                </div>

                {/* Product Grid - Full Width */}
                <div className="min-h-[50vh]">
                    <Suspense fallback={
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="space-y-4 animate-pulse">
                                    <div className="w-full aspect-[3/4] bg-neutral-100 dark:bg-neutral-800" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800" />
                                        <div className="h-3 w-1/4 bg-neutral-100 dark:bg-neutral-800" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }>
                        <AsyncProductGrid productsPromise={productsPromise} />
                    </Suspense>
                </div>
            </div>

            <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
        </main>
    );
}
