"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { validateCartItems } from "@/lib/api/products";
import { CartValidationItem } from "@/lib/types";

export type CartItem = {
  id: string; // Unique key for cart (e.g. "prod_1-var_2")
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  slug: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initial load and validation
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedItems: CartItem[] = JSON.parse(savedCart);
        setItems(parsedItems);

        // Validate stale data with server
        if (parsedItems.length > 0) {
          validateCartItems(parsedItems).then((result) => {
            // Always update items to ensure prices are fresh, even if stock is fine
            if (result.items.length > 0 || (parsedItems.length > 0 && result.items.length === 0)) {
              const mappedItems = result.items.map((vi: CartValidationItem) => ({
                id: vi.id,
                name: vi.name,
                price: vi.currentPrice,
                image: vi.image,
                quantity: vi.quantity,
                size: vi.size,
                color: vi.color,
                slug: vi.slug
              }));

              const currentJson = JSON.stringify(parsedItems);
              const newJson = JSON.stringify(mappedItems);

              if (currentJson !== newJson) {
                setItems(mappedItems);

                if (result.errors.length > 0) {
                  toast({
                    title: "Cart Updated",
                    description: "Some items were sold out or changed price and have been updated.",
                    variant: "destructive"
                  });
                } else if (result.items.length !== parsedItems.length) {
                  toast({
                    title: "Cart Updated",
                    description: "Some unavailable items were removed.",
                    variant: "destructive"
                  });
                }
              }
            }
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to parse cart from local storage");
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      // Check for exact match including variants
      const existingItem = prevItems.find(
        (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { ...newItem, quantity: 1 }];
    });

    setIsCartOpen(true);
    toast({
      title: "Added to cart",
      description: `${newItem.name} has been added to your cart.`,
    });
  };

  const removeItem = (id: string, size?: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const updateQuantity = (id: string, size: string | undefined, quantity: number) => {
    if (quantity < 1) {
      removeItem(id, size);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
