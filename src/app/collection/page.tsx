"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import categoryPolo from "@/assets/category-polo.jpg";
import categoryShirts from "@/assets/category-shirts.jpg";
import categoryTee from "@/assets/category-tee.jpg";
import categoryJacket from "@/assets/category-jacket.jpg";

const collections = [
  { name: "Polo", image: categoryPolo, href: "/collection/polo", count: 12 },
  { name: "Shirts", image: categoryShirts, href: "/collection/shirts", count: 24 },
  { name: "Tee", image: categoryTee, href: "/collection/tee", count: 18 },
  { name: "Jacket", image: categoryJacket, href: "/collection/jacket", count: 8 },
];

export default function CollectionPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="section-title text-foreground mb-4">Collections</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Browse our curated collections of premium essentials.
          </p>
        </motion.div>
      </section>

      <section className="px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={collection.href} className="group block relative aspect-[16/9] overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                  <h2 className="text-3xl md:text-4xl font-display mb-2">{collection.name}</h2>
                  <p className="text-sm font-body opacity-80">{collection.count} Products</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
