"use client"

import * as React from "react"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"
import { cn } from "@/lib/utils"

interface MobileProductCardProps {
    product: Product
    isSelected?: boolean
    onSelect?: (selected: boolean) => void
    onActionClick: (product: Product) => void
}

export function MobileProductCard({
    product,
    isSelected,
    onSelect,
    onActionClick,
}: MobileProductCardProps) {
    const formatCurrency = useFormatCurrency()
    const [expanded, setExpanded] = React.useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            case "archived":
                return "bg-red-500/10 text-red-400 border-red-500/20"
            case "draft":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20"
            default:
                return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
        }
    }

    const getStockColor = (stock: number) => {
        if (stock === 0) return "text-red-400"
        if (stock < 10) return "text-amber-400"
        return "text-white/60"
    }

    return (
        <div
            className={cn(
                "rounded-xl border border-white/10 bg-neutral-900/40 overflow-hidden transition-all",
                isSelected && "ring-2 ring-white/30"
            )}
        >
            {/* Main Card Content */}
            <div className="p-4">
                <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                        {product.cover_image ? (
                            <img
                                src={product.cover_image}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-lg border border-white/10"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                                <span className="text-white/20 text-xs">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-medium text-white truncate">{product.title}</h3>
                                <p className="text-white/40 text-xs font-mono mt-0.5">
                                    {product.sku || "NO SKU"}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0 hover:bg-white/10 text-white/60"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onActionClick(product)
                                }}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Price and Status Row */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex flex-col">
                                <span className="font-mono text-white/90 font-medium">
                                    {formatCurrency(product.price)}
                                </span>
                                {product.sale_price && (
                                    <span className="text-emerald-400 text-xs font-mono">
                                        {formatCurrency(product.sale_price)}
                                    </span>
                                )}
                            </div>
                            <div
                                className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                                    getStatusColor(product.status || "draft")
                                )}
                            >
                                {product.status || "draft"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expand Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-white/40 text-sm hover:text-white/60 transition-colors"
                >
                    {expanded ? (
                        <>
                            <span>Hide Details</span>
                            <ChevronUp className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            <span>Show Details</span>
                            <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Expanded Details - CSS Transition */}
            <div
                className={cn(
                    "grid transition-all duration-200 ease-out",
                    expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/5">
                        {/* Stock Info */}
                        <div className="flex items-center justify-between py-2">
                            <span className="text-white/40 text-sm">Stock</span>
                            <span className={cn("font-mono font-medium", getStockColor(product.stock ?? 0))}>
                                {product.stock ?? 0} units
                            </span>
                        </div>

                        {/* Category Info */}
                        {product.category && (
                            <div className="flex items-center justify-between py-2 border-t border-white/5">
                                <span className="text-white/40 text-sm">Category</span>
                                <span className="text-white/80 text-sm">{product.category}</span>
                            </div>
                        )}

                        {/* Created Date */}
                        {product.created_at && (
                            <div className="flex items-center justify-between py-2 border-t border-white/5">
                                <span className="text-white/40 text-sm">Added</span>
                                <span className="text-white/60 text-sm">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
