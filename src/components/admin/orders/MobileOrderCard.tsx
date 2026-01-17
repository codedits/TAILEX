"use client"

import * as React from "react"
import { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronDown, ChevronUp, Package } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface MobileOrderCardProps {
    order: Order
    onActionClick: (order: Order) => void
}

export function MobileOrderCard({ order, onActionClick }: MobileOrderCardProps) {
    const formatCurrency = useFormatCurrency()
    const [expanded, setExpanded] = React.useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            case "shipped":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20"
            case "processing":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20"
            case "cancelled":
                return "bg-red-500/10 text-red-400 border-red-500/20"
            default:
                return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
        }
    }

    return (
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-white/60">
                                #{order.id.slice(0, 8)}
                            </span>
                            <div
                                className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                                    getStatusColor(order.status || "pending")
                                )}
                            >
                                {order.status || "pending"}
                            </div>
                        </div>
                        <p className="text-white font-medium truncate">{order.email}</p>
                        <p className="text-white/40 text-xs mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-white">
                            {formatCurrency(order.total)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/10 text-white/60"
                            onClick={(e) => {
                                e.stopPropagation()
                                onActionClick(order)
                            }}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
                            <span>View Items</span>
                            <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/5">
                            {/* Shipping Address */}
                            {order.shipping_address && (
                                <div className="py-2">
                                    <span className="text-white/40 text-xs block mb-1">Shipping To</span>
                                    <span className="text-white/80 text-sm">
                                        {typeof order.shipping_address === 'object'
                                            ? `${(order.shipping_address as any).city || ''}, ${(order.shipping_address as any).country || ''}`
                                            : String(order.shipping_address)
                                        }
                                    </span>
                                </div>
                            )}

                            {/* Items Preview */}
                            {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                                <div className="py-2 border-t border-white/5">
                                    <span className="text-white/40 text-xs block mb-2">Items ({order.items.length})</span>
                                    <div className="space-y-2">
                                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <Package className="h-4 w-4 text-white/30" />
                                                <span className="text-white/70 text-sm flex-1 truncate">
                                                    {item.title || item.product_title || 'Product'}
                                                </span>
                                                <span className="text-white/50 text-xs">×{item.quantity}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-white/40 text-xs">+{order.items.length - 3} more items</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
