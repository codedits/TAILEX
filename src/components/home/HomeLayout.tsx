"use client";

import { HomeData } from "@/lib/home-data";
import { FadeInView } from "@/components/animations/FadeInView";
import HeroSection from "@/components/sections/HeroSection";
import CategoryGrid from "@/components/collection/CategoryGrid";
import FavoritesSection from "@/components/sections/FavoritesSection";
import BenefitsStrip from "@/components/sections/BenefitsStrip";
import NewsSection from "@/components/sections/NewsSection";
import Footer from "@/components/layout/Footer";

interface HomeLayoutProps {
    data: HomeData;
}

export default function HomeLayout({ data }: HomeLayoutProps) {
    const { layout, hero, brand, collections, products, benefits, posts, footer, social } = data;

    // Render sections based on order, but purely vertical stack now.
    const sortedSections = [...layout].sort((a, b) => a.order - b.order);

    return (
        <div className="bg-background min-h-screen selection:bg-neutral-900 selection:text-white font-sans">
            {sortedSections.map((section) => {
                if (!section.enabled) return null;

                return (
                    <div key={section.id} className="w-full">
                        {section.type === 'hero' && (
                            <HeroSection
                                heading={hero.heading}
                                subheading={hero.subheading}
                                image={hero.image}
                                ctaText={hero.ctaText}
                                ctaLink={hero.ctaLink}
                                brandName={brand.name}
                            />
                        )}

                        {section.type === 'categories' && (
                            <div className="py-24 sm:py-32 bg-background">
                                <FadeInView>
                                    <CategoryGrid collections={collections} />
                                </FadeInView>
                            </div>
                        )}

                        {section.type === 'featured-products' && (
                            <div className="py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-900/50">
                                <FadeInView>
                                    <FavoritesSection products={products} />
                                </FadeInView>
                            </div>
                        )}

                        {section.type === 'benefits' && benefits.enabled && (
                            <div className="border-t border-b border-border bg-background">
                                <BenefitsStrip items={benefits.items} />
                            </div>
                        )}

                        {section.type === 'news' && (
                            <div className="py-24 bg-background">
                                <FadeInView>
                                    <NewsSection posts={posts} />
                                </FadeInView>
                            </div>
                        )}
                    </div>
                );
            })}

            <Footer
                config={footer}
                brandName={brand.name}
                social={social}
            />
        </div>
    );
}
