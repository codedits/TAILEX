"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Product } from "@/lib/types";
import { QuickViewModal } from "@/components/product/QuickViewModal";

interface QuickViewContextType {
    openQuickView: (product: Product) => void;
    closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openQuickView = useCallback((product: Product) => {
        setSelectedProduct(product);
        setIsOpen(true);
    }, []);

    const closeQuickView = useCallback(() => {
        setIsOpen(false);
        // Delay clearing product to allow exit animation
        setTimeout(() => setSelectedProduct(null), 300);
    }, []);

    return (
        <QuickViewContext.Provider value={{ openQuickView, closeQuickView }}>
            {children}
            <QuickViewModal
                product={selectedProduct}
                isOpen={isOpen}
                onClose={closeQuickView}
            />
        </QuickViewContext.Provider>
    );
}

export function useQuickView() {
    const context = useContext(QuickViewContext);
    if (context === undefined) {
        throw new Error("useQuickView must be used within a QuickViewProvider");
    }
    return context;
}
