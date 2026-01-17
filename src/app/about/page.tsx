import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getBrandConfig, getNavigation, getFooterConfig, getSocialConfig } from "@/lib/theme";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import style1 from "@/assets/style-1.jpg";
import style2 from "@/assets/style-2.jpg";

// Make this page dynamic to fetch from CMS
export const revalidate = 300; // 5 minutes - aggressive cache

// Page content type for CMS
type PageContent = {
  title: string;
  heroTitle?: string;
  heroDescription?: string;
  sections?: {
    id: string;
    type: string;
    title?: string;
    content?: string;
    image?: string;
  }[];
};

// Default content fallback
const defaultContent: PageContent = {
  title: "About Us",
  heroTitle: "The TAILEX Studio",
  heroDescription: "Founded on the principle of intentional design, TAILEX creates pieces that bridge the gap between traditional craftsmanship and modern utility.",
  sections: [
    {
      id: "story",
      type: "text-image",
      title: "Our Story",
      content: "What began as a small atelier focused on perfecting the essential wardrobe has grown into a global brand trusted by discerning customers worldwide.\n\nEvery piece in our collection is designed with intention — to be worn, loved, and passed down. We believe in buying less but buying better.\n\nOur commitment to quality means sourcing the finest materials from ethical suppliers and working with skilled artisans who share our passion for detail.",
    },
    {
      id: "philosophy",
      type: "image-text",
      title: "The Approach",
      content: "We design for the modern man who values substance over spectacle. Our pieces are meant to be the foundation of your wardrobe — versatile, enduring, and effortlessly refined.",
    }
  ]
};

export default async function AboutPage() {
  const supabase = await createClient();

  // Fetch page content and site config in parallel
  const [brand, navItems, footerConfig, socialConfig, pageResult] = await Promise.all([
    getBrandConfig(),
    getNavigation('main-menu'),
    getFooterConfig(),
    getSocialConfig(),
    supabase.from('pages').select('*').eq('slug', 'about').maybeSingle()
  ]);

  // Use CMS content if available, otherwise defaults
  const pageData = pageResult.data;
  const content: PageContent = pageData?.sections
    ? {
      title: pageData.title,
      heroTitle: pageData.title,
      heroDescription: pageData.content || defaultContent.heroDescription,
      sections: pageData.sections as PageContent['sections']
    }
    : { ...defaultContent, heroTitle: `About ${brand.name}` };

  return (
    <main className="min-h-screen bg-background">
      <Navbar brandName={brand.name} navItems={navItems} />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
          <h1 className="section-title text-foreground mb-6">{content.heroTitle}</h1>
          <p className="text-muted-foreground font-body text-lg md:text-xl leading-relaxed">
            {content.heroDescription}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-20">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              {content.sections?.[0]?.title || "Our Story"}
            </h2>
            <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
              {(content.sections?.[0]?.content || defaultContent.sections?.[0]?.content || '')
                .split('\n\n')
                .map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 aspect-[4/5] overflow-hidden relative">
            <Image
              src={content.sections?.[0]?.image || style1}
              alt={`${brand.name} craftsmanship`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-150 aspect-[4/5] overflow-hidden md:order-1 relative">
            <Image
              src={content.sections?.[1]?.image || style2}
              alt={`${brand.name} lifestyle`}
              fill
              className="object-cover"
            />
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150 md:order-2">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              {content.sections?.[1]?.title || "Our Philosophy"}
            </h2>
            <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
              {(content.sections?.[1]?.content || defaultContent.sections?.[1]?.content || '')
                .split('\n\n')
                .map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
            </div>
          </div>
        </div>
      </section>

      <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
    </main>
  );
}
