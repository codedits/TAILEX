"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
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
  ctaText = "Shop Now",
  ctaLink = "/collection/all",
  brandName = "TAILEX"
}: HeroSectionProps) => {
  // Safe default image
  const displayImage = (typeof image === 'string' && image.trim().length > 0)
    ? image
    : "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop";

  // Default text
  const displayHeading = heading || "Winter Collection";
  const displaySubheading = subheading || "Discover the new trends defining the season.";

  return (
    <section className="relative h-[100dvh] w-full bg-black overflow-hidden px-6 md:px-12 pb-12 md:pb-20 flex flex-col justify-end">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={displayImage}
          alt="Hero background"
          fill
          className="object-cover object-center opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">

          {/* Text Content */}
          <div className="max-w-4xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-white/80 text-sm md:text-base tracking-[0.2em] font-medium uppercase mb-4">
                {brandName}
              </p>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white leading-[0.9]">
                {displayHeading}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-2xl text-white/80 font-light max-w-xl leading-relaxed"
            >
              {displaySubheading}
            </motion.p>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex-shrink-0"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white text-black hover:bg-neutral-200 h-16 px-10 text-lg transition-transform hover:scale-105"
            >
              <Link href={ctaLink} className="flex items-center gap-2">
                {ctaText}
                <ArrowDownRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
