import { Suspense } from "react";
import { HomeData } from "@/lib/home-data";
import HeroSection from "@/components/sections/HeroSection";
import dynamic from "next/dynamic";
import { HomeCollectionsLoader, FirstCollectionLoader } from "@/components/home/HomeCollectionsLoader";
import { HomeProductsLoader } from "@/components/home/HomeProductsLoader";

// Sections that can be lazy-loaded to reduce TBT
const TrustBar = dynamic(() => import("@/components/sections/TrustBar").then(mod => mod.TrustBar));
const Featuring = dynamic(() => import("@/components/sections/Featuring"));

import { HOMEPAGE_TEXT } from "@/config/homepage-text";

// Skeletons
import { CollectionShowcaseSkeleton } from "@/components/skeletons/CollectionShowcaseSkeleton";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";


interface HomeLayoutProps {
    data: HomeData;
}

/**
 * HomeLayout - Server Component
 * 
 * Optimized homepage rendering strategy:
 * - HeroSection: SSR immediate, ONLY priority image
 * - First Collection: Suspense streamed, NO priority
 * - Products: Suspense streamed
 * - Remaining Collections: Suspense streamed
 * - Footer: Suspense streamed LAST
 * 
 * All sections use CSS animations, zero blocking JS before FCP.
 */
export default function HomeLayout({ data }: HomeLayoutProps) {
    const { layout, hero, brand, footer, social } = data;

    // Render sections based on order
    const sortedSections = [...layout].sort((a, b) => a.order - b.order);

    // Find specific sections to control specific layout grouping
    const heroSection = sortedSections.find(s => s.type === 'hero');
    const categoriesSection = sortedSections.find(s => s.type === 'categories');
    const productSection = sortedSections.find(s => s.type === 'featured-products');

    return (
        <div className="text-foreground min-h-screen">

            {/* ============================================ */}
            {/* CRITICAL ABOVE-FOLD: Hero Section (SSR)     */}
            {/* ONLY priority image on entire page          */}
            {/* ============================================ */}
            <div className="relative flex flex-col items-center justify-center w-full overflow-hidden">
                {heroSection?.enabled && (
                    <HeroSection
                        heading={heroSection.content?.heading || hero.heading || brand.name}
                        subheading={heroSection.content?.subheading || hero.subheading}
                        image={heroSection.content?.image || hero.image}
                        mobileImage={heroSection.content?.mobileImage || hero.mobileImage}
                        brandName={brand.name}
                        overlayOpacity={heroSection.content?.overlayOpacity ?? hero.overlayOpacity}
                        slides={hero.slides}
                        autoPlayInterval={hero.autoPlayInterval}
                    />
                )}

                <TrustBar />

                {/* ============================================ */}
                {/* FIRST COLLECTION: Streamed via Suspense     */}
                {/* NO priority image                            */}
                {/* ============================================ */}
                {categoriesSection?.enabled && (
                    <Suspense fallback={<CollectionShowcaseSkeleton />}>
                        <FirstCollectionLoader collectionsPromise={data.collectionsPromise} />
                    </Suspense>
                )}
            </div>

            {/* ============================================ */}
            {/* REMAINING COLLECTIONS: Streamed via Suspense */}
            {/* ============================================ */}
            {categoriesSection?.enabled && (
                <Suspense fallback={<CollectionShowcaseSkeleton />}>
                    <HomeCollectionsLoader
                        collectionsPromise={data.collectionsPromise}
                        startIndex={1}
                    />
                </Suspense>
            )}

            {/* ============================================ */}
            {/* FEATURED PRODUCTS: Streamed via Suspense    */}
            {/* ============================================ */}
            {productSection?.enabled && (
                <Suspense fallback={<ProductGridSkeleton />}>
                    <HomeProductsLoader
                        productsPromise={data.productsPromise}
                        content={productSection.content}
                    />
                </Suspense>
            )}

            {/* ============================================ */}
            {/* FEATURING: Client Component                 */}
            {/* ============================================ */}
            <div className="w-full">
                <Featuring />
            </div>

            {/* ============================================ */}
            {/* FOOTER: Streamed LAST via Suspense          */}
            {/* ============================================ */}

        </div>
    );
}
