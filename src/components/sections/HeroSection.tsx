'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import HeroCarousel, { HeroSlide } from './HeroCarousel';

type HeroSectionProps = {
  heading?: string;
  subheading?: string;
  image?: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  brandName?: string;
  overlayOpacity?: number;
  // New carousel props
  slides?: HeroSlide[];
  autoPlayInterval?: number;
};

// Reliable default image (external CDN, always available)
const DEFAULT_HERO_IMAGE = "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";

/**
 * HeroSection - Client Component
 * 
 * Supports two modes:
 * 1. Single image (legacy) - uses heading, image props directly
 * 2. Carousel (new) - uses slides array
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
  slides,
  autoPlayInterval = 5000
}: HeroSectionProps) => {

  // If slides array is provided and has items, use carousel mode
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

  // Legacy single image mode
  const [heroImage, setHeroImage] = useState(image?.trim() || DEFAULT_HERO_IMAGE);
  const [heroMobileImage, setHeroMobileImage] = useState(mobileImage?.trim() || '');
  const [imageError, setImageError] = useState(false);

  const displayHeading = heading || brandName;
  const displaySubheading = subheading || "Timeless Wardrobe.\nEveryday Power.";

  const handleImageError = () => {
    console.warn('Hero image failed to load, using fallback');
    setImageError(true);
    setHeroImage(DEFAULT_HERO_IMAGE);
    setHeroMobileImage('');
  };

  const effectiveImage = imageError ? DEFAULT_HERO_IMAGE : heroImage;

  return (
    <section className="relative w-full h-[100vh] overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 h-full w-full bg-neutral-900">
        <picture>
          {heroMobileImage && !imageError && (
            <source
              media="(max-width: 768px)"
              srcSet={heroMobileImage}
            />
          )}
          <source
            media="(min-width: 769px)"
            srcSet={effectiveImage}
          />
          <Image
            src={effectiveImage}
            alt={displayHeading || "Hero Image"}
            fill
            className="object-cover object-top hero-entrance-animate will-change-transform"
            priority
            fetchPriority="high"
            decoding="async"
            quality={85}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE3MTcxNyIvPjwvc3ZnPg=="
            aria-hidden="true"
            onError={handleImageError}
          />
        </picture>

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-700 ease-in-out"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content Container */}
      <div className="relative flex flex-col items-center justify-center w-full px-6 md:px-10 z-10 text-center h-[100vh] max-w-[1920px] mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8">
          <p className="text-white/90 text-xs md:text-xs tracking-[0.2em] uppercase font-bold hero-text-animate-delay-1">
            {subheading || "SPRING/SUMMER '26"}
          </p>

          <h1 className="text-white text-5xl md:text-8xl font-medium tracking-tight hero-text-animate-delay-2">
            {displayHeading}
          </h1>

          <div className="pt-4 hero-text-animate-delay-3">
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
