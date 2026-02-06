"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye, Heart, Star, Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useQuickView } from "@/context/QuickViewContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps extends Product {
  priority?: boolean;
}

const ProductCard = ({ priority = false, ...product }: ProductCardProps) => {
  const formatCurrency = useFormatCurrency();
  const { openQuickView } = useQuickView();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { title, price, images, slug, cover_image, sale_price, tags, stock, id, review_count, average_rating } = product;

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

  // Wishlist state
  const isWishlisted = isInWishlist(id);

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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(id, title);
  };

  return (
    <div className="product-card group relative flex flex-col w-full h-full bg-white">
      {/* Image Container with Badges and Hover Icons */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F9F9F9] transition-all duration-500">
        <Link href={href} className="absolute inset-0 z-10">
          <span className="sr-only">View {title}</span>
        </Link>

        {/* Badges - Shopify Style (Pills) */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {isSale && (
            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Sale
            </div>
          )}
          {isNew && !isSale && (
            <div className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              New
            </div>
          )}
        </div>

        {/* Wishlist Heart Button - Top Right */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
            isWishlisted
              ? "text-red-500"
              : "text-neutral-400 hover:text-red-500"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-all duration-300",
              isWishlisted && "fill-current"
            )}
          />
        </button>

        {/* Low Stock Badge */}
        {isLowStock && (
          <div className="absolute top-3 right-12 z-20 bg-orange-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            Low Stock
          </div>
        )}

        {/* Images with Fade Effect */}
        <div className="relative w-full h-full">
          {isValidImage(imagePrimary) && (
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
              <Image
                src={imagePrimary}
                alt={title}
                fill
                priority={priority}
                sizes={sizes}
                quality={85}
                onLoad={() => setImageLoaded(true)}
                className="object-cover transition-transform duration-700"
              />
            </div>
          )}
          {isValidImage(imageSecondary) && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out">
              <Image
                src={imageSecondary}
                alt={`${title} alternate view`}
                fill
                sizes={sizes}
                quality={85}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}
        </div>

        {/* Shopify-Style Bottom Quick Add Button */}
        <div className="absolute bottom-4 left-4 right-4 z-30 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-white hover:bg-black hover:text-white text-black text-xs font-bold py-3 rounded-full shadow-xl transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 border border-neutral-100"
          >
            <Plus className="w-3 h-3" />
            Quick Add
          </button>
        </div>

        {/* Quick View Mini Button */}
        <button
          onClick={handleQuickView}
          className="absolute bottom-20 right-4 z-30 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75 hover:bg-neutral-50"
          aria-label="Quick view"
        >
          <Eye className="w-4 h-4 text-neutral-600" />
        </button>
      </div>

      {/* Info Section - Left Aligned Shopify Style */}
      <div className="flex flex-col pt-4 pb-2 px-1">
        {/* Title */}
        <Link href={href} className="group/title">
          <h3 className="font-manrope text-sm font-medium text-neutral-800 leading-tight group-hover/title:underline underline-offset-4 decoration-neutral-300 transition-all">
            {title}
          </h3>
        </Link>

        {/* Reviews Integration */}
        {review_count && review_count > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-2.5 h-2.5",
                    star <= Math.round(average_rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-200"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-neutral-400">({review_count})</span>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-2 flex items-baseline gap-2 font-manrope">
          {isSale ? (
            <>
              <span className="text-red-600 font-bold text-sm">
                {formatCurrency(sale_price || 0)}
              </span>
              <span className="text-neutral-400 line-through text-xs">
                {formatCurrency(price || 0)}
              </span>
            </>
          ) : (
            <span className="text-neutral-900 font-medium text-sm">
              {formatCurrency(price || 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
