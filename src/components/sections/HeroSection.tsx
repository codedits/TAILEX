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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Content Layer - Bottom-Aligned */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-end justify-between gap-10">
        {/* Massive Brand Title - Left */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-[70%]"
        >
          <h1 className="text-[7vw] md:text-[8vw] font-bold tracking-tighter text-white leading-[0.8] mb-0 whitespace-nowrap">
            {brandName}
          </h1>
        </motion.div>

        {/* Tagline - Right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-xs md:max-w-md text-right md:pb-4"
        >
          <p className="text-base md:text-xl text-white font-light leading-snug tracking-tight">
            {displaySubheading}
          </p>

          {/* CTA Option - Small and clean if needed, otherwise skip */}
          <div className="mt-8 flex justify-end">
            <Link
              href={ctaLink}
              className="group inline-flex items-center gap-2 text-white/70 hover:text-white text-sm md:text-base tracking-widest uppercase transition-colors"
            >
              {ctaText}
              <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
