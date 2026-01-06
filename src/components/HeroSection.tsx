"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight } from "lucide-react";

type HeroSectionProps = {
  heading?: string;
  subheading?: string;
  image?: string;
};

const HeroSection = ({ heading, subheading, image }: HeroSectionProps) => {
  // Ensure we have a valid non-empty string for the image src
  const displayImage = (typeof image === 'string' && image.trim().length > 0) 
    ? image 
    : "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";
    
  const displayHeading = heading || "Winter Collection";
  const displaySubheading = subheading || "Discover the new trends";

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={displayImage}
          alt="Hero background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      {/* Curtain overlays (vertical) */}
      <div aria-hidden className="absolute inset-0 z-40 pointer-events-none">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-101%" }}
          transition={{ duration: 0.95, ease: "easeInOut" }}
          className="absolute top-0 left-0 right-0 h-[51%] bg-background/90"
        />
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "101%" }}
          transition={{ duration: 0.95, ease: "easeInOut", delay: 0.03 }}
          className="absolute bottom-0 left-0 right-0 h-[51%] bg-background/90"
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-6 md:px-12 pb-16 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Left - Logo */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white"
          >
            TAILEX
          </motion.h1>

          {/* Right - CTA */}
          <div className="text-right flex flex-col items-end">
            <Link href="/collection" className="group inline-flex items-center gap-3  text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-medium uppercase tracking-widest transform transition-transform duration-300 hover:scale-105">
              <span>Shop Now</span>
              <ArrowDownRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
