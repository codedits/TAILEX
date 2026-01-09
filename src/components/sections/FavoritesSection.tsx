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
    <section className="w-full py-12 md:py-20">
      <div className="px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto mb-10 flex items-center justify-between">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Trending Now
        </h2>
        <Link href="/collection/all" className="hidden md:flex items-center gap-2 text-sm font-medium hover:opacity-60 transition-opacity">
          Shop All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative w-full overflow-x-auto pb-12 hide-scrollbar">
        <div className="flex gap-6 px-4 md:px-8 w-max">
          {products.map((product) => (
            <div key={product.id} className="w-[280px] md:w-[350px] flex-shrink-0">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FavoritesSection;
