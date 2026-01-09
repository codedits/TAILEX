"use client";

import { HomeData } from "@/lib/home-data";
import HeroSection from "@/components/sections/HeroSection";
import ProductGridSection from "@/components/sections/ProductGridSection";
import OutlookSection from "@/components/sections/OutlookSection";
import CategoryGrid from "@/components/collection/CategoryGrid";
import NewsSection from "@/components/sections/NewsSection";
import Footer from "@/components/layout/Footer";

interface HomeLayoutProps {
    data: HomeData;
}

export default function HomeLayout({ data }: HomeLayoutProps) {
    const { layout, hero, brand, collections, products, benefits, posts, footer, social } = data;

    // Render sections based on order
    const sortedSections = [...layout].sort((a, b) => a.order - b.order);

    // Find specific sections to control specific layout grouping
    const heroSection = sortedSections.find(s => s.type === 'hero');
    const categoriesSection = sortedSections.find(s => s.type === 'categories');
    const productSection = sortedSections.find(s => s.type === 'featured-products');
    const outlookSection = sortedSections.find(s => s.type === 'outlook');
    const newsSection = sortedSections.find(s => s.type === 'news');

    return (
        <div className="bg-white min-h-screen selection:bg-neutral-900 selection:text-white">

            {/* Wrapper for Hero + New Arrivals (Categories) - mimics framer-1u6vz46 */}
            <div className="relative flex flex-col items-center justify-center w-full overflow-visible">
                {heroSection?.enabled && (
                    <HeroSection
                        heading={heroSection.content?.heading || brand.name}
                        subheading={heroSection.content?.subheading || hero.subheading}
                        image={heroSection.content?.image || hero.image}
                        brandName={brand.name}
                    />
                )}

                {categoriesSection?.enabled && (
                    <CategoryGrid
                        collections={collections}
                        sectionTitle={categoriesSection.content?.title || "Everyday\nEssentials"}
                        sectionDescription={categoriesSection.content?.description || "Explore our best-selling categories — from crisp polos and refined shirts to versatile jackets and relaxed-fit trousers."}
                    />
                )}
            </div>

            {/* Other Sections as siblings */}
            {productSection?.enabled && (
                <div className="w-full">
                    <ProductGridSection
                        products={products}
                        title={productSection.content?.title || "Proven\nFavorites"}
                        description={productSection.content?.description || "Icons that endure year after year — top-rated staples chosen again and again for their timeless fit, premium feel, and versatility."}
                    />
                </div>
            )}

            {outlookSection?.enabled && (
                <div className="w-full">
                    <OutlookSection
                        title={outlookSection.content?.title || "Style It\nYour Way"}
                    />
                </div>
            )}

            {newsSection?.enabled && (
                <div className="w-full">
                    <NewsSection
                        posts={posts}
                        brandName={brand.name}
                        sectionTitle={newsSection.content?.title}
                        sectionDescription={newsSection.content?.description}
                    />
                </div>
            )}

            <Footer
                config={footer}
                brandName={brand.name}
                social={social}
            />
        </div>
    );
}
