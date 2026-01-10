'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { useFormatCurrency } from '@/context/StoreConfigContext';

export default function OrderList({ initialOrders }: { initialOrders: Order[] }) {
    const formatCurrency = useFormatCurrency();
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to realtime updates
        const channel = supabase
            .channel('orders-channel')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for all events (INSERT, UPDATE, DELETE) - though mostly UPDATE
                    schema: 'public',
                    table: 'orders',
                    filter: `customer_id=eq.${initialOrders[0]?.customer_id || ''}` // Filter by user if possible, or handle in callback
                },
                (payload) => {
                    console.log('Order update received:', payload);
                    if (payload.eventType === 'UPDATE') {
                        setOrders((prev) => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } as Order : o));
                    } else if (payload.eventType === 'INSERT') {
                        setOrders((prev) => [payload.new as Order, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, initialOrders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'shipped': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'processing': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'processing': return <Package className="w-4 h-4" />;
            case 'cancelled': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-16 h-16 text-neutral-800 mb-4" />
                <h3 className="text-xl font-medium text-neutral-400">No orders yet</h3>
                <p className="text-neutral-600 mt-2 mb-8">Start shopping to see your orders here.</p>
                <Button asChild>
                    <Link href="/collection">Browse Collection</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {orders.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-mono text-black">#{order.id.slice(0, 8)}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-2 border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-500">
                                        Placed on {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-manrope font-black text-black">{formatCurrency(order.total)}</p>
                                    <p className="text-xs text-neutral-500 uppercase tracking-widest">{order.payment_status}</p>
                                </div>
                            </div>

                            {/* Progress Bar for active orders */}
                            {['pending', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                                <div className="relative h-1 bg-neutral-100 rounded-full mb-6 overflow-hidden">
                                    <motion.div
                                        className="absolute left-0 top-0 h-full bg-black"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: order.status === 'delivered' ? '100%' :
                                                order.status === 'shipped' ? '75%' :
                                                    order.status === 'processing' ? '50%' : '25%'
                                        }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            )}

                            {/* Admin Message / Status Update */}
                            {order.admin_message && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Status Update</h4>
                                    <p className="text-sm text-blue-800">{order.admin_message}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                                <div className="flex -space-x-2">
                                    {order.items?.slice(0, 4).map((item, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-neutral-100 overflow-hidden relative">
                                            {/* Placeholder for image if available, using initials or icon otherwise */}
                                            {/* For now just a gray circle if no image, ideally we pass images in order.items */}
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">
                                                {item.quantity}x
                                            </div>
                                        </div>
                                    ))}
                                    {order.items && order.items.length > 4 && (
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                </div>
                                <Button variant="ctaOutline" size="sm" asChild>
                                    <Link href={`/account/orders/${order.id}`}>
                                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
