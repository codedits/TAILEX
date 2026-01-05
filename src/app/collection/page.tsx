"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import categoryPolo from "@/assets/category-polo.jpg";
import categoryShirts from "@/assets/category-shirts.jpg";
import categoryTee from "@/assets/category-tee.jpg";
import categoryJacket from "@/assets/category-jacket.jpg";
import productJacket1 from "@/assets/product-jacket-1.jpg";
import productJacket2 from "@/assets/product-jacket-2.jpg";

const collections = [
  { name: "Polo", image: categoryPolo, href: "/collection/polo", count: 12 },
  { name: "Shirts", image: categoryShirts, href: "/collection/shirts", count: 24 },
  { name: "Tee", image: categoryTee, href: "/collection/tee", count: 18 },
  { name: "Jacket", image: categoryJacket, href: "/collection/jacket", count: 8 },
];

// Mock Products Data
const allProducts = [
  {
    id: "1",
    name: "Relaxed Linen Jacket",
    category: "Jacket",
    price: 69.00,
    imagePrimary: productJacket1,
    imageSecondary: productJacket2,
    href: "/product/relaxed-linen-jacket",
  },
  {
    id: "2",
    name: "Classic Cotton Tee",
    category: "Tee",
    price: 35.00,
    imagePrimary: categoryTee,
    imageSecondary: categoryTee,
    href: "/product/classic-cotton-tee",
  },
  {
    id: "3",
    name: "Slim Fit Polo",
    category: "Polo",
    price: 45.00,
    imagePrimary: categoryPolo,
    imageSecondary: categoryPolo,
    href: "/product/slim-fit-polo",
  },
  {
    id: "4",
    name: "Oxford Shirt",
    category: "Shirts",
    price: 55.00,
    imagePrimary: categoryShirts,
    imageSecondary: categoryShirts,
    href: "/product/oxford-shirt",
  },
  {
    id: "5",
    name: "Summer Linen Shirt",
    category: "Shirts",
    price: 60.00,
    imagePrimary: categoryShirts,
    imageSecondary: categoryShirts,
    href: "/product/summer-linen-shirt",
  },
  {
    id: "6",
    name: "Everyday Tee",
    category: "Tee",
    price: 25.00,
    imagePrimary: categoryTee,
    imageSecondary: categoryTee,
    href: "/product/everyday-tee",
  },
];

export default function CollectionPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortOption, setSortOption] = useState("featured");

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = allProducts
    .filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      return 0; // featured
    });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="section-title text-foreground mb-4">Collections</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Browse our curated collections of premium essentials.
          </p>
        </motion.div>
      </section>

      <section className="px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={collection.href} className="group block relative aspect-[16/9] overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                  <h2 className="text-3xl md:text-4xl font-display mb-2">{collection.name}</h2>
                  <p className="text-sm font-body opacity-80">{collection.count} Products</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Separator className="mb-12" />

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 space-y-8">
            <div>
              <h3 className="font-display uppercase tracking-wider mb-4">Filters</h3>
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Category</h4>
                  <div className="space-y-2">
                    {["Jacket", "Tee", "Polo", "Shirts"].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Price Range</h4>
                  <Slider
                    defaultValue={[0, 100]}
                    max={200}
                    step={1}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No products found matching your filters.</p>
                    <Button 
                        variant="link" 
                        onClick={() => {
                            setSelectedCategories([]);
                            setPriceRange([0, 100]);
                        }}
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
