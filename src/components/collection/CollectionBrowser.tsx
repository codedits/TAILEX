"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
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
import { Filter, Grid3X3, Grid2X2, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { Product, Collection } from "@/lib/types";

// Gender/Category options - like high-end fashion stores
const GENDER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'unisex', label: 'Unisex' },
] as const;

// Size filter options
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface CollectionBrowserProps {
  products: Product[];
  collections: Collection[];
  initialCollectionId?: string;
  showGenderTabs?: boolean;
}

export default function CollectionBrowser({ 
  products, 
  collections, 
  initialCollectionId,
  showGenderTabs = true 
}: CollectionBrowserProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCollectionId ? [initialCollectionId] : []);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState("featured");
  const [gridCols, setGridCols] = useState<2 | 3>(3); // Grid view toggle

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.price), 500);
  }, [products]);

  const toggleCategory = (collectionId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(collectionId)
        ? prev.filter((c) => c !== collectionId)
        : [...prev, collectionId]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedGender('all');
    setSelectedSizes([]);
    setPriceRange([0, maxPrice]);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (selectedGender !== 'all') count += 1;
    if (selectedSizes.length > 0) count += selectedSizes.length;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count += 1;
    return count;
  }, [selectedCategories, selectedGender, selectedSizes, priceRange, maxPrice]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Filter by collection (category_id)
        const matchesCategory =
          selectedCategories.length === 0 || selectedCategories.includes(product.category_id || '');
        
        // Filter by gender - check tags or product_type for gender info
        const matchesGender = selectedGender === 'all' || 
          product.tags?.some(tag => tag.toLowerCase() === selectedGender) ||
          product.product_type?.toLowerCase().includes(selectedGender);
        
        // Filter by price
        const matchesPrice =
          product.price >= priceRange[0] && product.price <= priceRange[1];
        
        return matchesCategory && matchesGender && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "price-asc": return a.price - b.price;
          case "price-desc": return b.price - a.price;
          case "newest": return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          case "name-asc": return a.title.localeCompare(b.title);
          case "name-desc": return b.title.localeCompare(a.title);
          default: return 0; // featured (default db order)
        }
      });
  }, [products, selectedCategories, selectedGender, priceRange, sortOption]);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Active:</span>
          {selectedCategories.map(catId => {
            const col = collections.find(c => c.id === catId);
            return col ? (
              <Badge key={catId} variant="secondary" className="cursor-pointer" onClick={() => toggleCategory(catId)}>
                {col.title} <X className="w-3 h-3 ml-1" />
              </Badge>
            ) : null;
          })}
          {selectedGender !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedGender('all')}>
              {selectedGender} <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-6">
            Clear all
          </Button>
        </div>
      )}

      {/* Collection Filter */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-widest mb-4 text-foreground/80">Collection</h4>
        <div className="space-y-3">
          {collections.map((col) => (
            <div key={col.id} className="flex items-center space-x-3">
              <Checkbox 
                id={`filter-${col.slug}`} 
                checked={selectedCategories.includes(col.id)}
                onCheckedChange={() => toggleCategory(col.id)}
              />
              <Label 
                htmlFor={`filter-${col.slug}`} 
                className="text-sm font-light cursor-pointer hover:text-foreground transition-colors"
              >
                {col.title}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Gender/Category Filter */}
      {showGenderTabs && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-widest mb-4 text-foreground/80">Category</h4>
          <div className="space-y-3">
            {GENDER_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <Checkbox 
                  id={`gender-${option.id}`}
                  checked={selectedGender === option.id}
                  onCheckedChange={() => setSelectedGender(selectedGender === option.id ? 'all' : option.id)}
                />
                <Label 
                  htmlFor={`gender-${option.id}`}
                  className="text-sm font-light cursor-pointer hover:text-foreground transition-colors"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Filter */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-widest mb-4 text-foreground/80">Size</h4>
        <div className="grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`py-2 px-3 text-xs border rounded transition-all ${
                selectedSizes.includes(size)
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border hover:border-foreground/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-widest mb-4 text-foreground/80">Price</h4>
        <Slider
          defaultValue={[0, maxPrice]}
          max={maxPrice}
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
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block space-y-8 sticky top-32 self-start h-fit">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-sm uppercase tracking-widest">Refine</h3>
          {activeFilterCount > 0 && (
            <Badge variant="outline" className="text-xs">{activeFilterCount}</Badge>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filter & Grid */}
      <div className="lg:col-span-3">
        {/* Toolbar - Like high-end stores */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
            
            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> 
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-display uppercase tracking-wider">Refine</SheetTitle>
                  <SheetDescription>Filter your search results</SheetDescription>
                </SheetHeader>
                <div className="mt-8">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-4">
            {/* Grid View Toggle - Desktop only */}
            <div className="hidden md:flex items-center gap-2 border-r border-border pr-4">
              <button
                onClick={() => setGridCols(2)}
                className={`p-2 transition-colors ${gridCols === 2 ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 transition-colors ${gridCols === 3 ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`grid-${gridCols}-${filteredProducts.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-y-12 gap-x-6 md:gap-x-8 ${
              gridCols === 2 
                ? 'grid-cols-1 sm:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-lg text-muted-foreground mb-2">No products match your filters.</p>
            <p className="text-sm text-muted-foreground/60 mb-6">Try adjusting your criteria.</p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
