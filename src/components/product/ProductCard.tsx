import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductCardProps extends Product {
  priority?: boolean;
}

const ProductCard = ({ priority = false, ...product }: ProductCardProps) => {
  const { title, price, images, slug, cover_image, category, compare_at_price, tags, options } = product;

  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;

  const imagePrimary = isValidImage(cover_image) ? cover_image : (images?.find(isValidImage) || "");
  const imageSecondary = images?.filter(isValidImage).find(img => img !== imagePrimary) || imagePrimary;
  const href = `/product/${slug}`;

  // Aggressive oversampling for high-DPI mobile screens
  const sizes = "(max-width: 768px) 150vw, (max-width: 1200px) 50vw, 33vw";

  // Badges Logic
  const isSale = compare_at_price && compare_at_price > price;
  const isNew = tags?.some(t => t.toLowerCase() === 'new');
  const discount = isSale ? Math.round(((compare_at_price - price) / compare_at_price) * 100) : 0;

  // Color Options
  const colorOption = options?.find(opt => opt.name.toLowerCase() === 'color');
  const colors = colorOption?.values || [];

  return (
    <Link href={href} className="product-card block group relative w-full h-full flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-sm mb-2">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-30 flex flex-col gap-2">
          {isNew && (
            <span className="bg-white text-black text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 md:px-2 md:py-1 shadow-sm border border-black">
              New
            </span>
          )}
          {isSale && (
            <span className="bg-[#D03030] text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 md:px-2 md:py-1 shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Images Container with Zoom Effect */}
        <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
          {isValidImage(imagePrimary) && (
            <div className="absolute inset-0 z-10 transition-opacity duration-500 ease-in-out group-hover:opacity-0">
              <Image
                src={imagePrimary}
                alt={title}
                fill
                priority={priority}
                sizes={sizes}
                quality={95}
                className="object-cover"
              />
            </div>
          )}
          {isValidImage(imageSecondary) && (
            <div className="absolute inset-0 z-0">
              <Image
                src={imageSecondary}
                alt={`${title} alternate view`}
                fill
                sizes={sizes}
                quality={95}
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Quick Add Button Overlay - Slide Up */}
        <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hidden md:block">
          <Button variant="secondary" className="w-full bg-white/90 backdrop-blur-sm text-black hover:bg-white shadow-xl uppercase tracking-wider text-xs h-10 font-bold border border-black transition-all hover:scale-[1.02]">
            <ShoppingBag className="w-3 h-3 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 w-full flex-1">
        {/* Swatches - Centered below image */}
        <div className="h-4 flex items-center justify-center">
          {colors.length > 0 ? (
            <div className="flex items-center space-x-1">
              {colors.slice(0, 3).map((color, i) => (
                <div
                  key={color}
                  className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {colors.length > 3 && (
                <span className="text-[9px] text-muted-foreground pl-0.5">
                  +{colors.length - 3}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Title */}
        <div className="text-center w-full px-1">
          <h3 className="font-manrope text-base md:text-xl font-black text-foreground leading-tight tracking-tight line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 font-manrope text-sm md:text-base tracking-wide justify-center pb-1">
          <span className={isSale ? "text-[#D03030] font-bold" : "text-foreground font-bold"}>
            ${price?.toFixed(2)}
          </span>
          {isSale && (
            <span className="text-muted-foreground/60 line-through text-xs">
              ${compare_at_price?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
