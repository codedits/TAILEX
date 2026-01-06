"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Product, Collection } from "@/lib/types";

export default function CollectionBrowser({ products, collections }: { products: Product[], collections: Collection[] }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortOption, setSortOption] = useState("featured");

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category || '');
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      return 0; // featured (default db order)
    });

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-display uppercase tracking-wider mb-4">Filters</h3>
        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Category</h4>
            <div className="space-y-2">
              {collections.map((col) => (
                <div key={col.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={col.slug} 
                    checked={selectedCategories.includes(col.title)}
                    onCheckedChange={() => toggleCategory(col.title)}
                  />
                  <Label htmlFor={col.slug} className="text-sm font-light cursor-pointer">
                    {col.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Price Range</h4>
            <Slider
              defaultValue={[0, 500]}
              max={500}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mb-4"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block space-y-8 sticky top-32 self-start h-fit">
            <FilterContent />
        </div>

        {/* Mobile Filter & Grid */}
        <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{filteredProducts.length} items</span>
                
                {/* Mobile Filter Sheet */}
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="w-4 h-4 mr-2" /> Filters
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your search</SheetDescription>
                    </SheetHeader>
                    <div className="mt-8">
                    <FilterContent />
                    </div>
                </SheetContent>
                </Sheet>
            </div>

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

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
            {filteredProducts.map((product, index) => (
                <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                <ProductCard {...product} />
                </motion.div>
            ))}
            </div>
             {filteredProducts.length === 0 && (
                <div className="py-20 text-center text-muted-foreground w-full col-span-full">
                    No products match your filters.
                </div>
            )}
        </div>
    </div>
  );
}
