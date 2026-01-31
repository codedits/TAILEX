import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
import MobileCollectionList from "@/components/shop/MobileCollectionList";
import { Product, Collection } from "@/lib/types";
import { getNavigation, getBrandConfig, getFooterConfig, getSocialConfig } from "@/lib/theme";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const revalidate = 60;

export const metadata = {
    title: "Shop All | TAILEX",
    description: "Browse our complete collection of premium fashion items.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const supabase = await createClient();
    const { q } = await searchParams;

    // Parallel Fetching
    const configPromises = Promise.all([
        getNavigation('main-menu'),
        getBrandConfig(),
        getFooterConfig(),
        getSocialConfig()
    ]);

    const collectionsListPromise = supabase
        .from('collections')
        .select('id, title, slug')
        .eq('is_visible', true)
        .order('title');

    // Fetch critical shell data
    const [[navItems, brand, footerConfig, socialConfig], collectionsListResult] = await Promise.all([
        configPromises,
        collectionsListPromise
    ]);

    const allCollections = (collectionsListResult.data || []) as Collection[];

    // Fetch All Products (Streamed)
    let productsQuery = supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

    if (q) {
        const trimmedQ = q.trim();
        productsQuery = productsQuery.or(`title.ilike.%${trimmedQ}%,description.ilike.%${trimmedQ}%,product_type.ilike.%${trimmedQ}%`);
    }

    const productsPromise = productsQuery
        .order('created_at', { ascending: false })
        .limit(20)
        .then(res => (res.data || []) as Product[]);


    return (
        <main className="min-h-screen bg-background text-foreground overflow-visible">
            <Navbar brandName={brand.name} navItems={navItems} />

            <div className="pt-14 pb-24 px-6 md:px-12">
                {/* Breadcrumbs */}
                <div className="mb-8">
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

                <div className="flex flex-col md:flex-row justify-between items-end mb-16 fade-in-up">
                    <div className="w-full md:w-2/3">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 block">
                            {q ? 'Search Results' : 'Fall / Winter 2025'}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight mb-6 text-foreground">
                            {q ? `"${q}"` : 'Shop All'}
                        </h1>
                        <p className="text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
                            {q
                                ? `Showing results for your search.`
                                : 'Discover our complete collection of thoughtfully designed pieces, crafted for the modern individual.'}
                        </p>


                    </div>
                </div>

                {/* Collections Menu (Visible on all screens now) */}
                <div className="mb-12">
                    <MobileCollectionList collections={allCollections} />
                </div>

                {/* Product Grid - Full Width */}
                <div className="min-h-[50vh]">
                    <Suspense fallback={
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
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
