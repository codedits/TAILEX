"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";

interface FavoritesSectionProps {
  products: Product[];
}

const FavoritesSection = ({ products }: FavoritesSectionProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-background">
      <motion.div 
        className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 lg:gap-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Section Header - Left Side */}
        <motion.div
          variants={itemVariants}
          className="lg:max-w-xs lg:sticky lg:top-32"
        >
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-4">Shop the Collection</h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            Trusted by thousands of customers. <span className="font-medium text-foreground">These pieces define versatility</span> — perfect for workdays or weekends.
          </p>
        </motion.div>

        {/* Products Grid - Right Side */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FavoritesSection;
