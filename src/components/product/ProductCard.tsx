"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useQuickView } from "@/context/QuickViewContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps extends Product {
  priority?: boolean;
}

const ProductCard = ({ priority = false, ...product }: ProductCardProps) => {
  const formatCurrency = useFormatCurrency();
  const { openQuickView } = useQuickView();
  const { addItem } = useCart();

  const { title, price, images, slug, cover_image, sale_price, tags, stock } = product;

  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;

  const imagePrimary = isValidImage(cover_image) ? cover_image : (images?.find(isValidImage) || "");
  const imageSecondary = images?.filter(isValidImage).find(img => img !== imagePrimary) || imagePrimary;
  const href = `/product/${slug}`;

  // Standardized e-commerce grid sizes for optimal performance
  const sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 300px";

  // Badges Logic
  const isSale = !!(sale_price && sale_price < price);
  const isNew = tags?.some(t => t.toLowerCase() === 'new');
  const discount = isSale ? Math.round(((price - (sale_price as number)) / price) * 100) : 0;
  const isLowStock = stock !== undefined && stock > 0 && stock <= 5;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product as Product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For products without options, add directly
    if (!product.options?.length) {
      addItem({
        id: product.id,
        productId: product.id,
        name: title,
        price: sale_price || price,
        image: imagePrimary,
        size: "",
        quantity: 1,
        slug: slug,
      } as any, true);
    } else {
      // Has options, open quick view for selection
      openQuickView(product as Product);
    }
  };

  return (
    <div className="product-card group relative flex flex-col w-full">
      {/* Image Container with Badges and Hover Icons */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3F3F3] mb-4">
        <Link href={href} className="absolute inset-0 z-10">
          <span className="sr-only">View {title}</span>
        </Link>

        {/* Sale Badge - Black Square Top Left */}
        {isSale && (
          <div className="absolute top-0 left-0 z-20 bg-black text-white text-[11px] font-bold px-2 py-1.5 leading-none shadow-sm">
            -{discount}%
          </div>
        )}

        {/* New Badge - White Square Top Left (Below Sale if both exist) */}
        {isNew && !isSale && (
          <div className="absolute top-0 left-0 z-20 bg-white text-black border border-black/10 text-[11px] font-bold px-2 py-1.5 leading-none shadow-sm uppercase tracking-tighter">
            New
          </div>
        )}

        {/* Low Stock Badge - Top Right */}
        {isLowStock && (
          <div className="absolute top-0 right-0 z-20 bg-red-500 text-white text-[10px] font-bold px-2 py-1.5 leading-none">
            Only {stock} left
          </div>
        )}

        {/* Images with Fade Effect */}
        <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
          {isValidImage(imagePrimary) && (
            <div className="absolute inset-0 transition-opacity duration-500 ease-in-out group-hover:opacity-0">
              <Image
                src={imagePrimary}
                alt={title}
                fill
                priority={priority}
                sizes={sizes}
                quality={80}
                className="object-cover"
              />
            </div>
          )}
          {isValidImage(imageSecondary) && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
              <Image
                src={imageSecondary}
                alt={`${title} alternate view`}
                fill
                sizes={sizes}
                quality={80}
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Circular Hover Icons (Cart & Quick View) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 opacity-0 translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-lg"
            aria-label="Add to bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            onClick={handleQuickView}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-lg"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Section - Centered */}
      <div className="flex flex-col items-center text-center px-2">
        {/* Title - Uppercase, Centered, Clean Sans */}
        <Link href={href} className="hover:opacity-60 transition-opacity">
          <h3 className="font-manrope text-xs md:text-sm font-medium uppercase tracking-[0.1em] text-neutral-800 leading-normal line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Price Section - Centered Price Line */}
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-manrope text-xs md:text-sm">
          {isSale ? (
            <>
              <span className="text-neutral-500 line-through decoration-neutral-500/50 whitespace-nowrap">
                {formatCurrency(price || 0)}
              </span>
              <span className="text-black font-bold whitespace-nowrap">
                {formatCurrency(sale_price || 0)}
              </span>
            </>
          ) : (
            <span className="text-neutral-800 font-medium whitespace-nowrap">
              {formatCurrency(price || 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

