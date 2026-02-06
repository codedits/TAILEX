import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
import MobileCollectionList from "@/components/shop/MobileCollectionList";
import { Product, Collection } from "@/lib/types";
import { StoreConfigService } from "@/services/config";
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

    const collectionsListPromise = supabase
        .from('collections')
        .select('id, title, slug')
        .eq('is_visible', true)
        .order('title');

    // Fetch config and collections list
    const [config, collectionsListResult] = await Promise.all([
        StoreConfigService.getStoreConfig(),
        collectionsListPromise
    ]);

    const brand = config.brand;
    const footerConfig = config.footer;
    const socialConfig = config.social;
    const navItems = config.navigation.main;

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

            <div className="pt-4 pb-24 px-6 md:px-12">
                {/* Breadcrumbs */}
                <div className="flex justify-start mb-8">
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

                {/* Collections Menu (Visible on all screens now) */}
                <div className="mb-12 text-center">
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
