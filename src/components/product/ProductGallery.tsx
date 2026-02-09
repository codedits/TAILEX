"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Maximize2, X } from "lucide-react";

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
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    if (!images.length) return null;

    return (
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
                            <div className="flex-[0_0_100%] min-w-0 relative h-full" key={idx}>
                                <Image
                                    src={img}
                                    alt={`${title} - view ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={idx === 0}
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    placeholder={blurDataUrls?.[img] || (idx === 0 && blurDataUrl) ? "blur" : "empty"}
                                    blurDataURL={blurDataUrls?.[img] || (idx === 0 ? blurDataUrl ?? undefined : undefined)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Zoom View */}
                <div
                    className={cn(
                        "hidden md:block absolute inset-0 w-full h-full cursor-zoom-in relative z-10",
                        isZoomed ? "cursor-zoom-out" : ""
                    )}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => setIsZoomed(!isZoomed)}
                >
                    <Image
                        src={images[selectedIndex]}
                        alt={title}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-200 ease-out origin-center",
                            isZoomed ? "scale-[2]" : "scale-100"
                        )}
                        style={isZoomed ? {
                            transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                        } : undefined}
                        priority
                        sizes="(max-width: 1200px) 50vw, 800px"
                        placeholder={blurDataUrls?.[images[selectedIndex]] || blurDataUrl ? "blur" : "empty"}
                        blurDataURL={blurDataUrls?.[images[selectedIndex]] || blurDataUrl || undefined}
                    />

                    {/* Hint */}
                    {!isZoomed && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-black">
                            Hover to Zoom
                        </div>
                    )}
                </div>

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
    );
}
