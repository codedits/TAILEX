"use client";

import { HomeData } from "@/lib/home-data";
import HeroSection from "@/components/sections/HeroSection";
import ProductGridSection from "@/components/sections/ProductGridSection";
import OutlookSection from "@/components/sections/OutlookSection";
import CategoryGrid from "@/components/collection/CategoryGrid";
import NewsSection from "@/components/sections/NewsSection";
import Footer from "@/components/layout/Footer";
import { HOMEPAGE_TEXT } from "@/config/homepage-text";

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
        <div className="bg-background text-foreground min-h-screen">

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
                        sectionTitle={categoriesSection.content?.title || HOMEPAGE_TEXT.categories.title}
                        sectionDescription={categoriesSection.content?.description || HOMEPAGE_TEXT.categories.description}
                        aspectRatio={parseFloat(data.categoryGrid?.aspectRatio || '0.8')}
                    />
                )}
            </div>

            {/* Other Sections as siblings */}
            {productSection?.enabled && (
                <div className="w-full">
                    <ProductGridSection
                        products={products}
                        title={productSection.content?.title || HOMEPAGE_TEXT.featuredProducts.title}
                        description={productSection.content?.description || HOMEPAGE_TEXT.featuredProducts.description}
                    />
                </div>
            )}

            {/* Outlook Section */}
            {outlookSection?.enabled && (
                <div className="w-full">

                </div>
            )}

            {/* News Section */}

            <Footer
                config={footer}
                brandName={brand.name}
                social={social}
            />
        </div>
    );
}
