"use client";

import Link from "next/link";
import Image from "next/image";
import { Collection } from "@/lib/types";
import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";
import { ArrowUpRight } from "lucide-react";

// Fallback image if none provided
const fallbackImage = "https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg";

interface CategoryGridProps {
  collections: Collection[];
  sectionTitle?: string;
  sectionDescription?: string;
  aspectRatio?: number;
}

const CategoryGrid = ({
  collections,
  sectionTitle = "Everyday\nEssentials",
  sectionDescription = "Explore our best-selling categories — from crisp polos and refined shirts to versatile jackets and relaxed-fit trousers.",
  aspectRatio = 0.85 // Slightly taller for modern look
}: CategoryGridProps) => {
  const items = collections.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98] as const // Custom ease for smooth entry
      },
    },
  };

  return (
    <section className="relative w-full bg-background z-10">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-20 md:py-32">

        {/* --- Header Section --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 md:mb-24">
          <TextReveal
            variant="stagger"
            className="text-foreground whitespace-pre-line text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]"
          >
            {sectionTitle}
          </TextReveal>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:max-w-md"
          >
            <p className="text-muted-foreground text-lg leading-relaxed font-light">
              {sectionDescription}
            </p>
          </motion.div>
        </div>

        {/* --- Grid Section --- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={containerVariants}
        >
          {items.map((collection) => {
            const imageUrl = collection.image_url || fallbackImage;

            return (
              <motion.div key={collection.id} variants={cardVariants} className="w-full">
                <Link
                  href={`/collection/${collection.slug}`}
                  className="group relative block w-full overflow-hidden rounded-xl bg-gray-100"
                  style={{ aspectRatio: `${aspectRatio}` }}
                >
                  {/* Image Layer */}
                  <motion.div
                    className="absolute inset-0 w-full h-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    <Image
                      src={imageUrl}
                      alt={collection.title}
                      fill
                      className="object-cover transition-all duration-700 ease-out group-hover:grayscale-[20%]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={75}
                    />
                    {/* Dark overlay for contrast if mix-blend fails on certain backgrounds */}
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                  </motion.div>

                  {/* Content Layer - Centered with Mix Blend Mode */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="relative z-20 text-center mix-blend-difference">
                      <h3 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter uppercase">
                        {collection.title}
                      </h3>
                      <p className="mt-2 text-white/80 font-medium tracking-widest text-xs uppercase opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                        View Collection
                      </p>
                    </div>
                  </div>

                  {/* Corner Button - Appears on Hover */}
                  <div className="absolute bottom-6 left-6 z-30 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black backdrop-blur-sm">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>

                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;