import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FavoritesSection from "@/components/FavoritesSection";
import BenefitsStrip from "@/components/BenefitsStrip";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Collection, Product } from "@/lib/types";
import { 
  getNavigation, 
  getBrandConfig, 
  getHeroConfig, 
  getBenefitsConfig,
  getFooterConfig,
  getSocialConfig,
  getLatestPosts,
  getFeaturedCollections,
  getFeaturedProducts
} from "@/lib/theme";

export const revalidate = 300; // 5 minutes - aggressive cache for storefront

export default async function Home() {
  // ============================================
  // ALL DATA IS EDGE-CACHED (Layer 2)
  // No per-request DB calls - shared across users
  // ============================================
  const [
    navItems, 
    brand, 
    hero, 
    benefitsConfig,
    footerConfig,
    socialConfig,
    blogPosts,
    collections, 
    featuredProducts
  ] = await Promise.all([
    getNavigation('main-menu'),
    getBrandConfig(),
    getHeroConfig(),
    getBenefitsConfig(),
    getFooterConfig(),
    getSocialConfig(),
    getLatestPosts(3),
    getFeaturedCollections(4),
    getFeaturedProducts(6)
  ]) as [
    Awaited<ReturnType<typeof getNavigation>>,
    Awaited<ReturnType<typeof getBrandConfig>>,
    Awaited<ReturnType<typeof getHeroConfig>>,
    Awaited<ReturnType<typeof getBenefitsConfig>>,
    Awaited<ReturnType<typeof getFooterConfig>>,
    Awaited<ReturnType<typeof getSocialConfig>>,
    Awaited<ReturnType<typeof getLatestPosts>>,
    Collection[],
    Product[]
  ];

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
