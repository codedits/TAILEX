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
      className="relative w-full overflow-visible"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}
    >
      {/* Background Image Container - Decorative, loads async */}
      <div className="absolute inset-0 h-full w-full overflow-hidden z-0">
        <div className="absolute inset-0 h-full w-full hero-image-animate">
          <Image
            src={displayImage}
            alt=""
            fill
            className="object-cover object-top animate-ken-burns will-change-transform"
            priority
            decoding="async"
            fetchPriority="high"
            quality={95}
            sizes="(max-width: 768px) 300vw, 100vw"
            aria-hidden="true"
          />
          {/* Subtle Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      {/* Content Container - Text Independent, Paints First */}
      <div
        className="relative flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between w-full px-6 md:px-10 pb-10 gap-8 md:gap-0 z-10"
        style={{
          height: '100vh',
          maxWidth: '1920px',
          margin: '0 auto'
        }}
      >
        {/* Mobile View: Centered CTA only */}
        <div className="flex flex-col items-center justify-center md:hidden w-full text-center">
          <div className="mb-6 hero-text-animate">
            <h2 className="text-white text-6xl font-normal tracking-tighter uppercase leading-none">
              {displayHeading}
            </h2>
          </div>
          <div className="hero-text-animate-delay">
            <Button
              asChild
              variant="ctaHeroOutline"
              size="xl"
              className="px-12"
            >
              <Link href="/shop">
                Shop Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop View: Brand Name - Bottom Left */}
        <div className="z-10 hidden md:block hero-text-animate">
          <h1
            className="font-normal tracking-[-0.02em] text-white leading-[1.1]"
            style={{
              fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
              fontSize: 'clamp(72px, 10vw, 110px)'
            }}
          >
            {displayHeading}
          </h1>
        </div>

        {/* Desktop View: Tagline - Bottom Right */}
        <div className="z-10 text-right hidden md:block hero-text-animate-delay">
          <p
            className="text-white leading-[1.4] tracking-[0.02em] whitespace-pre-line"
            style={{
              fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
              fontSize: 'clamp(28px, 3vw, 32px)'
            }}
          >
            {displaySubheading}
          </p>
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
    </section>
  );
};

export default HeroSection;
