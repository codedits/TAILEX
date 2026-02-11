'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from "@/lib/utils";

export type HeroSlide = {
    id: string;
    image: string;
    mobileImage?: string;
    heading?: string;
    subheading?: string;
    ctaText?: string;
    ctaLink?: string;
    blurDataURL?: string;
};

type HeroCarouselProps = {
    slides: HeroSlide[];
    brandName?: string;
    overlayOpacity?: number;
    autoPlayInterval?: number;
    defaultHeading?: string;
    defaultSubheading?: string;
};

const DEFAULT_HERO_IMAGE = "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";

const HeroCarousel = ({
    slides,
    brandName = "TAILEX",
    overlayOpacity = 0.3,
    autoPlayInterval = 5000,
    defaultHeading,
    defaultSubheading
}: HeroCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    // Embla setup
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 }, [
        Autoplay({ delay: autoPlayInterval, stopOnInteraction: false })
    ]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const handleImageError = useCallback((slideId: string) => {
        setImageErrors((prev) => new Set(prev).add(slideId));
    }, []);

    const getEffectiveImage = (slide: HeroSlide) => {
        if (imageErrors.has(slide.id) || !slide.image) {
            return DEFAULT_HERO_IMAGE;
        }
        return slide.image;
    };

    if (slides.length === 0) return null;

    const currentSlide = slides[currentIndex];



    return (
        <section className="relative w-full h-[100vh] overflow-hidden bg-white group">
            {/* Embla Slider - Background Images */}
            <div className="absolute inset-0 h-full w-full z-0" ref={emblaRef}>
                <div className="flex h-full">
                    {slides.map((slide, index) => {
                        const effectiveImage = getEffectiveImage(slide);
                        return (
                            <div key={`${slide.id}-${index}`} className="relative w-full h-full flex-[0_0_100%]">
                                {/* Mobile Image */}
                                {slide.mobileImage && !imageErrors.has(slide.id) && (
                                    <div className="md:hidden absolute inset-0 overflow-hidden">
                                        <m.div
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={index === currentIndex ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
                                            transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                                            className="absolute inset-0 w-full h-full"
                                        >
                                            <Image
                                                src={slide.mobileImage}
                                                alt={slide.heading || brandName}
                                                fill
                                                className="object-cover object-top"
                                                priority={index === 0}
                                                loading={index === 0 ? "eager" : "lazy"}
                                                fetchPriority={index === 0 ? "high" : "auto"}
                                                quality={75}
                                                sizes="(max-width: 1080px) 100vw, 1080px"
                                                placeholder={slide.blurDataURL ? "blur" : "empty"}
                                                blurDataURL={slide.blurDataURL}
                                                onLoad={() => index === 0 && setImageLoaded(true)}
                                                onError={() => handleImageError(slide.id)}
                                            />
                                        </m.div>
                                    </div>
                                )}

                                {/* Desktop Image */}
                                <div className={cn("absolute inset-0 overflow-hidden", slide.mobileImage && !imageErrors.has(slide.id) && "hidden md:block")}>
                                    <m.div
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={index === currentIndex ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <Image
                                            src={effectiveImage}
                                            alt={slide.heading || brandName}
                                            fill
                                            className="object-cover object-top"
                                            priority={index === 0}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : "auto"}
                                            quality={75}
                                            sizes="(max-width: 1080px) 100vw, 1080px"
                                            placeholder={slide.blurDataURL ? "blur" : "empty"}
                                            blurDataURL={slide.blurDataURL}
                                            onLoad={() => index === 0 && setImageLoaded(true)}
                                            onError={() => handleImageError(slide.id)}
                                        />
                                    </m.div>
                                </div>

                                <div
                                    className="absolute inset-0 bg-black z-[5]"
                                    style={{ opacity: imageLoaded ? overlayOpacity : 0, transition: 'opacity 1.2s ease-in-out' }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full px-6 md:px-10 z-30 text-center h-full max-w-[1920px] mx-auto pointer-events-none">
                <div key={currentSlide.id} className="flex flex-col items-center justify-center space-y-4 pointer-events-auto">
                    <p className="hero-subtext text-white/90 text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold">
                        {currentSlide?.subheading || defaultSubheading || "SPRING/SUMMER '26"}
                    </p>

                    <h1 className="hero-text text-white text-5xl md:text-8xl font-medium tracking-tight">
                        {currentSlide?.heading || defaultHeading || brandName}
                    </h1>

                    <div className="hero-cta pt-4">
                        <Link
                            href={currentSlide?.ctaLink || "/shop"}
                            className="inline-block px-8 py-3 rounded-full border border-white/50 text-white text-[10px] md:text-xs font-semibold tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 uppercase"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-full flex justify-center pointer-events-auto">
                    {currentSlide?.ctaText && (
                        <div key={`bottom-${currentSlide.id}`} className="hero-cta">
                            <Link
                                href={currentSlide.ctaLink || "/shop"}
                                className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
                            >
                                <span className="text-xs md:text-sm tracking-[0.15em] uppercase font-medium">
                                    {currentSlide.ctaText}
                                </span>
                                <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {slides.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2 pointer-events-auto">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => emblaApi?.scrollTo(index)}
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    index === currentIndex ? "bg-white w-6 h-2" : "bg-white/40 w-2 h-2 hover:bg-white/60"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    );
}

export default HeroCarousel;
