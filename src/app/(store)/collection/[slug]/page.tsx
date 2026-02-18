import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";

import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
import ProductFilters from "@/components/collection/ProductFilters";
import MobileCollectionList from "@/components/shop/MobileCollectionList";
import { Product, Collection } from "@/lib/types";
import { notFound } from "next/navigation";
import { StoreConfigService } from "@/services/config";
import * as collectionsApi from "@/lib/api/collections";
import { ProductService } from "@/services/products";
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

export const revalidate = 3600; // ISR: 1 hour — collections change less frequently

// Pre-build all visible collection pages at deploy time
// Pre-build all visible collection pages at deploy time
export async function generateStaticParams() {
    const { data } = await collectionsApi.getCollections({ visible: true });
    return (data || []).map((c) => ({ slug: c.slug }));
}

export const dynamicParams = true;

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// High-end store: Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
    const { slug } = await params;

    const { data: collection } = await collectionsApi.getCollection(slug);

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
    const resolvedSearchParams = await searchParams;

    const sizeFilter = typeof resolvedSearchParams.size === 'string' ? resolvedSearchParams.size.split(',') : undefined;
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';

    let orderBy: 'created_at' | 'price' | 'title' = 'created_at';
    let order: 'asc' | 'desc' = 'desc';

    if (sort === 'price-asc') {
        orderBy = 'price';
        order = 'asc';
    } else if (sort === 'price-desc') {
        orderBy = 'price';
        order = 'desc';
    }

    const [collectionResult, collectionsListResult, config] = await Promise.all([
        collectionsApi.getCollection(slug),
        collectionsApi.getCollections({ visible: true }),
        StoreConfigService.getStoreConfig()
    ]);

    const collection = collectionResult.data;
    if (!collection) notFound();

    const allCollections = (collectionsListResult.data || []) as Collection[];

    const brand = config.brand;
    const footerConfig = config.footer;
    const socialConfig = config.social;
    const navItems = config.navigation.main;

    const productsPromise = ProductService.getProducts({
        categoryId: collection.id,
        status: 'active',
        orderBy,
        order,
        limit: 40,
        sizes: sizeFilter
    }).then(res => res.data);

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
                <div className="mb-8">
                    <MobileCollectionList collections={allCollections} />
                </div>

                {/* Filters */}
                <ProductFilters />

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
