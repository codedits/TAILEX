"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, Star, ShoppingBag, Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
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

  const { title, price, images, slug, cover_image, sale_price, tags, id, review_count, average_rating, metadata, variants } = product;

  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;

  const imagePrimary = isValidImage(cover_image) ? cover_image : (images?.find(isValidImage) || "");
  const imageSecondary = images?.filter(isValidImage).find(img => img !== imagePrimary) || imagePrimary;
  const href = `/product/${slug}`;

  // Resolve blur placeholder
  const blurDataUrls = (metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined;
  const primaryBlur = blurDataUrls?.[imagePrimary] || undefined;

  const sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

  // Logic
  const isSale = !!(sale_price && sale_price < price);
  const isNew = tags?.some(t => t.toLowerCase() === 'new');
  const discount = isSale ? Math.round(((price - (sale_price as number)) / price) * 100) : 0;
  const isWishlisted = isInWishlist(id);
  const hasVariants = variants && variants.length > 0;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product as Product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasVariants) {
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
      openQuickView(product as Product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(id, title);
  };

  return (
    <div className="group relative flex flex-col w-full">
      {/* --- Image Container --- */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-sm"> {/* Standard fashion aspect ratio */}

        <Link href={href} className="absolute inset-0 z-10 block" aria-label={`View ${title}`}>
          {/* Images */}
          <div className="relative w-full h-full">
            {isValidImage(imagePrimary) && (
              <Image
                src={imagePrimary}
                alt={title}
                fill
                priority={priority}
                sizes={sizes}
                quality={80}
                placeholder={primaryBlur ? "blur" : "empty"}
                blurDataURL={primaryBlur}
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "object-cover transition-all duration-700 ease-in-out will-change-transform",
                  imageLoaded ? "opacity-100" : "opacity-0",
                  // Zoom effect on hover
                  "group-hover:scale-105"
                )}
              />
            )}
            {/* Secondary Image (Swap on Hover) */}
            {isValidImage(imageSecondary) && (
              <Image
                src={imageSecondary}
                alt=""
                fill
                sizes={sizes}
                quality={90}
                className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
              />
            )}
          </div>
        </Link>

        {/* --- Badges (Top Left) --- */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 pointer-events-none">
          {isSale && (
            <span className="bg-white/90 backdrop-blur-sm text-red-700 text-[10px] font-bold px-2 py-1 uppercase tracking-wide rounded-sm shadow-sm border border-red-100">
              -{discount}%
            </span>
          )}
          {isNew && !isSale && (
            <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wide rounded-sm shadow-sm">
              New
            </span>
          )}
        </div>

        {/* --- Floating Action Buttons (Top Right) --- */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
          {/* Wishlist */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm bg-white hover:bg-neutral-50",
              isWishlisted ? "text-red-500" : "text-neutral-500 hover:text-red-500"
            )}
            aria-label="Add to wishlist"
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>

          {/* Quick View (Desktop) */}
          <button
            onClick={handleQuickView}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-neutral-500 hover:text-black hover:bg-neutral-50 shadow-sm transition-colors md:flex hidden"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* --- Quick Add Button (Slide Up) --- */}
        <div className="absolute bottom-4 left-4 right-4 z-30 hidden md:block">
          <button
            onClick={handleQuickAdd}
            className={cn(
              "w-full py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md",
              "bg-white text-black hover:bg-black hover:text-white border border-transparent",
              // Animation: Slide up and fade in
              "translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            )}
          >
            {hasVariants ? "Choose Options" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* --- Product Info --- */}
      <div className="mt-4 flex flex-col space-y-1">
        <div className="flex justify-between items-start gap-4">
          <Link href={href} className="group/title">
            <h3 className="text-sm font-medium text-neutral-900 leading-snug transition-colors group-hover/title:text-neutral-600">
              {title}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex flex-col items-end shrink-0">
            {isSale ? (
              <div className="flex flex-col items-end">
                <span className="text-red-700 font-semibold text-sm">
                  {formatCurrency(sale_price || 0)}
                </span>
                <span className="text-neutral-400 text-xs line-through decoration-neutral-300">
                  {formatCurrency(price || 0)}
                </span>

              </div>
            ) : (
              <span className="text-neutral-900 font-medium text-sm">
                {formatCurrency(price || 0)}
              </span>
            )}
          </div>
        </div>

        {/* Reviews */}
        {(review_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="w-3 h-3 fill-neutral-900 text-neutral-900" />
            <span className="text-xs text-neutral-600 font-medium">{average_rating}</span>
            <span className="text-[10px] text-neutral-400">({review_count})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;