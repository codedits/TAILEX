"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const formatCurrency = useFormatCurrency();
    const { addItem } = useCart();


    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const images = product?.cover_image ? [product.cover_image, ...(product.images || [])].filter(Boolean) as string[] : [];

    // Find selected variant
    const selectedVariant = useMemo(() => {
        if (!product?.variants?.length) return null;
        return product.variants.find(v => {
            const match1 = !v.option1_name || v.option1_value === selectedOptions[v.option1_name];
            const match2 = !v.option2_name || v.option2_value === selectedOptions[v.option2_name];
            return match1 && match2;
        }) || null;
    }, [selectedOptions, product?.variants]);

    if (!product) return null;

    const currentPrice = selectedVariant?.price ?? product.price;
    const currentSalePrice = selectedVariant?.sale_price ?? product.sale_price;
    const hasSale = !!currentSalePrice && currentSalePrice < currentPrice;
    const currentStock = selectedVariant?.inventory_quantity ?? 0;
    const isOutOfStock = product.track_inventory && currentStock <= 0;

    const handleAddToCart = () => {
        // Validate options
        const missingOptions = product.options?.filter(opt => !selectedOptions[opt.name]) || [];
        if (missingOptions.length > 0) {
            if (missingOptions.length > 0) {
                toast.error(`Please select ${missingOptions[0].name}`);
                return;
            }
        }

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
            quantity: quantity,
            slug: product.slug,
        } as any, true);

        setTimeout(() => {
            setIsPending(false);
            onClose();
        }, 400);
    };

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl pointer-events-auto relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center 
                                       bg-white/90 backdrop-blur-sm hover:bg-black hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="grid md:grid-cols-2 h-full overflow-auto">
                                {/* Image Section */}
                                <div className="relative aspect-[3/4] md:aspect-auto bg-neutral-100">
                                    {images.length > 0 && (
                                        <Image
                                            src={images[currentImageIndex]}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    )}

                                    {/* Image Navigation */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 
                                                       backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 
                                                       backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {images.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentImageIndex(i)}
                                                        className={cn(
                                                            "w-2 h-2 transition-colors",
                                                            i === currentImageIndex ? "bg-black" : "bg-black/30"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Low Stock Badge */}
                                    {currentStock > 0 && currentStock <= 5 && (
                                        <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold 
                                                    uppercase tracking-wider px-3 py-1.5">
                                            Only {currentStock} left
                                        </div>
                                    )}
                                </div>

                                {/* Info Section */}
                                <div className="p-6 md:p-8 flex flex-col justify-between overflow-auto">
                                    <div className="space-y-6">
                                        {/* Title & Price */}
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-2">
                                                {product.vendor || "TAILEX"}
                                            </p>
                                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black mb-3">
                                                {product.title}
                                            </h2>
                                            <div className="flex items-baseline gap-3">
                                                {hasSale ? (
                                                    <>
                                                        <span className="text-xl font-bold text-black">{formatCurrency(currentSalePrice!)}</span>
                                                        <span className="text-base line-through text-neutral-400">{formatCurrency(currentPrice)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl font-bold text-black">{formatCurrency(currentPrice)}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Options */}
                                        {product.options?.map((option) => (
                                            <div key={option.id} className="space-y-3">
                                                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-neutral-500">
                                                    {option.name}: <span className="text-black">{selectedOptions[option.name] || "Select"}</span>
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {option.values.map((value) => (
                                                        <button
                                                            key={value}
                                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                                                            className={cn(
                                                                "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border",
                                                                selectedOptions[option.name] === value
                                                                    ? "border-black bg-white text-black font-bold"
                                                                    : "border-neutral-200 hover:border-neutral-400 text-neutral-900"
                                                            )}
                                                        >
                                                            {value}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-4 pt-6 mt-auto">
                                        <div className="flex gap-3">
                                            {/* Quantity */}
                                            <div className="flex items-center border border-neutral-200 h-12">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-full flex items-center justify-center hover:bg-neutral-100"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-10 h-full flex items-center justify-center hover:bg-neutral-100"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Add to Cart */}
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isOutOfStock || isPending}
                                                className="flex-1 h-12 bg-white text-black text-xs font-bold uppercase tracking-widest
                                                       flex items-center justify-center gap-2 hover:bg-neutral-50 border border-black
                                                       active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                {isPending ? "Adding..." : isOutOfStock ? "Sold Out" : "Add to Bag"}
                                            </button>
                                        </div>

                                        {/* View Full Details Link */}
                                        <Link
                                            href={`/product/${product.slug}`}
                                            className="block text-center text-[10px] uppercase tracking-[0.15em] font-bold text-neutral-500 
                                                   hover:text-black transition-colors py-2 border-t border-neutral-100"
                                        >
                                            View Full Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
