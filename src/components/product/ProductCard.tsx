"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

const ProductCard = (product: Product) => {
  // Generate a unique ID for the layout transition based on the product slug
  const { title, price, images, slug, cover_image } = product;
  
  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;
  
  const imagePrimary = isValidImage(cover_image) ? cover_image : (images?.find(isValidImage) || "");
  const imageSecondary = images?.filter(isValidImage).find(img => img !== imagePrimary) || imagePrimary;
  const href = `/product/${slug}`;

  return (
    <Link href={href} className="product-card block group relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20 mb-4">
        {isValidImage(imagePrimary) && (
          <motion.div 
            layoutId={`product-image-${slug}`}
            className="absolute inset-0 z-10"
          >
            <Image
              src={imagePrimary}
              alt={title}
              fill
              className="object-cover transition-opacity duration-500 opacity-100 group-hover:opacity-0"
            />
          </motion.div>
        )}
        {isValidImage(imageSecondary) && (
           <div className="absolute inset-0 z-0">
             <Image
              src={imageSecondary}
              alt={`${title} alternate view`}
              fill
              className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            />
          </div>
        )}
        
        {/* Quick Add Button Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Button className="w-full bg-white text-black hover:bg-neutral-100 shadow-lg uppercase tracking-wider text-xs h-10">
            <ShoppingBag className="w-3 h-3 mr-2" />
            View Product
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-base md:text-lg text-foreground leading-tight group-hover:underline decoration-1 underline-offset-4">
          {title}
        </h3>
        <p className="font-body text-sm text-foreground">
          $ {price?.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
