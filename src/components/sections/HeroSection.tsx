import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  heading?: string;
  subheading?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  brandName?: string;
};

/**
 * HeroSection - Server Component
 * 
 * Optimized for FCP/LCP:
 * - No "use client" - zero blocking JS
 * - CSS animations instead of Framer Motion
 * - Hero text structurally independent from image (text paints first)
 * - ONLY priority image on the entire page
 * - Explicit decoding="async" and fetchPriority="high"
 */
const HeroSection = ({
  heading,
  subheading,
  image,
  brandName = "TAILEX"
}: HeroSectionProps) => {
  // Safe default image
  const displayImage = (typeof image === 'string' && image.trim().length > 0)
    ? image
    : "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";

  // Default text - use brand name as main heading
  const displayHeading = heading || brandName;
  const displaySubheading = subheading || "Timeless Wardrobe.\nEveryday Power.";

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 h-full w-full bg-neutral-900">
        <Image
          src={displayImage}
          alt=""
          fill
          className="object-cover object-top animate-hero-rastah"
          priority
          fetchPriority="high"
          decoding="sync"
          quality={100}
          unoptimized={true} // Fetch directly from Framer CDN (faster than Next.js proxy)
          sizes="100vw"
          aria-hidden="true"
        />
        {/* Subtle Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>


      {/* Content Container - Centered */}
      <div
        className="relative flex flex-col items-center justify-center w-full px-6 md:px-10 z-10 text-center"
        style={{
          height: '100vh',
          maxWidth: '1920px',
          margin: '0 auto'
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Subtitle */}
          <p className="text-white/90 text-xs md:text-xs tracking-[0.2em] uppercase font-bold hero-text-animate-delay-1">
            {subheading || "SS26 STATEMENT PIECES"}
          </p>

          {/* Main Title */}
          <h1 className="text-white text-5xl md:text-8xl font-medium tracking-tight hero-text-animate-delay-2">
            {heading || "Bold by design"}
          </h1>

          {/* CTA Button */}
          <div className="pt-4 hero-text-animate-delay-3">
            <Link
              href="/shop"
              className="inline-block px-8 py-3 rounded-full border border-white/50 text-white text-[10px] md:text-xs font-semibold tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 uppercase"
            >
              Discover More
            </Link>
          </div>
        </div>

      </div>

      {/* Transition Overlay - for scroll transition effect (CSS only) */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-0 right-0 bg-background opacity-0"
          style={{ height: '50%', transform: 'translateY(450px)' }}
        />
        <div
          className="absolute top-0 left-0 right-0 bg-background opacity-0"
          style={{ height: '50%', transform: 'translateY(-450px)' }}
        />
      </div>
    </section >
  );
};

export default HeroSection;
