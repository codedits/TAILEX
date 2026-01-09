"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";

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
    <section className="relative w-full bg-white overflow-hidden">
      <div
        className="flex flex-col items-center justify-center w-full"
        style={{ maxWidth: '1920px', margin: '0 auto' }}
      >
        {/* Container with padding matching template */}
        <div className="w-full px-6 md:px-10 py-24 md:py-[150px] flex flex-col gap-16 md:gap-20">

          {/* Section Header - Split layout */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full overflow-hidden">
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
              {title}
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
                {description}
              </p>
            </motion.div>
          </div>

          {/* Grid - 3 columns */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                <motion.div key={product.id} variants={itemVariants}>
                  <Link
                    href={`/product/${product.slug}`}
                    className="group block w-full cursor-pointer"
                  >
                    {/* Image Container with dual-image hover */}
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ aspectRatio: '0.8004484304932735 / 1' }}
                    >
                      {/* Primary Image */}
                      <motion.div
                        className="absolute inset-0 w-[101%] h-[101%]"
                        style={{
                          left: 'calc(49.85994397759106% - 101% / 2)',
                          top: 'calc(50.00000000000002% - 101% / 2)'
                        }}
                        initial={{ opacity: 1 }}
                        whileHover={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={primaryImage}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </motion.div>

                      {/* Secondary Image (shown on hover) */}
                      <motion.div
                        className="absolute inset-0 w-[101%] h-[101%]"
                        style={{
                          left: 'calc(49.85994397759106% - 101% / 2)',
                          top: 'calc(50.00000000000002% - 101% / 2)'
                        }}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={secondaryImage}
                          alt={`${product.title} - alternate view`}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col items-start pt-4 gap-1 overflow-hidden w-full">
                      {/* Product Info Row */}
                      <div className="flex flex-col gap-1 w-full">
                        {/* Product Title */}
                        <p
                          className="text-foreground"
                          style={{
                            fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                            fontSize: 'clamp(14px, 1.3vw, 16px)',
                            fontWeight: 400,
                            letterSpacing: '0.02em',
                            lineHeight: '140%'
                          }}
                        >
                          {product.title}
                        </p>

                        {/* Category */}
                        <p
                          className="text-muted-foreground uppercase"
                          style={{
                            fontFamily: '"Fragment Mono", monospace',
                            fontSize: '12px',
                            fontWeight: 400,
                            letterSpacing: '0.06em',
                            lineHeight: '140%'
                          }}
                        >
                          {category}
                        </p>
                      </div>

                      {/* Price Row */}
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-foreground"
                          style={{
                            fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            letterSpacing: '0.02em'
                          }}
                        >
                          ${formatPrice(product.price)}
                        </span>
                        {product.compare_at_price && product.compare_at_price > (product.price ?? 0) && (
                          <span
                            className="text-muted-foreground line-through"
                            style={{
                              fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                              fontSize: '14px',
                              fontWeight: 400
                            }}
                          >
                            ${formatPrice(product.compare_at_price)}
                          </span>
                        )}
                      </div>
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

export default ProductGridSection;
