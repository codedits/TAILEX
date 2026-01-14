"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    Minus,
    Plus,
    Heart,
    Share2,
    Truck,
    ShieldCheck,
    Ruler
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";

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

    const { toast } = useToast();
    const { addItem } = useCart();

    // Default Options
    useEffect(() => {
        if (product.options && Object.keys(selectedOptions).length === 0) {
            const defaults: Record<string, string> = {};
            product.options.forEach(opt => {
                if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
            });
            setSelectedOptions(defaults);
        }
    }, [product.options]);

    // Derived State (Variants, Price, Stock)
    const selectedVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) return null;

        return product.variants.find(v => {
            const match1 = !v.option1_name || v.option1_value === selectedOptions[v.option1_name];
            const match2 = !v.option2_name || v.option2_value === selectedOptions[v.option2_name];
            const match3 = !v.option3_name || v.option3_value === selectedOptions[v.option3_name];
            return match1 && match2 && match3;
        }) || null;
    }, [selectedOptions, product.variants]);

    const currentPrice = selectedVariant?.price ?? product.price;
    const currentSalePrice = selectedVariant?.sale_price ?? product.sale_price;
    const hasSale = !!currentSalePrice && currentSalePrice < currentPrice;
    const currentStock = selectedVariant?.inventory_quantity ?? product.stock ?? 0;
    const isOutOfStock = product.track_inventory && currentStock <= 0 && !product.allow_backorder;

    // Handlers
    const handleOptionSelect = (name: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleAddToCart = (openCart: boolean = true) => {
        const options = product.options || [];
        const missingOptions = options.filter(opt => !selectedOptions[opt.name]);

        if (missingOptions.length > 0) {
            toast({
                title: `Please select ${missingOptions[0].name}`,
                variant: "destructive",
            });
            return false;
        }

        if (isOutOfStock) {
            toast({ title: "Out of Stock", variant: "destructive" });
            return false;
        }

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
            quantity: quantity,
            slug: product.slug,
        } as any, openCart);

        if (!openCart) return true; // For Buy Now logic
        return true;
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast({
            title: !isFavorite ? "Saved to Wishlist" : "Removed from Wishlist",
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="space-y-4">
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

                <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-2">
                        {hasSale ? (
                            <>
                                <span className="text-2xl font-bold text-[#D03030]">
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
                        <span className="px-2 py-1 bg-[#D03030] text-white text-[10px] font-bold uppercase tracking-widest">
                            Sale
                        </span>
                    )}
                </div>
            </div>

            {/* Description Short */}
            <div className="prose prose-sm text-neutral-600 leading-relaxed">
                <p>{product.short_description || product.description?.slice(0, 150) + "..."}</p>
            </div>

            <div className="h-px bg-neutral-200" />

            {/* Options */}
            {product.options?.map((option) => (
                <div key={option.id} className="space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold text-neutral-900">
                        <span>{option.name}: <span className="text-neutral-500 font-medium">{selectedOptions[option.name]}</span></span>
                        {option.name.toLowerCase() === 'size' && (
                            <button className="flex items-center gap-1 hover:text-neutral-500 transition-colors underline underline-offset-4">
                                <Ruler className="w-3 h-3" /> Size Guide
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
                                        ? "border-neutral-900 bg-neutral-900 text-white"
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
                        disabled={isOutOfStock}
                        className="flex-1 h-full rounded-none bg-neutral-900 text-white hover:bg-neutral-800 uppercase tracking-widest font-bold text-xs"
                    >
                        {isOutOfStock ? "Sold Out" : "Add to Bag"}
                    </Button>
                </div>

                {/* Buy Now */}
                <Button
                    variant="outline"
                    onClick={() => {
                        if (handleAddToCart(false)) router.push('/checkout');
                    }}
                    disabled={isOutOfStock}
                    className="w-full h-12 rounded-none border-neutral-900 text-neutral-900 hover:bg-neutral-50 uppercase tracking-widest font-bold text-xs"
                >
                    Buy it Now
                </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-6 text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-neutral-900" />
                    <span>Free Shipping Over $100</span>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-neutral-900" />
                    <span>Secure Checkout</span>
                </div>
            </div>

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full border-t border-neutral-200">
                <AccordionItem value="details">
                    <AccordionTrigger className="text-xs uppercase tracking-widest font-bold py-4 hover:no-underline">
                        Details & Care
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-neutral-600 leading-relaxed pb-4">
                        {product.description}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                    <AccordionTrigger className="text-xs uppercase tracking-widest font-bold py-4 hover:no-underline">
                        Shipping & Returns
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-neutral-600 leading-relaxed pb-4">
                        Free standard shipping on all orders over $100. Returns accepted within 30 days of delivery.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
