import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, MapPin, ArrowLeft, CheckCircle, Truck, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params;
    const user = await requireAuth();

    const supabase = await createAdminClient();
    const { data: order } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .eq('email', user.email) // Security: only own orders by email
        .single();

    if (!order) {
        notFound();
    }

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/account/orders" className="text-neutral-400 hover:text-black transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-light text-black flex items-center gap-3">
                        Order #{order.id.slice(0, 8)}
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="ml-auto">
                    <Badge variant="outline" className={`${getStatusColor(order.status)} uppercase text-xs tracking-wider font-medium border flex items-center gap-2 pl-2 pr-3 py-1`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                    </Badge>
                </div>
            </div>

            {/* Status Message */}
            {['processing', 'shipped'].includes(order.status) && (
                <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-xl mb-8">
                    <h3 className="text-black font-medium mb-1">
                        {order.status === 'processing' ? 'We are preparing your order' : 'Your order is on the way'}
                    </h3>
                    <p className="text-neutral-500 text-sm">
                        {order.status === 'processing'
                            ? 'Our tailors are finalizing the details. You will receive an email when it ships.'
                            : 'Track your shipment below.'}
                    </p>
                    {order.tracking_number && (
                        <div className="mt-4 p-4 bg-white rounded border border-neutral-200 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-neutral-400">Tracking Number</p>
                                <p className="text-black font-mono">{order.tracking_number}</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs">Track Shipment</Button>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Items Card */}
                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-neutral-100">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-6">
                                    <div className="relative w-20 h-24 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                                        {item.image_url ? (
                                            <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-black font-medium">{item.title}</h4>
                                        <p className="text-neutral-500 text-sm mt-1 mb-2">{item.variant_title || 'Standard'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-black font-medium font-mono text-sm">
                                            {formatCurrency(item.total_price)}
                                        </p>
                                        <p className="text-neutral-400 text-xs mt-1">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-neutral-50 p-6 space-y-3">
                            <div className="flex justify-between text-sm text-neutral-500">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-neutral-500">
                                <span>Shipping</span>
                                <span>{formatCurrency(order.shipping_total)}</span>
                            </div>
                            <Separator className="bg-neutral-200 my-2" />
                            <div className="flex justify-between text-lg font-medium text-black">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Shipping Address
                        </h3>
                        {order.shipping_address ? (
                            <div className="text-sm text-neutral-600 leading-relaxed font-light">
                                <p className="text-black font-medium mb-1">
                                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                                </p>
                                <p>{order.shipping_address.address1}</p>
                                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}</p>
                                <p className="uppercase text-xs mt-2 tracking-wide opacity-60">{order.shipping_address.country}</p>
                            </div>
                        ) : (
                            <p className="text-neutral-400 text-sm italic">No shipping details provided</p>
                        )}
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Need Help?</h3>
                        <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
                            If you have any questions about your order, please contact our concierge.
                        </p>
                        <Button variant="outline" className="w-full text-xs uppercase tracking-widest">Contact Support</Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
