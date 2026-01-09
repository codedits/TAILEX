"use client";

import Link from "next/link";
import Image from "next/image";
import { Collection } from "@/lib/types";
import { motion } from "framer-motion";

// Fallback image if none provided
const fallbackImage = "https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg";

interface CategoryGridProps {
  collections: Collection[];
  sectionTitle?: string;
  sectionDescription?: string;
}

const CategoryGrid = ({
  collections,
  sectionTitle = "Everyday\nEssentials",
  sectionDescription = "Explore our best-selling categories — from crisp polos and refined shirts to versatile jackets and relaxed-fit trousers, made to elevate your everyday wardrobe."
}: CategoryGridProps) => {
  // Use first 4 active collections
  const items = collections.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      className="relative w-full bg-white overflow-visible"
      style={{ zIndex: 2 }}
    >
      <div
        className="flex flex-col items-center justify-center w-full"
        style={{ maxWidth: '1920px', margin: '0 auto' }}
      >
        {/* Container with padding matching template */}
        <div className="w-full px-6 md:px-10 py-24 md:py-[150px] flex flex-col gap-16 md:gap-20">

          {/* Section Header - Split layout */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full">
            {/* Title - Left */}
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-foreground whitespace-pre-line"
              style={{
                fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: '110%'
              }}
            >
              {sectionTitle}
            </motion.h2>

            {/* Description - Right */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:w-1/4"
            >
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: '"Geist", "Geist Placeholder", sans-serif',
                  fontSize: 'clamp(15px, 1.5vw, 18px)',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  lineHeight: '140%'
                }}
              >
                {sectionDescription}
              </p>
            </motion.div>
          </div>

          {/* Grid - 2 columns */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {items.map((collection) => {
              const imageUrl = collection.image_url || fallbackImage;

              return (
                <motion.div key={collection.id} variants={itemVariants}>
                  <Link
                    href={`/collection/${collection.slug}`}
                    className="group block w-full"
                  >
                    {/* Image Container with hover effect */}
                    <div
                      className="relative w-full overflow-hidden rounded-lg"
                      style={{ aspectRatio: '0.8 / 1' }}
                    >
                      <motion.div
                        className="absolute inset-0 w-[101%] h-[101%]"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image
                          src={imageUrl}
                          alt={collection.title}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    </div>

                    {/* Category Name - Below Image */}
                    <div className="flex items-center justify-center w-full py-4 overflow-hidden">
                      <p
                        className="text-foreground group-hover:opacity-70 transition-opacity"
                        style={{
                          fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                          fontSize: 'clamp(16px, 1.5vw, 20px)',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                          lineHeight: '120%'
                        }}
                      >
                        {collection.title}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
