"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function ProductFeed({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <section className="px-6 md:px-12 pb-20">
        {/* Products Grid */}
        {initialProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {initialProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </div>
        ) : (
            <div className="py-20 text-center text-muted-foreground">
                No products found.
            </div>
        )}
    </section>
  );
}
