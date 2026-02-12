"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import { ProductZoomImage } from "@/components/product/ProductZoomImage";
import { ProductLightbox } from "@/components/product/ProductLightbox";

interface ProductGalleryProps {
    images: string[];
    title: string;
    blurDataUrl?: string | null;
    blurDataUrls?: Record<string, string>;
}

export default function ProductGallery({ images, title, blurDataUrl, blurDataUrls }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "center",
        containScroll: "trimSnaps",
        loop: true
    });
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollTo = (index: number) => {
        setSelectedIndex(index);
        if (emblaApi) emblaApi.scrollTo(index);
    };

    if (!images.length) return null;

    const getBlurUrl = (src: string, idx: number): string | null => {
        return blurDataUrls?.[src] || (idx === 0 ? blurDataUrl ?? null : null);
    };

    return (
        <>
            <div className="flex flex-col-reverse md:flex-row gap-4 h-fit sticky top-24">
                {/* Desktop Thumbnails (Left Side) */}
                <div className="hidden md:flex flex-col gap-4 w-20 lg:w-24 shrink-0 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollTo(idx)}
                            className={cn(
                                "relative aspect-[3/4] w-full border overflow-hidden transition-all duration-300",
                                selectedIndex === idx
                                    ? "border-black ring-1 ring-black ring-offset-2 opacity-100"
                                    : "border-transparent hover:border-black/20 opacity-70 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${title} view ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="96px"
                                quality={80}
                            />
                        </button>
                    ))}
                </div>

                {/* Main Image Area */}
                <div className="relative w-full aspect-[3/4] md:aspect-[3/4] lg:aspect-[4/5] bg-[#F1F1F1] overflow-hidden group">

                    {/* Mobile Carousel View */}
                    <div className="md:hidden h-full" ref={emblaRef}>
                        <div className="flex h-full touch-pan-y">
                            {images.map((img, idx) => (
                                <div
                                    className="flex-[0_0_100%] min-w-0 relative h-full"
                                    key={idx}
                                    onClick={() => {
                                        setSelectedIndex(idx);
                                        setLightboxOpen(true);
                                    }}
                                >
                                    <Image
                                        src={img}
                                        alt={`${title} - view ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={idx === 0}
                                        sizes="100vw"
                                        quality={80}
                                        placeholder={getBlurUrl(img, idx) ? "blur" : "empty"}
                                        blurDataURL={getBlurUrl(img, idx) ?? undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Hi-Res Zoom View */}
                    <div className="hidden md:block absolute inset-0 w-full h-full z-10">
                        <ProductZoomImage
                            src={images[selectedIndex]}
                            alt={title}
                            blurDataUrl={getBlurUrl(images[selectedIndex], selectedIndex)}
                            priority={selectedIndex === 0}
                            zoomScale={2.5}
                            className="w-full h-full"
                            onClick={() => setLightboxOpen(true)}
                        />
                    </div>

                    {/* Expand to fullscreen button */}
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Open fullscreen view"
                    >
                        <Maximize2 className="w-4 h-4 text-black" />
                    </button>

                    {/* Mobile Pagination Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden pointer-events-none z-20">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-300 bg-white/80 shadow-sm",
                                        selectedIndex === idx ? "w-6 bg-black" : "opacity-60"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Lightbox — hi-res images with zoom, pan, navigation */}
            <ProductLightbox
                images={images}
                initialIndex={selectedIndex}
                alt={title}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </>
    );
}
