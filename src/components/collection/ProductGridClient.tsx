"use client";


import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/types";

interface ProductGridClientProps {
    products: Product[];
}

export function ProductGridClient({ products }: ProductGridClientProps) {
    return (
        <div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-6 md:gap-y-16 md:gap-x-8"
        >
            {products.map((product, index) => (
                <div
                    key={product.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                    <ProductCard
                        {...product}
                        priority={index < 3}
                    />
                </div>
            ))}
        </div>
    );
}
