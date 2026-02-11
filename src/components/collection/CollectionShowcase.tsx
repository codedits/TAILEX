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
import { m } from "framer-motion";
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

    return (
        <section className={cn("w-full flex flex-col relative z-10", className)}>
            {/* Section 1: The Collection Hero */}
            <div className="relative w-full h-[70vh] md:h-[115vh] overflow-hidden group bg-background">
                <m.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full bg-white"
                >
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 1080px"
                        quality={75}
                        loading="lazy"
                        onError={() => setImgSrc("https://framerusercontent.com/images/BjQfJy7nQoVxvCYTFzwZxprDWiQ.jpg")}
                    />
                </m.div>

                {/* Content - Text Independent of Image */}
                <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center text-center px-4 md:px-6 text-white p-12 z-10">
                    <m.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.2,
                                    delayChildren: 0.3
                                }
                            }
                        }}
                        className="space-y-6 max-w-4xl"
                    >
                        <m.h2
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } }
                            }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[200] uppercase tracking-[0.05em] leading-tight script-font"
                        >
                            {title}
                        </m.h2>
                        {description && (
                            <m.p
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } }
                                }}
                                className="text-sm sm:text-base md:text-lg font-light tracking-wide text-white/90 text-balance max-w-2xl mx-auto leading-relaxed drop-shadow-md"
                            >
                                {description}
                            </m.p>
                        )}
                        <m.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } }
                            }}
                            className="pt-8"
                        >
                            <Link
                                href={collectionHref}
                                className="inline-flex items-center gap-2 text-[9px] md:text-[11px] uppercase tracking-[0.08em] border-b border-white pb-1 hover:text-white/80 hover:border-white/80 transition-all font-medium"
                            >
                                View Collection
                            </Link>
                        </m.div>
                    </m.div>
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
