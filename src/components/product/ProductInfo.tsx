"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    Minus,
    Plus,
    Heart,
    Share2,
    Ruler
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { StickyAddToCart } from "./StickyAddToCart";
import { SizeGuideModal } from "./SizeGuideModal";
import { STANDARD_SIZES } from "@/lib/logic/variant-generator";

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const formatCurrency = useFormatCurrency();
    const router = useRouter();

    // State
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);


    const { addItem } = useCart();

    // Default Options - supports both legacy options and new clothing variants
    useEffect(() => {
        if (Object.keys(selectedOptions).length > 0) return;

        const defaults: Record<string, string> = {};

        // New clothing variant system
        if (product.enable_color_variants && product.available_colors?.length) {
            defaults['Color'] = product.available_colors[0];
        }
        if (product.enable_size_variants && product.available_sizes?.length) {
            defaults['Size'] = product.available_sizes[0];
        }

        // Legacy options system (fallback)
        if (Object.keys(defaults).length === 0 && product.options) {
            product.options.forEach(opt => {
                if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
            });
        }

        if (Object.keys(defaults).length > 0) {
            setSelectedOptions(defaults);
        }
    }, [product.options, product.available_colors, product.available_sizes]);

    // Derived State (Variants, Price, Stock)
    const selectedVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) return null;

        // New clothing variant system (color/size fields)
        if (product.enable_color_variants || product.enable_size_variants) {
            return product.variants.find(v => {
                const colorMatch = !product.enable_color_variants || v.color === selectedOptions['Color'];
                const sizeMatch = !product.enable_size_variants || v.size === selectedOptions['Size'];
                const isActive = v.status !== 'disabled';
                return colorMatch && sizeMatch && isActive;
            }) || null;
        }

        // Legacy option system (option1/2/3 fields)
        return product.variants.find(v => {
            const match1 = !v.option1_name || v.option1_value === selectedOptions[v.option1_name];
            const match2 = !v.option2_name || v.option2_value === selectedOptions[v.option2_name];
            const match3 = !v.option3_name || v.option3_value === selectedOptions[v.option3_name];
            return match1 && match2 && match3;
        }) || null;
    }, [selectedOptions, product.variants, product.enable_color_variants, product.enable_size_variants]);

    // Helper to check if a specific option value is out of stock
    const isOptionOutOfStock = (optionType: 'Color' | 'Size', value: string): boolean => {
        if (!product.variants || !product.track_inventory) return false;

        const relevantVariants = product.variants.filter(v => {
            if (optionType === 'Color') {
                const colorMatch = v.color === value;
                const sizeMatch = !product.enable_size_variants || v.size === selectedOptions['Size'];
                return colorMatch && sizeMatch;
            } else {
                const sizeMatch = v.size === value;
                const colorMatch = !product.enable_color_variants || v.color === selectedOptions['Color'];
                return colorMatch && sizeMatch;
            }
        });

        return relevantVariants.every(v =>
            v.status === 'disabled' || (v.inventory_quantity ?? 0) <= 0
        );
    };

    const currentPrice = selectedVariant?.price ?? product.price;
    const currentSalePrice = selectedVariant?.sale_price ?? product.sale_price;
    const hasSale = !!currentSalePrice && currentSalePrice < currentPrice;
    const currentStock = selectedVariant?.inventory_quantity ?? 0;

    // Fix: If no variant is selected, check if ANY variant has stock.
    // Otherwise it defaults to 0 and shows "Sold Out" during SSR/initial render.
    const isOutOfStock = useMemo(() => {
        if (!product.track_inventory) return false;
        if (product.allow_backorder) return false;

        if (selectedVariant) {
            return currentStock <= 0;
        }

        // No variant selected: Check if all variants are OOS
        if (product.variants && product.variants.length > 0) {
            return product.variants.every(v => (v.inventory_quantity ?? 0) <= 0);
        }

        // Fallback for simple products (though DB seems to use variants for all)
        return (product.stock ?? 0) <= 0;
    }, [product.track_inventory, product.allow_backorder, selectedVariant, currentStock, product.variants, product.stock]);



    // Handlers
    const handleOptionSelect = (name: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleAddToCart = (openCart: boolean = true) => {
        const options = product.options || [];
        const missingOptions = options.filter(opt => !selectedOptions[opt.name]);

        if (missingOptions.length > 0) {
            toast.error(`Please select ${missingOptions[0].name}`);
            return false;
        }

        if (isOutOfStock) {
            if (isOutOfStock) {
                toast.error("Out of Stock");
                return false;
            }
        }

        // Optimistic: Set pending state immediately
        setIsPending(true);

        const variantId = selectedVariant?.id;
        const uniqueId = variantId ? `${product.id}-${variantId}` : product.id;
        const image = selectedVariant?.image_url || product.cover_image || "";

        addItem({
            id: uniqueId,
            productId: product.id,
            variantId: variantId,
            name: product.title,
            price: currentSalePrice || currentPrice,
            image: image,
            size: Object.values(selectedOptions).join(" / "),
            color: selectedOptions['Color'] || undefined,
            quantity: quantity,
            slug: product.slug,
        } as any, openCart);

        // Reset pending state after a brief delay for visual feedback
        setTimeout(() => setIsPending(false), 400);

        if (!openCart) return true; // For Buy Now logic
        return true;
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(!isFavorite ? "Saved to Wishlist" : "Removed from Wishlist");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="space-y-4 hidden lg:block">
                <div className="flex justify-between items-start">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {product.vendor || "TAILEX Standard"}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={toggleFavorite} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <Heart className={cn("w-5 h-5", isFavorite ? "fill-black text-black" : "text-neutral-600")} />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <Share2 className="w-5 h-5 text-neutral-600" />
                        </button>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
                    {product.title}
                </h1>
            </div>

            {/* Price & Favorites (Always visible on mobile, under carousel) */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-baseline gap-2">
                            {hasSale ? (
                                <>
                                    <span className="text-2xl font-bold text-black">
                                        {formatCurrency(currentSalePrice!)}
                                    </span>
                                    <span className="text-lg line-through text-neutral-400">
                                        {formatCurrency(currentPrice)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-neutral-900">
                                    {formatCurrency(currentPrice)}
                                </span>
                            )}
                        </div>
                        {hasSale && (
                            <span className="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                                Sale
                            </span>
                        )}
                    </div>

                    {/* Mobile Favorites/Share */}
                    <div className="flex gap-1 lg:hidden">
                        <button onClick={toggleFavorite} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <Heart className={cn("w-5 h-5", isFavorite ? "fill-black text-black" : "text-neutral-600")} />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <Share2 className="w-5 h-5 text-neutral-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Description Short */}
            <div className="prose prose-sm text-neutral-600 leading-relaxed">
                <p>{product.short_description || product.description?.slice(0, 150) + "..."}</p>
            </div>

            <div className="h-px bg-neutral-200" />

            {/* Clothing Variant Options (Color/Size) */}
            {product.enable_color_variants && product.available_colors && product.available_colors.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold text-neutral-900">
                        <span>Color: <span className="text-neutral-500 font-medium">{selectedOptions['Color']}</span></span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {product.available_colors.map((color) => {
                            const outOfStock = isOptionOutOfStock('Color', color);
                            return (
                                <button
                                    key={color}
                                    onClick={() => !outOfStock && handleOptionSelect('Color', color)}
                                    disabled={outOfStock}
                                    className={cn(
                                        "px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border min-w-[3rem]",
                                        selectedOptions['Color'] === color
                                            ? "border-black bg-white text-black font-bold"
                                            : outOfStock
                                                ? "border-neutral-100 text-neutral-300 bg-neutral-50 cursor-not-allowed line-through"
                                                : "border-neutral-200 hover:border-neutral-400 text-neutral-900 bg-transparent"
                                    )}
                                >
                                    {color}
                                    {outOfStock && <span className="ml-1 text-[10px]">(Out)</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {product.enable_size_variants && product.available_sizes && product.available_sizes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[13px] font-medium text-neutral-900">Select size</span>
                        <button
                            onClick={() => setShowSizeGuide(true)}
                            className="flex items-center gap-1.5 text-[13px] text-neutral-900 hover:opacity-70 transition-opacity border-b border-black pb-0.5"
                        >
                            <span className="flex gap-[1px] items-end h-3">
                                <span className="w-[1.5px] h-1.5 bg-black"></span>
                                <span className="w-[1.5px] h-2.5 bg-black"></span>
                                <span className="w-[1.5px] h-2 bg-black"></span>
                            </span>
                            Sizing
                        </button>
                    </div>

                    <div className="flex -space-x-px">
                        {STANDARD_SIZES.map((size) => {
                            const isEnabled = product.available_sizes?.includes(size);
                            const outOfStock = isEnabled && isOptionOutOfStock('Size', size);
                            const isSelected = selectedOptions['Size'] === size;

                            return (
                                <button
                                    key={size}
                                    onClick={() => isEnabled && !outOfStock && handleOptionSelect('Size', size)}
                                    disabled={!isEnabled || outOfStock}
                                    className={cn(
                                        "relative flex-1 py-4 text-sm font-medium transition-all border border-neutral-200 min-w-[3rem] items-center justify-center",
                                        isSelected
                                            ? "z-10 border-neutral-900 border-[2px] -m-[1px]" // Bold border for selection
                                            : isEnabled && !outOfStock ? "hover:bg-neutral-50" : "",
                                        (!isEnabled || outOfStock) && "text-neutral-500 bg-neutral-100/50 cursor-not-allowed"
                                    )}
                                >
                                    <span className={cn(isSelected && "translate-y-[0.5px]")}>{size}</span>

                                    {/* Diagonal Slash for Disabled/Out of Stock */}
                                    {(!isEnabled || outOfStock) && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <svg className="w-full h-full text-neutral-400" preserveAspectRatio="none">
                                                <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Model Info (Placeholder aesthetic) */}
                    <div className="pt-2 text-center text-[12px] text-neutral-500 italic">
                        Male Model: 6'0", wearing size M
                    </div>
                </div>
            )}

            {/* Legacy Options (fallback for products not using clothing variant system) */}
            {!(product.enable_color_variants || product.enable_size_variants) && product.options?.map((option) => (
                <div key={option.id} className="space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold text-neutral-900">
                        <span>{option.name}: <span className="text-neutral-500 font-medium">{selectedOptions[option.name]}</span></span>
                        {option.name.toLowerCase() === 'size' && (
                            <button
                                onClick={() => setShowSizeGuide(true)}
                                className="flex items-center gap-1 hover:text-neutral-500 transition-colors underline underline-offset-4"
                            >
                                <Ruler className="w-3 h-3" /> Find Your Fit
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => (
                            <button
                                key={value}
                                onClick={() => handleOptionSelect(option.name, value)}
                                className={cn(
                                    "px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border min-w-[3rem]",
                                    selectedOptions[option.name] === value
                                        ? "border-black bg-white text-black font-bold"
                                        : "border-neutral-200 hover:border-neutral-400 text-neutral-900 bg-transparent"
                                )}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-3 h-12">
                    {/* Quantity */}
                    <div className="flex items-center w-32 border border-neutral-200 bg-neutral-50/50">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-neutral-100 transition-colors">
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="flex-1 text-center font-medium text-sm">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center hover:bg-neutral-100 transition-colors">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Add to Cart */}
                    <Button
                        onClick={() => handleAddToCart(true)}
                        disabled={isOutOfStock || isPending}
                        className="flex-1 h-full rounded-none bg-white text-black hover:bg-neutral-50 border border-black uppercase tracking-widest font-bold text-xs transition-transform active:scale-95 disabled:opacity-70"
                    >
                        {isPending ? "Adding..." : isOutOfStock ? "Sold Out" : "Add to Bag"}
                    </Button>
                </div>

                {/* Buy Now */}
                <Button
                    onClick={() => {
                        if (handleAddToCart(false)) router.push('/checkout');
                    }}
                    disabled={isOutOfStock}
                    className="w-full h-12 rounded-none bg-black text-white hover:bg-neutral-900 border border-black uppercase tracking-widest font-bold text-xs transition-transform active:scale-95"
                >
                    Buy Now
                </Button>
            </div>

            {/* Mobile Sticky Add to Cart */}
            <StickyAddToCart
                productName={product.title}
                price={currentPrice}
                salePrice={currentSalePrice}
                isOutOfStock={isOutOfStock === true}
                onAddToCart={() => handleAddToCart(true)}
                isPending={isPending}
            />

            {/* Size Guide Modal */}
            <SizeGuideModal
                isOpen={showSizeGuide}
                onClose={() => setShowSizeGuide(false)}
            />
        </div>
    );
}
