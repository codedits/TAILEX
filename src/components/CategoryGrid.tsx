"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TextReveal } from "@/components/ui/text-reveal";
import { Collection } from "@/lib/types";

// Fallback image if none provided
const fallbackImage = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1400&auto=format&fit=crop";

interface CategoryGridProps {
  collections: Collection[];
}

const CategoryGrid = ({ collections }: CategoryGridProps) => {
  // Take top 4 or whatever
  const displayedCollections = collections.slice(0, 4);

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
          {displayedCollections.map((collection, index) => {
             // alternate sizes like original mock: 0->large, 1->small, 2->small, 3->large
             const isLarge = index % 4 === 0 || index % 4 === 3;
             const displayImage = (typeof collection.image_url === 'string' && collection.image_url.trim().length > 0)
               ? collection.image_url
               : fallbackImage;

             return (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`flex flex-col ${index % 2 === 1 ? "md:mt-32" : ""}`}
            >
              <Link href={`/collection?category=${collection.title}`} className="group block relative overflow-hidden bg-neutral-100">
                <div className={`relative w-full ${isLarge ? 'aspect-[4/5]' : 'aspect-[1/1]'}`}>
                  <Image
                    src={displayImage}
                    alt={collection.title}
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
                    {collection.title}
                  </h3>
                  <Link href={`/collection?category=${collection.title}`} className="text-xs font-bold tracking-widest uppercase border-b border-foreground pb-1 hover:opacity-50 transition-opacity">
                    Shop Now
                  </Link>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-sm font-light leading-relaxed">
                  {collection.description || "Discover the collection."}
                </p>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
