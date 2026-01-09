import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
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

export default async function ShopPage() {
    const supabase = await createClient();

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
    const productsPromise = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .then(res => (res.data || []) as Product[]);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar brandName={brand.name} navItems={navItems} />

            <div className="pt-32 pb-24 px-6 md:px-12">
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

                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-4">
                            All Products
                        </h1>
                        <p className="text-muted-foreground max-w-xl text-lg font-light">
                            Explore our comprehensive catalog of distinct pieces.
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                            Catalog
                        </p>
                        <p className="text-sm font-medium">
                            Fall/Winter 2025
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="hidden lg:block space-y-12 sticky top-32 self-start">
                        <div>
                            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Collections</h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="/shop"
                                        className="text-sm tracking-wide font-medium pl-2 border-l-2 border-primary transition-colors"
                                    >
                                        All Products
                                    </Link>
                                </li>
                                {allCollections.map(col => (
                                    <li key={col.id}>
                                        <Link
                                            href={`/collection/${col.slug}`}
                                            className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {col.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <Suspense fallback={
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="space-y-4 animate-pulse">
                                        <div className="w-full aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 rounded-sm" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-3/4 bg-neutral-100 dark:bg-neutral-900" />
                                            <div className="h-3 w-1/4 bg-neutral-100 dark:bg-neutral-900" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }>
                            <AsyncProductGrid productsPromise={productsPromise} />
                        </Suspense>
                    </div>
                </div>
            </div>

            <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
        </main>
    );
}
