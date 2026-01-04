"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import productJacket1 from "@/assets/product-jacket-1.jpg";
import productJacket2 from "@/assets/product-jacket-2.jpg";
import productTee1 from "@/assets/product-tee-1.jpg";
import productTee2 from "@/assets/product-tee-2.jpg";
import categoryPolo from "@/assets/category-polo.jpg";
import categoryShirts from "@/assets/category-shirts.jpg";

const allProducts = [
  {
    name: "Relaxed Linen Jacket",
    category: "JACKET",
    price: 69.00,
    imagePrimary: productJacket1,
    imageSecondary: productJacket2,
    href: "/product/relaxed-linen-jacket",
  },
  {
    name: "Basic Regular Fit Tee",
    category: "TEE",
    price: 19.00,
    imagePrimary: productTee1,
    imageSecondary: productTee2,
    href: "/product/basic-tee",
  },
  {
    name: "Classic Polo Shirt",
    category: "POLO",
    price: 35.00,
    imagePrimary: categoryPolo,
    imageSecondary: categoryPolo,
    href: "/product/classic-polo",
  },
  {
    name: "Oxford Cotton Shirt",
    category: "SHIRTS",
    price: 45.00,
    imagePrimary: categoryShirts,
    imageSecondary: categoryShirts,
    href: "/product/oxford-shirt",
  },
];

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const filteredProducts = allProducts.filter(
    p => p.category.toLowerCase() === slug.toLowerCase()
  );

  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="section-title text-foreground mb-4">{title} Collection</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Explore our selection of premium {slug} essentials.
          </p>
        </motion.div>
      </section>

      <section className="px-6 md:px-12 pb-20">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">No products found in this collection.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
