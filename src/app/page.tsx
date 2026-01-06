import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FavoritesSection from "@/components/FavoritesSection";
import BenefitsStrip from "@/components/BenefitsStrip";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { createClient } from "@/lib/supabase/server";
import { Collection, Product } from "@/lib/types";
import { 
  getNavigation, 
  getBrandConfig, 
  getHeroConfig, 
  getBenefitsConfig,
  getFooterConfig,
  getSocialConfig,
  getLatestPosts
} from "@/lib/theme";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch all config in parallel for performance
  const [
    navItems, 
    brand, 
    hero, 
    benefitsConfig,
    footerConfig,
    socialConfig,
    blogPosts,
    collectionsResult, 
    productsResult
  ] = await Promise.all([
    getNavigation('main-menu'),
    getBrandConfig(),
    getHeroConfig(),
    getBenefitsConfig(),
    getFooterConfig(),
    getSocialConfig(),
    getLatestPosts(3),
    // Select only necessary fields for performance
    supabase.from('collections')
      .select('id, title, slug, image_url, description')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
      .limit(4),
    supabase.from('products')
      .select('id, title, slug, price, sale_price, cover_image, images')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6)
  ]);

  const collections = (collectionsResult.data || []) as Collection[];
  const featuredProducts = (productsResult.data || []) as Product[];

  return (
    <main className="relative bg-background min-h-screen">
      {brand.showAnnouncement && brand.announcement && (
        <AnnouncementBar text={brand.announcement} />
      )}
      <Navbar brandName={brand.name} navItems={navItems} />
      
      {/* Hero Section - Fixed/Sticky for parallax reveal */}
      <div className="sticky top-0 z-0 h-screen w-full">
        <HeroSection 
          heading={hero.heading}
          subheading={hero.subheading}
          image={hero.image}
          ctaText={hero.ctaText}
          ctaLink={hero.ctaLink}
          brandName={brand.name}
        />
      </div>

      {/* Content slides over the hero */}
      <div className="relative z-10 bg-background">
        <CategoryGrid collections={collections} />
        
        <div className="bg-background relative z-10 pb-20">
            <FavoritesSection products={featuredProducts} />
            {benefitsConfig.enabled && <BenefitsStrip items={benefitsConfig.items} />}
            <NewsSection posts={blogPosts} />
            <Footer 
              config={footerConfig} 
              brandName={brand.name} 
              social={socialConfig}
            />
        </div>
      </div>
    </main>
  );
}
