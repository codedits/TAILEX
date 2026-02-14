"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { memo } from "react";

interface FeaturedGridProps {
  products: Product[];
}

/**
 * FeaturedGrid - Optimized Luxury Showcase
 * - Flush layout (no gaps between items)
 * - Minimalist, high-tracking typography
 * - Optimized image handling with hover scaling
 */
const FeaturedGrid = ({ products }: FeaturedGridProps) => {
  // Use first 4 products to match the requested 4-column layout
  const displayProducts = products.length > 0 ? products.slice(0, 4) : [];

  // Fallback items if no products are found in the database
  const fallbackItems = [
    { id: '1', title: 'OUTERWEAR', slug: 'outerwear', cover_image: '' },
    { id: '2', title: 'KNITWEAR', slug: 'knitwear', cover_image: '' },
    { id: '3', title: 'SHIRTS', slug: 'shirts', cover_image: '' },
    { id: '4', title: 'PANTS', slug: 'pants', cover_image: '' }
  ] as any[];

  const itemsToRender = displayProducts.length > 0 ? displayProducts : fallbackItems;

  return (
    <section className="relative w-full h-[70vh] bg-black overflow-hidden z-10">
      <div className="flex h-full w-full overflow-x-auto no-scrollbar md:snap-x md:snap-mandatory md:grid md:grid-cols-4 md:gap-0 md:overflow-visible">
        {itemsToRender.map((product) => {
          const image = product.cover_image || (product.images && product.images?.[0]) || "";
          
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group relative flex-none w-[100vw] sm:w-[50vw] md:w-full h-full md:snap-start overflow-hidden bg-neutral-900 shadow-none border-none"
            >
              {image ? (
                <Image
                  src={image}
                  alt={product.title}
                  fill
                  className="object-cover opacity-90 transition-transform duration-&lsqb;1200ms&rsqb; ease-&lsqb;cubic-bezier(.22,.9,.34,1)&rsqb; group-hover:scale-105 will-change-transform"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={75}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
                   <div className="w-[1px] h-6 bg-white/10" />
                </div>
              )}
              
              {/* Subtle Luxury Overlays */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-&lsqb;1200ms&rsqb;" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 transition-opacity duration-&lsqb;1200ms&rsqb;" />
              
              {/* Text Content - Luxury Minimalist Style */}
              <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                <h3 className="text-white text-[14px] md:text-[18px] lg:text-[24px] font-thin tracking-[0.45em] uppercase transition-all duration-700 group-hover:tracking-[0.6em] opacity-95">
                  {product.title}
                </h3>
              </div>

              {/* Minimalist Bottom Indicator */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white/40 transition-all duration-&lsqb;1.2s&rsqb; group-hover:w-10" />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default memo(FeaturedGrid);
