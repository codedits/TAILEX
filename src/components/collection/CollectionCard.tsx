"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { type Collection } from "@/lib/types";

interface CollectionCardProps {
    collection: Collection & { product_count?: number };
}

export const CollectionCard = ({ collection }: CollectionCardProps) => {
    const blurDataUrls = (collection.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined;
    const blurSrc = collection.image_url ? blurDataUrls?.[collection.image_url] : undefined;
    const blurProps = blurSrc
        ? { placeholder: "blur" as const, blurDataURL: blurSrc }
        : {};

    return (
        <Link
            href={`/collection/${collection.slug}`}
            className="group relative aspect-[2/3] w-full overflow-hidden bg-muted"
        >
            {collection.image_url ? (
                <Image
                    src={collection.image_url}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={80}
                    {...blurProps}
                />
            ) : (
                <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />
            )}

            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

            {/* Bottom Gradient for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between text-white">
                <div className="flex flex-col gap-1">
                    <h3 className="font-manrope text-sm md:text-base font-bold uppercase tracking-[0.1em]">
                        {collection.title}
                    </h3>
                    {collection.product_count !== undefined && (
                        <span className="text-[10px] md:text-xs opacity-70 tracking-widest uppercase">
                            {collection.product_count} {collection.product_count === 1 ? 'Piece' : 'Pieces'}
                        </span>
                    )}
                </div>

                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </Link>
    );
};
