"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/types";

interface ProductGridClientProps {
    products: Product[];
}

export function ProductGridClient({ products }: ProductGridClientProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-6 md:gap-y-16 md:gap-x-8"
        >
            {products.map((product, index) => (
                <motion.div key={product.id} variants={item}>
                    <ProductCard
                        {...product}
                        priority={index < 3}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
