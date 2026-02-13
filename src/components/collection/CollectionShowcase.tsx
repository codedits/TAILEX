"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

const CollectionShowcaseCarousel = dynamic(
    () => import('./CollectionShowcaseCarousel').then(mod => mod.CollectionShowcaseCarousel),
    {
        loading: () => <div className="w-full h-96 bg-neutral-50 animate-pulse" />
    }
);
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useState } from "react";

interface CollectionShowcaseProps {
    title: string;
    description: string;
    coverImage: string;
    products: Product[];
    collectionHref: string;
    className?: string;
}

/**
 * CollectionShowcase
 * 
 * Optimized for FCP/LCP:
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
    const { ref: heroRef, isVisible: isHeroVisible } = useScrollReveal({ threshold: 0.1 });
    const { ref: contentRef, isVisible: isContentVisible } = useScrollReveal({ threshold: 0.2 });

    // Limit products for initial render
    const carouselProducts = products.slice(0, 8);
    const [imgSrc, setImgSrc] = useState(coverImage || "https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg");

    return (
        <section className={cn("w-full flex flex-col relative z-10", className)}>
            {/* Section 1: The Collection Hero */}
            <div className="relative w-full h-[70vh] md:h-[115vh] overflow-hidden group bg-background" ref={heroRef}>
                <div
                    className={cn(
                        "absolute inset-0 h-full w-full bg-white",
                        isHeroVisible ? "animate-image-entrance" : "opacity-0 scale-[1.5]"
                    )}
                >
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        quality={80}
                        loading="lazy"
                        onError={() => setImgSrc("https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg")}
                    />
                </div>

                {/* Content - Text Independent of Image */}
                <div
                    ref={contentRef}
                    className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center text-center px-4 md:px-6 text-white p-12 z-10"
                >
                    <div className="space-y-6 max-w-4xl">
                        <h2
                            className={cn(
                                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[200] uppercase tracking-[0.05em] leading-tight script-font",
                                isContentVisible ? "hero-text" : "opacity-0 translate-y-[30px]"
                            )}
                        >
                            {title}
                        </h2>
                        {description && (
                            <p
                                className={cn(
                                    "text-sm sm:text-base md:text-lg font-light tracking-wide text-white/90 text-balance max-w-2xl mx-auto leading-relaxed drop-shadow-md",
                                    isContentVisible ? "hero-subtext" : "opacity-0 translate-y-[30px]"
                                )}
                            >
                                {description}
                            </p>
                        )}
                        <div
                            className={cn(
                                "pt-8",
                                isContentVisible ? "hero-cta" : "opacity-0 translate-y-[30px]"
                            )}
                        >
                            <Link
                                href={collectionHref}
                                className="inline-flex items-center gap-2 text-[9px] md:text-[11px] uppercase tracking-[0.08em] border-b border-white pb-1 hover:text-white/80 hover:border-white/80 transition-all font-medium"
                            >
                                View Collection
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: The Product Grid Carousel */}
            <div className="relative w-full py-4 md:py-8 px-4 md:px-8 bg-background border-t border-neutral-100 z-20">
                <div className="mb-4 md:mb-6 flex justify-end items-center px-2">
                    {/* Desktop "See All" Link */}
                    <Link href={collectionHref} className="hidden md:flex items-center gap-2 text-sm font-medium hover:opacity-60 transition-opacity">
                        See All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Carousel Component - Uses Embla for drag-to-scroll support */}
                <CollectionShowcaseCarousel
                    products={carouselProducts}
                    collectionHref={collectionHref}
                    title={title}
                />
            </div>
        </section>
    );
}
