"use client";

import Link from "next/link";
import Image from "next/image";
import { Collection } from "@/lib/types";

// Fallback image if none provided
const fallbackImage = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop";

interface CategoryGridProps {
  collections: Collection[];
}

const CategoryGrid = ({ collections }: CategoryGridProps) => {
  // Use first 4 active collections
  const items = collections.slice(0, 4);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto">
      {/* Split Section Header */}
      <div className="mb-16 md:mb-24 flex flex-col md:flex-row items-start justify-between gap-10">
        <h2 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9] max-w-xl">
          Everyday Essentials
        </h2>
        <div className="max-w-md md:pt-4">
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            Explore our best-selling categories — from crisp polos and refined shirts to versatile jackets and relaxed-fit trousers, made to elevate your everyday wardrobe.
          </p>
        </div>
      </div>

      {/* Grid Layout - Standard CSS Grid for stability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {items.map((collection, index) => {
          const imageUrl = collection.image_url || fallbackImage;

          // Stylistic variation: First item is tall, others are square-ish
          // Or simple alternating pattern.
          // Let's do a simple alternating aspect ratio pattern.
          const aspectClass = index === 0 || index === 3 ? "aspect-[4/5] md:aspect-[3/4]" : "aspect-square";

          return (
            <Link
              key={collection.id}
              href={`/collection/${collection.slug}`}
              className="group relative block overflow-hidden bg-neutral-100 dark:bg-neutral-900"
            >
              <div className={`relative w-full ${aspectClass}`}>
                <Image
                  src={imageUrl}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Text Overlay - Bottom Left */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-70" />

                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-2 transform translate-y-0 transition-transform duration-300 group-hover:-translate-y-1">
                    {collection.title}
                  </h3>
                  <p className="text-white/80 text-sm font-medium flex items-center gap-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Explore Collection &rarr;
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
