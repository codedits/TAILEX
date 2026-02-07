'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import HeroCarousel, { HeroSlide } from './HeroCarousel';
import { useIsMobile } from '@/hooks/use-media-query';

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
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);

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
  const [imageError, setImageError] = useState(false);

  const displayHeading = heading || brandName;
  const displaySubheading = subheading || "Timeless Wardrobe.\nEveryday Power.";

  const handleImageError = () => {
    console.warn('Hero image failed to load, using fallback');
    setImageError(true);
  };

  const getEffectiveImage = () => {
    if (imageError) return DEFAULT_HERO_IMAGE;
    if (isMobile && mobileImage) return mobileImage.trim();
    return (image?.trim() || DEFAULT_HERO_IMAGE);
  };

  const effectiveImage = getEffectiveImage();

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-white">
      <div className="absolute inset-0 h-full w-full">
        {effectiveImage && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: imageLoaded ? 1 : 0,
              scale: imageLoaded ? 1 : 1.1
            }}
            transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={effectiveImage}
              alt={displayHeading || "Hero Image"}
              fill
              priority
              fetchPriority="high"
              quality={85}
              sizes="100vw"
              className="object-cover object-top"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
          </motion.div>
        )}

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? overlayOpacity : 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-black z-[5]"
        />
      </div>

      {/* Content Container */}
      <div className="relative flex flex-col items-center justify-center w-full px-6 md:px-10 z-10 text-center h-[100vh] max-w-[1920px] mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={imageLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="text-white/90 text-xs md:text-xs tracking-[0.2em] uppercase font-bold"
          >
            {subheading || "SPRING/SUMMER '26"}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={imageLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="text-white text-5xl md:text-8xl font-medium tracking-tight"
          >
            {displayHeading}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={imageLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="pt-4"
          >
            <Link
              href={ctaLink || "/shop"}
              className="inline-block px-8 py-3 rounded-full border border-white/50 text-white text-[10px] md:text-xs font-semibold tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 uppercase"
            >
              {ctaText || "Shop Now"}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
