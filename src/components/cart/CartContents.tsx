"use client";

import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/context/CartContext";

export function CartContents({ onClose }: { onClose: () => void }) {
    const { items, removeItem, updateQuantity, cartTotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
                <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground text-lg">Your cart is empty</p>
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="uppercase tracking-widest"
                >
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                <div className="space-y-6">
                    {items.map((item: CartItem) => (
                        <div key={`${item.id}-${item.size}`} className="flex gap-4">
                            <div className="relative w-20 h-24 bg-secondary/30 flex-shrink-0 overflow-hidden">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-200" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-sm uppercase tracking-wide">{item.name}</h3>
                                        {item.size && (
                                            <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                                        )}
                                    </div>
                                    <p className="font-medium text-sm">${item.price.toFixed(2)}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center border border-input">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                            className="p-1 hover:bg-secondary transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-xs">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                            className="p-1 hover:bg-secondary transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id, item.size)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 mt-auto">
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="font-medium uppercase tracking-wide">Subtotal</span>
                    <span className="font-medium text-lg">${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Shipping and taxes calculated at checkout.
                </p>
                <Button className="w-full uppercase tracking-widest py-6" asChild>
                    <Link href="/checkout" onClick={onClose}>
                        Checkout
                    </Link>
                </Button>
            </div>
        </>
    );
}
