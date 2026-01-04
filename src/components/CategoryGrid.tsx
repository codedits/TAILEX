"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TextReveal } from "@/components/ui/text-reveal";
import categoryPolo from "@/assets/category-polo.jpg";
import categoryShirts from "@/assets/category-shirts.jpg";
import categoryTee from "@/assets/category-tee.jpg";
import categoryJacket from "@/assets/category-jacket.jpg";

const categories = [
  { 
    name: "The Polo", 
    image: categoryPolo, 
    href: "/collection/polo",
    description: "Refined essentials for the modern wardrobe.",
    size: "large" 
  },
  { 
    name: "Outerwear", 
    image: categoryJacket, 
    href: "/collection/jacket",
    description: "Architectural silhouettes for every season.",
    size: "small"
  },
  { 
    name: "Essential Tees", 
    image: categoryTee, 
    href: "/collection/tee",
    description: "The foundation of everyday luxury.",
    size: "small"
  },
  { 
    name: "Shirting", 
    image: categoryShirts, 
    href: "/collection/shirts",
    description: "Precision tailoring meets effortless style.",
    size: "large"
  },
];

const CategoryGrid = () => {
  return (
    <section className="py-24 md:py-40 px-6 md:px-12 bg-background">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-20 md:mb-32">
         

          {/* Large editorial tagline (split lines) */}
          <div className="mt-8 md:mt-10 text-left leading-[0.85]">
            <TextReveal variant="stagger" className="block text-[10vw] md:text-[6rem] lg:text-[8rem] font-extrabold tracking-tight uppercase">
              Premium
            </TextReveal>
            <TextReveal variant="stagger" delay={0.08} className="block text-[10vw] md:text-[6rem] lg:text-[8rem] font-extrabold tracking-tight uppercase">
              Collection
            </TextReveal>
          </div>

          <div className="h-px w-full bg-foreground/10 mt-6" />
        </div>

        {/* Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`flex flex-col ${index % 2 === 1 ? "md:mt-32" : ""}`}
            >
              <Link href={category.href} className="group block relative overflow-hidden bg-neutral-100">
                <div className={`relative w-full ${category.size === 'large' ? 'aspect-[4/5]' : 'aspect-[1/1]'}`}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                </div>
                
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </Link>

              <div className="mt-8 flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight uppercase">
                    {category.name}
                  </h3>
                  <Link href={category.href} className="text-xs font-bold tracking-widest uppercase border-b border-foreground pb-1 hover:opacity-50 transition-opacity">
                    Shop Now
                  </Link>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-sm font-light leading-relaxed">
                  {category.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
