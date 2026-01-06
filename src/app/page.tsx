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

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();
  
  // Use .single() but handle null data gracefully
  const [heroResult, brandResult, collectionsResult, productsResult] = await Promise.all([
    supabase.from('site_config').select('value').eq('key', 'hero').maybeSingle(),
    supabase.from('site_config').select('value').eq('key', 'brand').maybeSingle(),
    // Select only necessary fields for performance
    supabase.from('collections')
      .select('id, title, slug, image_url, description')
      .order('title', { ascending: true })
      .limit(4),
    supabase.from('products')
      .select('id, title, slug, price, sale_price, cover_image, images')
      .order('created_at', { ascending: false })
      .limit(6)
  ]);

  const hero = heroResult.data?.value || {};
  const brand = brandResult.data?.value || { name: 'TAILEX', announcement: '' };
  const collections = (collectionsResult.data || []) as Collection[];
  const featuredProducts = (productsResult.data || []) as Product[];

  return (
    <main className="relative bg-background min-h-screen">
      <AnnouncementBar text={brand.announcement} />
      <Navbar brandName={brand.name} />
      
      {/* Hero Section - Fixed/Sticky for parallax reveal */}
      <div className="sticky top-0 z-0 h-screen w-full">
        <HeroSection 
          heading={hero.heading}
          subheading={hero.subheading}
          image={hero.image}
        />
      </div>

      {/* Content slides over the hero */}
      <div className="relative z-10 bg-background">
        <CategoryGrid collections={collections} />
        
        <div className="bg-background relative z-10 pb-20">
            <FavoritesSection products={featuredProducts} />
            <BenefitsStrip />
            <NewsSection />
            <Footer />
        </div>
      </div>
    </main>
  );
}
