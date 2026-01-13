import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCardServer } from "@/components/product/ProductCardServer";

interface CollectionShowcaseProps {
    title: string;
    description: string;
    coverImage: string;
    products: Product[];
    collectionHref: string;
    className?: string;
}

/**
 * CollectionShowcase - Server Component
 * 
 * Optimized for FCP/LCP:
 * - No "use client" - zero blocking JS
 * - CSS animations instead of Framer Motion
 * - NO priority image (only hero gets priority)
 * - Lazy loaded images with blur placeholder
 * - Limits products to 8 for initial render
 */
export default function CollectionShowcase({
    title,
    description,
    coverImage,
    products,
    collectionHref,
    className,
}: CollectionShowcaseProps) {
    // Limit products for initial render
    const carouselProducts = products.slice(0, 8);

    return (
        <section className={cn("w-full flex flex-col relative z-10 section-fade-in", className)}>
            {/* Section 1: The Collection Hero */}
            <div className="relative w-full h-screen min-h-[600px] overflow-hidden group bg-background">
                <div className="absolute inset-0 h-full w-full hero-image-animate">
                    <Image
                        src={coverImage || "https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg"}
                        alt={title}
                        fill
                        className="object-cover animate-ken-burns will-change-transform"
                        sizes="100vw"
                        quality={80}
                        loading="lazy"
                    />
                    {/* Gradients for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60 pointer-events-none" />
                </div>

                {/* Content - Text Independent of Image */}
                <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center text-center px-4 md:px-6 text-white z-10 p-12">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <h2 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl font-medium tracking-tight uppercase drop-shadow-lg font-display hero-text-animate">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-white/90 text-balance max-w-2xl mx-auto leading-relaxed drop-shadow-md hero-text-animate-delay">
                                {description}
                            </p>
                        )}
                        <div className="pt-8 hero-text-animate-delay-2">
                            <Link
                                href={collectionHref}
                                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] border-b border-white pb-1 hover:text-white/80 hover:border-white/80 transition-all font-medium"
                            >
                                View Collection
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: The Product Grid Carousel */}
            <div className="relative w-full py-8 md:py-12 px-4 md:px-8 bg-background border-t border-neutral-100 z-20">
                <div className="mb-6 md:mb-8 flex justify-end items-center px-2">
                    {/* Desktop "See All" Link */}
                    <Link href={collectionHref} className="hidden md:flex items-center gap-2 text-sm font-medium hover:opacity-60 transition-opacity">
                        See All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Horizontal Scroll Container - CSS only, no Embla */}
                <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -ml-4 md:-ml-6">
                    {carouselProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex-shrink-0 pl-4 md:pl-6 basis-[80%] sm:basis-[50%] md:basis-[40%] lg:basis-[30%] xl:basis-[25%] snap-start"
                        >
                            <ProductCardServer {...product} />
                        </div>
                    ))}

                    {/* "See More" Card */}
                    <div className="flex-shrink-0 pl-4 md:pl-6 basis-[80%] sm:basis-[50%] md:basis-[40%] lg:basis-[30%] xl:basis-[25%] snap-start">
                        <Link
                            href={collectionHref}
                            className="group/seemore relative flex flex-col items-center justify-center w-full aspect-[3/4] bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-all duration-500 ease-out"
                        >
                            <div className="flex flex-col items-center gap-4 transition-transform duration-500 group-hover/seemore:scale-110">
                                <span className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-900 text-center px-4">
                                    Discover<br />{title}
                                </span>
                                <div className="w-14 h-14 rounded-full border border-neutral-200 bg-white flex items-center justify-center transition-all duration-300 group-hover/seemore:bg-black group-hover/seemore:border-black group-hover/seemore:text-white shadow-sm">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
