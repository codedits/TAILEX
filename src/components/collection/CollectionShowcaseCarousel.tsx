"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionShowcaseCarouselProps {
    products: Product[];
    collectionHref: string;
    title: string;
}

export const CollectionShowcaseCarousel = ({
    products,
    collectionHref,
    title
}: CollectionShowcaseCarouselProps) => {
    const [emblaRef] = useEmblaCarousel({
        dragFree: false,
        containScroll: "trimSnaps",
        align: "start",
    });

    return (
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6 touch-pan-y py-4 -ml-4 md:-ml-6 px-4 md:px-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="flex-shrink-0 pl-2 md:pl-6 basis-[55%] sm:basis-[50%] md:basis-[40%] lg:basis-[30%] xl:basis-[25%]"
                    >
                        {/* 
                           Note: ProductCard is a client component with dynamic currency.
                        */}
                        <ProductCard {...product} />
                    </div>
                ))}

                {/* "See More" Card */}
                <div className="flex-shrink-0 pl-4 md:pl-6 basis-[80%] sm:basis-[50%] md:basis-[40%] lg:basis-[30%] xl:basis-[25%]">
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
    );
};
