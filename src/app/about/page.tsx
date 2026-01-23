import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getBrandConfig, getNavigation, getFooterConfig, getSocialConfig } from "@/lib/theme";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import style1 from "@/assets/style-1.jpg";
import style2 from "@/assets/style-2.jpg";

export const revalidate = 300;

export default async function AboutPage() {
  const [brand, navItems, footerConfig, socialConfig] = await Promise.all([
    getBrandConfig(),
    getNavigation('main-menu'),
    getFooterConfig(),
    getSocialConfig(),
  ]);

  return (
    <main className="min-h-screen bg-background selection:bg-black selection:text-white">
      <Navbar brandName={brand.name} navItems={navItems} />

      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={style1}
            alt="Tailex Aesthetic"
            fill
            className="object-cover object-top opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="font-display text-5xl md:text-7xl lg:text-9xl text-white tracking-tighter mix-blend-difference animate-in fade-in slide-in-from-bottom-8 duration-1000">
            TAILEX
          </h1>
          <p className="mt-6 text-white/90 font-body text-lg md:text-2xl tracking-wide uppercase max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Premium. Diverse. Tailored.
          </p>
        </div>
      </section>

      {/* Brand Statement Section */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 view-animate">
            <span className="inline-block h-px w-20 bg-foreground/30 mb-8" />
            <h2 className="font-display font-bold text-4xl md:text-4xl lg:text-6xl leading-[1.1] text-foreground tracking-tight max-w-[1400px] mx-auto">
              Tailex is a Pakistani brand for premium and diverse apparel, tailored selectively to match your interest.
            </h2>
            <p className="font-body text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              We believe in the power of individual expression. Our collections are curated not just to be worn, but to be experienced. Blending traditional craftsmanship with contemporary aesthetics, we offer a wardrobe that speaks to the modern individual.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Grid / Values */}
      <section className="pb-24 px-6 md:px-12 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-7xl mx-auto">
          <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group">
            <Image
              src={style2}
              alt="Quality Craftsmanship"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
              <h3 className="text-white font-display text-3xl mb-2">Heritage</h3>
              <p className="text-white/80 font-body">Rooted in Pakistani textile excellence.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-secondary/30 p-12 md:p-20 aspect-[3/4] md:aspect-[4/5]">
            <h3 className="font-display text-3xl md:text-4xl mb-6 text-foreground">Selective Curation</h3>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8">
              Every fabric, stitch, and silhouette is chosen with intention. We don't just make clothes; we craft experiences tailored to your unique taste.
            </p>
            <div className="h-px w-full bg-foreground/10" />
          </div>
        </div>
      </section>

      <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
    </main>
  );
}
