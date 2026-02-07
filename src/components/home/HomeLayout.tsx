import { Suspense } from "react";
import { HomeData } from "@/lib/home-data";
import HeroSection from "@/components/sections/HeroSection";
import { TopCollectionStrip } from "@/components/sections/TopCollectionStrip";
import ProductGridSection from "@/components/sections/ProductGridSection";
import CollectionShowcase from "@/components/collection/CollectionShowcase";
import Footer from "@/components/layout/Footer";
import { HOMEPAGE_TEXT } from "@/config/homepage-text";
import { TrustBar } from "@/components/sections/TrustBar";
import Featuring from "@/components/sections/Featuring";

// Skeletons for Suspense fallbacks
import { CollectionShowcaseSkeleton } from "@/components/skeletons/CollectionShowcaseSkeleton";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";
import { FooterSkeleton } from "@/components/skeletons/FooterSkeleton";

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
    const { layout, hero, brand, collections, products, footer, social } = data;

    // Render sections based on order
    const sortedSections = [...layout].sort((a, b) => a.order - b.order);

    // Find specific sections to control specific layout grouping
    const heroSection = sortedSections.find(s => s.type === 'hero');
    const categoriesSection = sortedSections.find(s => s.type === 'categories');
    const productSection = sortedSections.find(s => s.type === 'featured-products');

    // Split collections: first one renders sooner, rest are lazy
    const firstCollection = collections[0];
    const remainingCollections = collections.slice(1);

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
                {categoriesSection?.enabled && firstCollection && (
                    <Suspense fallback={<CollectionShowcaseSkeleton />}>
                        <CollectionShowcase
                            key={firstCollection.id}
                            title={firstCollection.title}
                            description={firstCollection.description || ""}
                            coverImage={firstCollection.image_url || ""}
                            products={firstCollection.products || []}
                            collectionHref={`/collection/${firstCollection.slug}`}
                            className="mb-0"
                        />
                    </Suspense>
                )}
            </div>

            {/* ============================================ */}
            {/* REMAINING COLLECTIONS: Streamed via Suspense */}
            {/* ============================================ */}
            {categoriesSection?.enabled && remainingCollections.length > 0 && (
                <div className="relative flex flex-col items-center justify-center w-full overflow-hidden">
                    {remainingCollections.map((collection) => (
                        <Suspense key={collection.id} fallback={<CollectionShowcaseSkeleton />}>
                            <CollectionShowcase
                                title={collection.title}
                                description={collection.description || ""}
                                coverImage={collection.image_url || ""}
                                products={collection.products || []}
                                collectionHref={`/collection/${collection.slug}`}
                                className="mb-0"
                            />
                        </Suspense>
                    ))}
                </div>
            )}

            {/* ============================================ */}
            {/* FEATURED PRODUCTS: Streamed via Suspense    */}
            {/* ============================================ */}
            {productSection?.enabled && (
                <Suspense fallback={<ProductGridSkeleton />}>
                    <div className="w-full">
                        <ProductGridSection
                            products={products}
                            title={productSection.content?.title || HOMEPAGE_TEXT.featuredProducts.title}
                            description={productSection.content?.description || HOMEPAGE_TEXT.featuredProducts.description}
                        />
                    </div>
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
            <Suspense fallback={<FooterSkeleton />}>
                <Footer
                    config={footer}
                    brandName={brand.name}
                    social={social}
                />
            </Suspense>
        </div>
    );
}
