"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import productJacket1 from "@/assets/product-jacket-1.jpg";
import productJacket2 from "@/assets/product-jacket-2.jpg";
import productTee1 from "@/assets/product-tee-1.jpg";
import productTee2 from "@/assets/product-tee-2.jpg";
import productJeans1 from "@/assets/product-jeans-1.jpg";
import productJeans2 from "@/assets/product-jeans-2.jpg";

const products = [
  {
    name: "Relaxed Linen Jacket",
    category: "JACKET",
    price: 69.00,
    imagePrimary: productJacket1,
    imageSecondary: productJacket2,
    href: "/product/relaxed-linen-jacket",
  },
  {
    name: "Basic Regular Fit Tee",
    category: "TEE",
    price: 19.00,
    imagePrimary: productTee1,
    imageSecondary: productTee2,
    href: "/product/basic-tee",
  },
  {
    name: "Baggy Denim Trousers",
    category: "PANTS",
    price: 49.00,
    imagePrimary: productJeans1,
    imageSecondary: productJeans2,
    href: "/product/baggy-denim",
  },
];

const FavoritesSection = () => {
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
              key={product.name}
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
