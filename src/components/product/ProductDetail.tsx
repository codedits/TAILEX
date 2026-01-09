"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Minus, 
  Plus, 
  Star, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  Heart,
  ChevronRight,
  Share2,
  Info
} from "lucide-react";
import ReviewsSection from "@/components/sections/ReviewsSection";
import RelatedProducts from "@/components/product/RelatedProducts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Product, ProductVariant, ProductOption } from "@/lib/types";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

export default function ProductDetail({
  product,
  relatedProducts
}: {
  product: Product,
  relatedProducts: Product[]
}) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  
  const { toast } = useToast();
  const { addItem } = useCart();

  // Initialize selected options with defaults
  useEffect(() => {
    if (product.options && Object.keys(selectedOptions).length === 0) {
      const defaults: Record<string, string> = {};
      product.options.forEach(opt => {
        if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
      });
      setSelectedOptions(defaults);
    }
  }, [product.options]);

  // Find matching variant based on selections
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    
    return product.variants.find(v => {
      const match1 = !v.option1_name || v.option1_value === selectedOptions[v.option1_name];
      const match2 = !v.option2_name || v.option2_value === selectedOptions[v.option2_name];
      const match3 = !v.option3_name || v.option3_value === selectedOptions[v.option3_name];
      return match1 && match2 && match3;
    }) || null;
  }, [selectedOptions, product.variants]);

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentSalePrice = selectedVariant?.sale_price ?? product.sale_price;
  const hasSale = !!currentSalePrice && currentSalePrice < currentPrice;
  const currentStock = selectedVariant?.inventory_quantity ?? product.stock ?? 0;
  const isOutOfStock = product.track_inventory && currentStock <= 0 && !product.allow_backorder;

  const handleAddToCart = () => {
    // Check if all options are selected
    const options = product.options || [];
    const missingOptions = options.filter(opt => !selectedOptions[opt.name]);

    if (missingOptions.length > 0) {
      toast({
        title: `Please select ${missingOptions[0].name}`,
        variant: "destructive",
      });
      return;
    }

    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This item is currently unavailable.",
        variant: "destructive",
      });
      return;
    }

    const variantLabel = Object.values(selectedOptions).join(" / ");
    
    // Construct a unique ID for the cart item
    const variantId = selectedVariant?.id;
    const uniqueId = variantId ? `${product.id}-${variantId}` : product.id;

    addItem({
      id: uniqueId,
      productId: product.id,
      variantId: variantId,
      name: product.title,
      price: currentSalePrice || currentPrice,
      image: selectedVariant?.image_url || productImages[0] || "",
      size: variantLabel,
      quantity: quantity,
      slug: product.slug,
    } as any);

    toast({
      title: "Added to Cart",
      description: `${product.title}${variantLabel ? ` (${variantLabel})` : ""} added.`,
    });
  };

  const handleOptionSelect = (name: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [name]: value }));
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? "Saved to Wishlist" : "Removed from Wishlist",
      description: product.title,
    });
  };

  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;
  const productImages = (product.images || []).filter(isValidImage);
  if (productImages.length === 0 && isValidImage(product.cover_image)) {
    productImages.push(product.cover_image);
  }

  // Shopify-style accordions
  const details = [
    { 
      title: "Details & Care", 
      content: product.description || "Premium quality product designed for longevity and style." 
    },
    { 
      title: "Shipping & Returns", 
      content: "Free standard shipping on orders over $150. Returns accepted within 30 days of delivery. Sustainable packaging used for all shipments." 
    },
    {
      title: "Specifications",
      content: product.metadata && Object.keys(product.metadata).length > 0 
        ? Object.entries(product.metadata).map(([k, v]) => `${k}: ${v}`).join(", ")
        : `SKU: ${selectedVariant?.sku || product.sku || "N/A"}`
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/collection" className="hover:text-foreground transition-colors">Catalog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar shrink-0 md:w-20">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative aspect-[3/4] w-20 md:w-full overflow-hidden border transition-all",
                      activeImageIndex === idx ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="grow relative aspect-[3/4] bg-secondary/20 overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  <Image
                    src={productImages[activeImageIndex] || "/placeholder.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Zoom pill (visual only) */}
              <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <Info className="w-3 h-3" /> Roll to Zoom
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information (Sticky) */}
        <div className="lg:col-span-5 h-fit lg:sticky lg:top-32">
          <div className="space-y-8">
            <header>
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {product.vendor || "TAILEX Standard"}
                </p>
                <div className="flex gap-4">
                  <button onClick={toggleFavorite} className="hover:text-primary transition-colors">
                    <Heart className={cn("w-5 h-5", isFavorite ? "fill-primary text-primary" : "")} />
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-display uppercase tracking-tight leading-none mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  {hasSale ? (
                    <>
                      <span className="text-2xl font-body text-primary">${currentSalePrice?.toFixed(2)}</span>
                      <span className="text-sm line-through text-muted-foreground">${currentPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-body text-foreground">${currentPrice.toFixed(2)}</span>
                  )}
                </div>
                {hasSale && (
                  <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded">
                    Sale
                  </span>
                )}
              </div>
            </header>

            {/* Product description (Truncated) */}
            <div className="text-sm font-body leading-relaxed text-muted-foreground max-w-md">
              <p>{product.short_description || product.description?.slice(0, 160) + "..."}</p>
            </div>

            {/* Variant Selectors */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-6 py-6 border-y border-border">
                {product.options.map((option) => (
                  <div key={option.id} className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        {option.name}: <span className="font-normal text-muted-foreground">{selectedOptions[option.name]}</span>
                      </span>
                      {option.name.toLowerCase() === 'size' && (
                        <button className="text-[10px] uppercase tracking-widest underline hover:opacity-70 transition-opacity">
                          Size Guide
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(option.name, value)}
                          className={cn(
                            "px-5 py-2.5 text-xs tracking-widest uppercase transition-all border",
                            selectedOptions[option.name] === value
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-muted-foreground text-foreground"
                          )}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Purchase Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-border h-14 bg-secondary/10">
                  <button 
                    onClick={decrementQuantity}
                    className="w-12 h-full flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-body text-sm select-none">{quantity}</span>
                  <button 
                    onClick={incrementQuantity}
                    className="w-12 h-full flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Main CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "flex-1 h-14 uppercase tracking-[0.2em] text-[11px] font-bold transition-all",
                    isOutOfStock 
                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                      : "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]"
                  )}
                >
                  {isOutOfStock ? "Sold Out" : "Add to Cart"}
                </button>
              </div>

              {/* Express Checkout Button */}
              <button 
                onClick={() => {
                   handleAddToCart();
                   router.push('/checkout');
                }}
                disabled={isOutOfStock}
                className="w-full h-14 border border-foreground uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-foreground hover:text-background transition-all disabled:opacity-50"
              >
                Buy it Now
              </button>

              {/* Stock Warning */}
              {currentStock > 0 && currentStock < 5 && (
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold text-center animate-pulse">
                  Only {currentStock} Left - Selling Fast
                </p>
              )}
            </div>

            {/* Shipping & Trust */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Free shipping on orders over $150</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>45-day easy returns policy</span>
              </div>
            </div>

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full pt-8">
              {details.map((detail, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-[11px] uppercase tracking-[0.3em] font-bold hover:no-underline py-4">
                    {detail.title}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed">
                    {detail.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-32 border-t border-border pt-20">
        <ReviewsSection />
      </div>

      {/* Recommended Section */}
      <div className="mt-32 mb-20">
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
