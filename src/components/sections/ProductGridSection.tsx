"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { TextReveal } from "@/components/ui/text-reveal";

interface ProductGridSectionProps {
  products: Product[];
  title?: string;
  description?: string;
  viewAllLink?: string;
}

// Fallback images for products
const fallbackImages = [
  "https://framerusercontent.com/images/8cspFIVdZlKFRJLuzv0gGtFRsk.jpg",
  "https://framerusercontent.com/images/kYE4u2fFEGCjqRMqvGH9M300E.jpg",
  "https://framerusercontent.com/images/Y6x8U2kMrNBu3VvSmEzZHNkNs.jpg"
];

const ProductGridSection = ({
  products,
  title = "Proven\nFavorites",
  description = "Icons that endure year after year — top-rated staples chosen again and again by real customers for their timeless fit, premium feel, and effortless versatility.",
  viewAllLink = "/collection/all"
}: ProductGridSectionProps) => {
  // Use first 3 (or 6) products
  const displayProducts = products.slice(0, 3);

  const formatPrice = (price: number | string | null | undefined) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
    return numPrice.toFixed(2);
  };

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
    <section className="relative w-full bg-background overflow-hidden z-10">
      <div
        className="flex flex-col items-center justify-center w-full"
        style={{ maxWidth: '1920px', margin: '0 auto' }}
      >
        {/* Container with padding matching template */}
        <div className="w-full px-6 md:px-10 py-24 md:py-[150px] flex flex-col gap-16 md:gap-20">

          {/* Section Header - Split layout */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 w-full overflow-hidden border-b border-foreground/10 pb-12">
            {/* Title - Left */}
            <TextReveal
              variant="stagger"
              className="text-foreground whitespace-pre-line font-manrope font-black tracking-tight leading-[0.9]"
              style={{
                fontSize: 'clamp(48px, 8vw, 120px)',
              }}
            >
              {title}
            </TextReveal>

            {/* Description - Right */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:w-1/3"
            >
              <p
                className="text-muted-foreground font-manrope font-medium italic mb-6"
                style={{
                  fontSize: 'clamp(16px, 1.8vw, 22px)',
                  lineHeight: '130%'
                }}
              >
                {description}
              </p>
              <Link 
                href={viewAllLink} 
                className="inline-flex items-center gap-2 text-xs font-manrope font-black uppercase tracking-[0.2em] group border-b border-foreground pb-2 hover:opacity-70 transition-all"
              >
                Explore Collection
                <div className="w-4 h-4 rounded-full border border-foreground flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L9 1M9 1H1M9 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Grid - 3 columns */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {displayProducts.map((product, index) => {
              const primaryImage = product.images?.[0] || fallbackImages[index % fallbackImages.length];
              const secondaryImage = product.images?.[1] || primaryImage;
              const category = product.category || "ESSENTIALS";

              return (
                <motion.div key={product.id} variants={itemVariants} className="h-full">
                  <ProductCard {...product} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
