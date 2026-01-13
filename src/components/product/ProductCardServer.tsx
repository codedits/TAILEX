import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductCardServerProps extends Product {
    priority?: boolean;
}

/**
 * ProductCardServer - Server Component
 * 
 * SSR-compatible product card without client-side hooks.
 * Uses static currency formatting (can be hydrated client-side if needed).
 * For interactive features, wrap in a client component island.
 */
const ProductCardServer = ({ priority = false, ...product }: ProductCardServerProps) => {
    const { title, price, images, slug, cover_image, sale_price, tags } = product;

    const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;

    const imagePrimary = isValidImage(cover_image) ? cover_image : (images?.find(isValidImage) || "");
    const imageSecondary = images?.filter(isValidImage).find(img => img !== imagePrimary) || imagePrimary;
    const href = `/product/${slug}`;

    // Proper responsive sizes for product cards
    const sizes = "(max-width: 640px) 80vw, (max-width: 768px) 50vw, (max-width: 1024px) 40vw, 25vw";

    // Badges Logic
    const isSale = !!(sale_price && sale_price < price);
    const isNew = tags?.some(t => t.toLowerCase() === 'new');
    const discount = isSale ? Math.round(((price - (sale_price as number)) / price) * 100) : 0;

    // Static currency formatting for SSR (USD default, can be overridden)
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="product-card group relative flex flex-col w-full">
            {/* Image Container with Badges and Hover Icons */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3F3F3] mb-4">
                <Link href={href} className="absolute inset-0 z-10">
                    <span className="sr-only">View {title}</span>
                </Link>

                {/* Sale Badge - Red Square Top Left */}
                {isSale && (
                    <div className="absolute top-0 left-0 z-20 bg-[#D03030] text-white text-[11px] font-bold px-2 py-1.5 leading-none shadow-sm">
                        -{discount}%
                    </div>
                )}

                {/* New Badge - White Square Top Left (Below Sale if both exist) */}
                {isNew && !isSale && (
                    <div className="absolute top-0 left-0 z-20 bg-white text-black border border-black/10 text-[11px] font-bold px-2 py-1.5 leading-none shadow-sm uppercase tracking-tighter">
                        New
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
                                loading={priority ? undefined : "lazy"}
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
                                loading="lazy"
                                className="object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* Circular Hover Icons (Cart & Search) - Static, can be hydrated */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 opacity-0 translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        aria-label="Add to bag"
                    >
                        <ShoppingBag className="w-4 h-4 text-neutral-600" />
                    </button>
                    <button
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        aria-label="Quick view"
                    >
                        <Search className="w-4 h-4 text-neutral-600" />
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
                <div className="mt-1.5 flex items-center justify-center gap-3 font-manrope text-xs md:text-sm">
                    {isSale ? (
                        <>
                            <span className="text-neutral-500 line-through decoration-neutral-500/50">
                                {formatPrice(price || 0)}
                            </span>
                            <span className="text-[#D03030] font-bold">
                                {formatPrice(sale_price || 0)}
                            </span>
                        </>
                    ) : (
                        <span className="text-neutral-800 font-medium">
                            {formatPrice(price || 0)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export { ProductCardServer };
export default ProductCardServer;
