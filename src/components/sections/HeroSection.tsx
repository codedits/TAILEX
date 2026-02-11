import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { HeroSlide } from './HeroCarousel';

const HeroCarousel = dynamic(() => import('./HeroCarousel'), {
  loading: () => <div className="absolute inset-0 bg-neutral-100" /> // Placeholder to prevent layout shift
});

type HeroSectionProps = {
  heading?: string;
  subheading?: string;
  image?: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  brandName?: string;
  overlayOpacity?: number;
  blurDataURL?: string;
  // New carousel props
  slides?: HeroSlide[];
  autoPlayInterval?: number;
};

// Reliable default image (external CDN, always available)
const DEFAULT_HERO_IMAGE = "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";

/**
 * HeroSection - Now a Server Component for maximum Performance
 * 
 * Strategy:
 * 1. Single layout (SSR): Uses pure CSS animations for instant paint (FCP/LCP win).
 * 2. Carousel mode (Client): Only loads client-side JS if multiple slides exist.
 */
const HeroSection = ({
  heading,
  subheading,
  image,
  mobileImage,
  brandName = "TAILEX",
  overlayOpacity = 0.3,
  ctaText,
  ctaLink,
  blurDataURL,
  slides,
  autoPlayInterval = 5000
}: HeroSectionProps) => {

  // If slides array is provided and has items, use carousel mode (Client Component)
  if (slides && slides.length > 0) {
    return (
      <HeroCarousel
        slides={slides}
        brandName={brandName}
        overlayOpacity={overlayOpacity}
        autoPlayInterval={autoPlayInterval}
        defaultHeading={heading}
        defaultSubheading={subheading}
      />
    );
  }

  // Legacy single image mode (Now fully Server-Rendered with CSS animations)
  const displayHeading = heading || brandName;

  const effectiveImage = image?.trim() || DEFAULT_HERO_IMAGE;
  const effectiveMobileImage = mobileImage?.trim();

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-background">
      <div className="absolute inset-0 h-full w-full">
        {/* Background Image with Entrance Animation */}
        <div className="absolute inset-0 h-full w-full animate-image-entrance">
          {/* Responsive images handled via Next.js Image sizes/priority */}
          <Image
            src={effectiveImage}
            alt={displayHeading || "Hero Image"}
            fill
            priority
            fetchPriority="high"
            quality={90}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 1080px"
            className="object-cover object-top"
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
          />
        </div>

        {/* CSS-only Overlay (Instant paint) */}
        <div
          className="absolute inset-0 bg-black z-[5]"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content Container - CSS Animated for zero hydration cost */}
      <div className="relative flex flex-col items-center justify-center w-full px-6 md:px-10 z-10 text-center h-[100vh] max-w-[1920px] mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8">
          <p className="hero-subtext text-white/90 text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold">
            {subheading || "SPRING/SUMMER '26"}
          </p>

          <h1 className="hero-text text-white text-5xl md:text-8xl font-medium tracking-tight">
            {displayHeading}
          </h1>

          <div className="hero-cta pt-4">
            <Link
              href={ctaLink || "/shop"}
              className="inline-block px-8 py-3 rounded-full border border-white/50 text-white text-[10px] md:text-xs font-semibold tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 uppercase"
            >
              {ctaText || "Shop Now"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
