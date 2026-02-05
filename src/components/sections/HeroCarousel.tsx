'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';

export type HeroSlide = {
    id: string;
    image: string;
    mobileImage?: string;
    heading?: string;
    subheading?: string;
    ctaText?: string;
    ctaLink?: string;
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

/**
 * HeroCarousel - Swiper Version
 * 
 * Logic:
 * - Swiper handles the background image sliding (robust, touch-friendly).
 * - Framer Motion handles the text fade/slide animations (premium feel).
 * - State is synced via onSlideChange.
 */
const HeroCarousel = ({
    slides,
    brandName = "TAILEX",
    overlayOpacity = 0.3,
    autoPlayInterval = 5000,
    defaultHeading,
    defaultSubheading
}: HeroCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    // Hydration flag
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleImageError = useCallback((slideId: string) => {
        setImageErrors((prev) => new Set(prev).add(slideId));
    }, []);

    const getEffectiveImage = (slide: HeroSlide) => {
        if (imageErrors.has(slide.id) || !slide.image) {
            return DEFAULT_HERO_IMAGE;
        }
        return slide.image;
    };

    if (slides.length === 0) {
        return (
            <section className="relative w-full h-[100vh] overflow-hidden">
                <div className="absolute inset-0 h-full w-full bg-neutral-900">
                    <Image
                        src={DEFAULT_HERO_IMAGE}
                        alt={brandName}
                        fill
                        className="object-cover object-top"
                        priority
                        quality={85}
                        sizes="100vw"
                    />
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: overlayOpacity }}
                    />
                </div>
                <div className="relative flex flex-col items-center justify-center w-full h-[100vh] text-center z-10">
                    <p className="text-white/90 text-xs tracking-[0.2em] uppercase font-bold">
                        {defaultSubheading || "SPRING/SUMMER '26"}
                    </p>
                    <h1 className="text-white text-5xl md:text-8xl font-medium tracking-tight mt-4">
                        {defaultHeading || brandName}
                    </h1>
                </div>
            </section>
        );
    }

    const currentSlide = slides[currentIndex];

    // Text Animation Variants
    const textVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeInOut" } }
    };

    return (
        <section className="relative w-full h-[100vh] overflow-hidden bg-neutral-900 group">
            {/* Swiper Slider - Background Images */}
            <div className="absolute inset-0 h-full w-full z-0">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    slidesPerView={1}
                    loop={slides.length > 1}
                    speed={800}
                    autoplay={{
                        delay: autoPlayInterval,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                        el: '.hero-pagination',
                        bulletClass: 'inline-block w-2 h-2 rounded-full bg-white/40 mx-1 cursor-pointer transition-all duration-300',
                        bulletActiveClass: '!bg-white !w-6',
                    }}
                    onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                    className="h-full w-full"
                >
                    {slides.map((slide, index) => {
                        const effectiveImage = getEffectiveImage(slide);
                        return (
                            <SwiperSlide key={`${slide.id}-${index}`}>
                                <div className="relative w-full h-full">
                                    {/* Mobile Image (Optimized) */}
                                    {slide.mobileImage && !imageErrors.has(slide.id) && (
                                        <div className="md:hidden absolute inset-0">
                                            <Image
                                                src={slide.mobileImage}
                                                alt={slide.heading || brandName}
                                                fill
                                                className="object-cover object-top hero-entrance-animate will-change-transform"
                                                priority={index === 0}
                                                loading={index === 0 ? "eager" : "lazy"}
                                                fetchPriority={index === 0 ? "high" : "auto"}
                                                quality={85}
                                                sizes="100vw"
                                                placeholder="blur"
                                                blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE3MTcxNyIvPjwvc3ZnPg=="
                                                onError={() => handleImageError(slide.id)}
                                            />
                                        </div>
                                    )}

                                    {/* Desktop Image (Optimized) */}
                                    <div className={`absolute inset-0 ${slide.mobileImage && !imageErrors.has(slide.id) ? 'hidden md:block' : ''}`}>
                                        <Image
                                            src={effectiveImage}
                                            alt={slide.heading || brandName}
                                            fill
                                            className="object-cover object-top hero-entrance-animate will-change-transform"
                                            priority={index === 0}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : "auto"}
                                            quality={85}
                                            sizes="100vw"
                                            placeholder="blur"
                                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE3MTcxNyIvPjwvc3ZnPg=="
                                            onError={() => handleImageError(slide.id)}
                                        />
                                    </div>
                                    <div
                                        className="absolute inset-0 bg-black transition-opacity duration-700"
                                        style={{ opacity: overlayOpacity }}
                                    />
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>

            {/* Content Layer - Text Animation (Decoupled from Swiper) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full px-6 md:px-10 z-30 text-center h-full max-w-[1920px] mx-auto pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={textVariants}
                        className="flex flex-col items-center justify-center space-y-4 pointer-events-auto"
                    >
                        {/* Subheading */}
                        <p className="text-white/90 text-xs tracking-[0.2em] uppercase font-bold">
                            {currentSlide.subheading || defaultSubheading || "SPRING/SUMMER '26"}
                        </p>

                        {/* Heading */}
                        <h1 className="text-white text-5xl md:text-8xl font-medium tracking-tight">
                            {currentSlide.heading || defaultHeading || brandName}
                        </h1>

                        {/* Center CTA */}
                        {/* Always show Shop Now or custom CTA if provided */}
                        <div className="pt-4">
                            <Link
                                href={currentSlide.ctaLink || "/shop"}
                                className="inline-block px-8 py-3 rounded-full border border-white/50 text-white text-[10px] md:text-xs font-semibold tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 uppercase"
                            >
                                Shop Now
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Bottom: Slide-specific tagline/link - Also Animated */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-full flex justify-center pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {currentSlide.ctaText && (
                            <motion.div
                                key={`bottom-${currentIndex}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, delay: 0.2 }} // Slight delay for staggering
                            >
                                <Link
                                    href={currentSlide.ctaLink || "/shop"}
                                    className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
                                >
                                    <span className="text-xs md:text-sm tracking-[0.15em] uppercase font-medium">
                                        {currentSlide.ctaText}
                                    </span>
                                    <svg
                                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Swiper Pagination Bullets */}
                {slides.length > 1 && (
                    <div className="hero-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center" />
                )}
            </div>
        </section>
    );
};

export default HeroCarousel;
