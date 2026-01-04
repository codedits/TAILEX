"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import productJacket1 from "@/assets/product-jacket-1.jpg";
import productJacket2 from "@/assets/product-jacket-2.jpg";
import productTee1 from "@/assets/product-tee-1.jpg";
import productTee2 from "@/assets/product-tee-2.jpg";
import productJeans1 from "@/assets/product-jeans-1.jpg";
import productJeans2 from "@/assets/product-jeans-2.jpg";
import categoryPolo from "@/assets/category-polo.jpg";
import categoryShirts from "@/assets/category-shirts.jpg";

const allProducts = [
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
  {
    name: "Classic Polo Shirt",
    category: "POLO",
    price: 35.00,
    imagePrimary: categoryPolo,
    imageSecondary: categoryPolo,
    href: "/product/classic-polo",
  },
  {
    name: "Oxford Cotton Shirt",
    category: "SHIRTS",
    price: 45.00,
    imagePrimary: categoryShirts,
    imageSecondary: categoryShirts,
    href: "/product/oxford-shirt",
  },
  {
    name: "Lightweight Jacket",
    category: "JACKET",
    price: 79.00,
    imagePrimary: productJacket2,
    imageSecondary: productJacket1,
    href: "/product/lightweight-jacket",
  },
];

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="section-title text-foreground mb-4">All Products</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Explore our complete collection of premium menswear essentials.
          </p>
        </motion.div>
      </section>

      {/* Filter & Products */}
      <section className="px-6 md:px-12 pb-20">
        {/* Simple Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-border/30 pb-6">
          {["All", "Jackets", "Shirts", "Tees", "Pants"].map((filter) => (
            <button
              key={filter}
              className={`font-body text-sm px-4 py-2 transition-colors ${
                filter === "All"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {allProducts.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
