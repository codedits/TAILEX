"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Minus, Plus, Star, Truck, ShieldCheck, AlertCircle } from "lucide-react";
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
import { Product, ProductOption } from "@/lib/types";

export default function ProductDetail({
  product,
  relatedProducts
}: {
  product: Product,
  relatedProducts: Product[]
}) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addItem } = useCart();

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

    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: productImages[0] || "",
      size: selectedOptions["Size"] || selectedOptions["size"] || selectedOptions["Name"] || "",
      quantity: quantity,
      slug: product.slug,
    } as any);

    toast({
      title: "Added to Cart",
      description: `${product.title} added.`,
    })
  };

  const handleOptionSelect = (name: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [name]: value }));
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  // Default product details
  const productDetails = [
    { title: "Material", content: "Cotton/Linen Blend" },
    { title: "Care", content: "Machine wash cold" }
  ];

  const stockCount = product.stock ?? 0;

  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;

  // Get images safely
  const productImages = (product.images || []).filter(isValidImage);
  if (productImages.length === 0 && isValidImage(product.cover_image)) {
    productImages.push(product.cover_image);
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
        {/* Image Gallery */}
        <div className="space-y-6">
          {/* Primary Image with Layout Transition */}
          <motion.div
            layoutId={`product-image-${product.slug}`}
            className="aspect-[3/4] relative overflow-hidden bg-secondary/30"
          >
            {productImages.length > 0 && (
              <Image
                src={productImages[0]}
                alt={`${product.title} view 1`}
                fill
                className="object-cover"
                priority
              />
            )}
          </motion.div>

          {/* Secondary Images */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {productImages.slice(1).map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="aspect-[3/4] relative overflow-hidden bg-secondary/30"
                >
                  <Image
                    src={image}
                    alt={`${product.title} view ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:sticky lg:top-32 h-fit">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-xl font-body text-foreground">
                  ${product.price?.toFixed(2)}
                </p>
                <div className="flex items-center gap-1">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">(128 reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground font-body leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Dynamic Product Options */}
            {product.options && product.options.map((option) => (
              <div key={option.id} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-display uppercase tracking-wider">{option.name}</h3>
                  {option.name.toLowerCase() === 'size' && (
                    <button className="text-xs underline text-muted-foreground hover:text-foreground">
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleOptionSelect(option.name, value)}
                      className={`min-w-12 h-12 px-4 flex items-center justify-center border transition-all ${selectedOptions[option.name] === value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground text-muted-foreground"
                        }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <div className="flex items-center border border-input w-32">
                  <button
                    onClick={decrementQuantity}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <MagneticButton className="flex-1" onClick={handleAddToCart}>
                  <div className="w-full py-3.5 bg-primary text-primary-foreground text-base font-medium rounded-md flex items-center justify-center h-full">
                    Add to Cart
                  </div>
                </MagneticButton>
              </div>

              {/* Stock Indicator */}
              {stockCount < 10 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  <span>Only {stockCount} items left in stock!</span>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-10 p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-muted-foreground text-xs">On orders over $75</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Secure Checkout</p>
                  <p className="text-muted-foreground text-xs">SSL Encrypted</p>
                </div>
              </div>
            </div>

            {/* Details Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {productDetails.map((detail: { title: string; content: string }, index: number) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm font-display uppercase tracking-wider">
                    {detail.title}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground leading-relaxed">
                    {detail.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>

      <ReviewsSection />
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
