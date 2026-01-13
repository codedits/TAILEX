"use client";

import { motion } from "framer-motion";
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
      {/* Background Container */}
      <div className="absolute inset-0 h-full w-full overflow-hidden z-0">
        <motion.div
          className="absolute inset-0 h-full w-full"
          initial={{ opacity: 0.001, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            bounce: 0,
            delay: 1,
            duration: 0.8
          }}
        >
          <Image
            src={displayImage}
            alt="Hero background"
            fill
            className="object-cover object-top animate-ken-burns will-change-transform"
            priority
            quality={90}
            sizes="(max-width: 768px) 300vw, 150vw"
          />
          {/* Subtle Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </div>

      {/* Content Container - 100vh height */}
      <div
        className="relative flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between w-full px-6 md:px-10 pb-10 gap-8 md:gap-0"
        style={{
          height: '100vh',
          maxWidth: '1920px',
          margin: '0 auto'
        }}
      >
        {/* Mobile View: Centered CTA only */}
        <div className="flex flex-col items-center justify-center md:hidden w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-6"
          >
            <h2 className="text-white text-6xl font-normal tracking-tighter uppercase leading-none">
              {displayHeading}
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
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
          </motion.div>
        </div>

        {/* Desktop View: Brand Name - Bottom Left */}
        <motion.div
          className="z-10 hidden md:block"
          initial={{ opacity: 0.001, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            bounce: 0,
            delay: 1.4,
            duration: 0.8
          }}
        >
          <h1
            className="font-normal tracking-[-0.02em] text-white leading-[1.1]"
            style={{
              fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
              fontSize: 'clamp(72px, 10vw, 110px)'
            }}
          >
            {displayHeading}
          </h1>
        </motion.div>

        {/* Desktop View: Tagline - Bottom Right */}
        <motion.div
          className="z-10 text-right hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <p
            className="text-white leading-[1.4] tracking-[0.02em] whitespace-pre-line"
            style={{
              fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
              fontSize: 'clamp(28px, 3vw, 32px)'
            }}
          >
            {displaySubheading}
          </p>
        </motion.div>
      </div>

      {/* Transition Overlay - for scroll transition effect */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-background"
          style={{ height: '50%' }}
          initial={{ opacity: 0, y: 450 }}
          animate={{ opacity: 0, y: 450 }}
        />
        <motion.div
          className="absolute top-0 left-0 right-0 bg-background"
          style={{ height: '50%' }}
          initial={{ opacity: 0, y: -450 }}
          animate={{ opacity: 0, y: -450 }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
