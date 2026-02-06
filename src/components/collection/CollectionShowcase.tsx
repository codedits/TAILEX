"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CollectionShowcaseCarousel } from "./CollectionShowcaseCarousel";
import { ScrollReveal } from "../animations/ScrollReveal";
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
    // Limit products for initial render
    const carouselProducts = products.slice(0, 8);
    const [imgSrc, setImgSrc] = useState(coverImage || "https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg");
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <section className={cn("w-full flex flex-col relative z-10 section-fade-in", className)}>
            {/* Section 1: The Collection Hero */}
            <ScrollReveal threshold={0.15} className="relative w-full h-[70vh] md:h-[115vh] overflow-hidden group bg-background">
                <div className="absolute inset-0 h-full w-full bg-neutral-900">
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className={`
                            object-cover transition-all duration-[1500ms] ease-out will-change-transform
                            ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"}
                        `}
                        onLoad={() => setImageLoaded(true)}
                        sizes="(max-width: 1920px) 100vw, 80vw"
                        quality={90}
                        loading="lazy"
                        onError={() => setImgSrc("https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg")}
                    />
                </div>

                {/* Content - Text Independent of Image */}
                <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center text-center px-4 md:px-6 text-white p-12">
                    <div className="space-y-6 max-w-4xl">
                        <h2
                            className={`
                                text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[200] uppercase tracking-[0.05em] leading-tight script-font
                                transition-all duration-700 delay-100
                                ${imageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                            `}
                        >
                            {title}
                        </h2>
                        {description && (
                            <p
                                className={`
                                    text-sm sm:text-base md:text-lg font-light tracking-wide text-white/90 text-balance max-w-2xl mx-auto leading-relaxed drop-shadow-md
                                    transition-all duration-700 delay-200
                                    ${imageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                                `}
                            >
                                {description}
                            </p>
                        )}
                        <div
                            className={`
                                pt-8 transition-all duration-700 delay-300
                                ${imageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                            `}
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
            </ScrollReveal>

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
