import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";

import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
import MobileCollectionList from "@/components/shop/MobileCollectionList";
import { Product, Collection } from "@/lib/types";
import { notFound } from "next/navigation";
import { StoreConfigService } from "@/services/config";
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

    const [collectionResult, collectionsListResult, config] = await Promise.all([
        collectionPromise,
        collectionsListPromise,
        StoreConfigService.getStoreConfig()
    ]);

    const collection = collectionResult.data;
    if (!collection) notFound();

    const allCollections = (collectionsListResult.data || []) as Collection[];

    const brand = config.brand;
    const footerConfig = config.footer;
    const socialConfig = config.social;
    const navItems = config.navigation.main;

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
                                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{collection.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
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


        </main>
    );
}
