import { Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import { Suspense } from "react";

interface AsyncProductGridProps {
    productsPromise: Promise<Product[]> | PromiseLike<Product[]>;
}

export default async function AsyncProductGrid({ productsPromise }: AsyncProductGridProps) {
    // Await the data streaming in
    const products = await productsPromise;

    if (products.length === 0) {
        return (
            <div className="py-32 text-center col-span-full">
                <p className="text-xl font-light text-white mb-2 tracking-wide font-display">No pieces found.</p>
                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    {...product}
                    // Priority loading for LCP (first 2-3 items)
                    priority={index < 3}
                />
            ))}
        </div>
    );
}
