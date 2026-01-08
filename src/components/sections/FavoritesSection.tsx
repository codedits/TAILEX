"use client";

import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface FavoritesSectionProps {
  products: Product[];
}

const FavoritesSection = ({ products }: FavoritesSectionProps) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto py-24 md:py-32">
      {/* Split Section Header */}
      <div className="mb-16 md:mb-24 flex flex-col md:flex-row items-start justify-between gap-10">
        <h2 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9] max-w-xl">
          Proven Favorites
        </h2>
        <div className="max-w-md md:pt-4">
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            Trusted by thousands of customers. These pieces define versatility — perfect for workdays or weekends.
          </p>
        </div>
      </div>

      {/* Grid Layout - 3 columns as per reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
        {products.slice(0, 3).map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FavoritesSection;
