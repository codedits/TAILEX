"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import type { StaticImageData } from "next/image";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  imagePrimary: string | StaticImageData;
  imageSecondary: string | StaticImageData;
  href: string;
}

const ProductCard = ({
  name,
  category,
  price,
  imagePrimary,
  imageSecondary,
  href,
}: ProductCardProps) => {
  // Generate a unique ID for the layout transition based on the product slug/href
  const slug = href.split('/').pop();
  
  return (
    <Link href={href} className="product-card block group">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20 mb-4">
        <motion.div 
          layoutId={`product-image-${slug}`}
          className="absolute inset-0 z-10"
        >
          <Image
            src={imagePrimary}
            alt={name}
            fill
            className="object-cover transition-opacity duration-500 opacity-100 group-hover:opacity-0"
          />
        </motion.div>
        <div className="absolute inset-0 z-0">
           <Image
            src={imageSecondary}
            alt={`${name} alternate view`}
            fill
            className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-base md:text-lg text-foreground leading-tight">
          {name}
        </h3>
        <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
          {category}
        </p>
        <p className="font-body text-sm text-foreground">
          $ {price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
