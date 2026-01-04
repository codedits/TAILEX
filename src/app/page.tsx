import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FavoritesSection from "@/components/FavoritesSection";
import StyleGallery from "@/components/StyleGallery";
import BenefitsStrip from "@/components/BenefitsStrip";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-background min-h-screen">
      <Navbar />
      
      {/* Hero Section - Fixed/Sticky for parallax reveal */}
      <div className="sticky top-0 z-0 h-screen w-full">
        <HeroSection />
      </div>

      {/* Content slides over the hero */}
      <div className="relative z-10 bg-background">
        <CategoryGrid />
        
        <div className="bg-background relative z-10 pb-20">
            <FavoritesSection />
            <BenefitsStrip />
            <NewsSection />
            <Footer />
        </div>
      </div>
    </main>
  );
}
