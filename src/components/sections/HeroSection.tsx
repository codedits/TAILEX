"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// Reliable default image (external CDN, always available)
const DEFAULT_HERO_IMAGE = "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";

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
};

/**
 * HeroSection - Client Component
 * 
 * Strategy:
 * 1. Uses onLoad to track image loading status.
 * 2. Only triggers the entrance animation (scale + fade) after image is ready.
 * 3. Prevents "empty box" animation or flash of unstyled content.
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
}: HeroSectionProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Legacy single image mode
  const displayHeading = heading || brandName;
  const effectiveImage = image?.trim() || DEFAULT_HERO_IMAGE;
  const effectiveMobileImage = mobileImage?.trim();

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-background">
      <div className="absolute inset-0 h-full w-full bg-black">
        {/* Background Image with Entrance Animation */}
        <div
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${isLoaded ? 'animate-image-entrance' : 'opacity-0'}`}
        >
          {/* Responsive images handled via Next.js Image sizes/priority */}
          <Image
            src={effectiveImage}
            alt={displayHeading || "Hero Image"}
            fill
            priority
            fetchPriority="high"
            quality={80}
            sizes="100vw"
            className="object-cover object-top"
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
            onLoad={() => setIsLoaded(true)}
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
