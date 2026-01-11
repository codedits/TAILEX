import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, MapPin, ArrowLeft, CheckCircle, Truck, Clock, AlertCircle, ExternalLink, Printer } from "lucide-react";
import Link from "next/link";
import { FadeInView } from "@/components/animations/FadeInView";
import { OrderActions } from "@/components/orders/OrderActions";
import { OrderCancelButton } from "@/components/orders/OrderCancelButton";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params;
    const user = await requireAuth();

    const supabase = await createAdminClient();
    const [{ data: order }, storeConfig] = await Promise.all([
        supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('id', id)
            .eq('email', user.email) // Security: only own orders by email
            .single(),
        StoreConfigService.getStoreConfig()
    ]);

    if (!order) {
        notFound();
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-900 border-emerald-200';
            case 'shipped': return 'bg-blue-100 text-blue-900 border-blue-200';
            case 'processing': return 'bg-amber-100 text-amber-900 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-900 border-red-200';
            default: return 'bg-neutral-100 text-neutral-900 border-neutral-200';
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
        <div className="max-w-5xl mx-auto pb-24">
            <FadeInView>
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-black/10 pb-12">
                    <div className="flex flex-col gap-6">
                        <Link href="/account/orders" className="w-fit text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black flex items-center gap-2 group transition-colors">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Orders
                        </Link>
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <h1 className="text-5xl font-bold text-black tracking-tighter">
                                    <span className="text-neutral-300">#</span>{order.id.slice(0, 8).toUpperCase()}
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className={`${getStatusStyles(order.status)} uppercase text-[10px] tracking-widest font-bold border px-3 py-1 flex items-center gap-2 rounded-lg`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </Badge>
                                <span className="text-sm font-bold text-neutral-400">
                                    {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <OrderCancelButton
                            orderId={order.id}
                            orderStatus={order.status}
                            createdAt={order.created_at}
                        />
                        <OrderActions orderId={order.id} trackingNumber={order.tracking_number} />
                    </div>
                </div>
            </FadeInView>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-16">
                    {/* Status Message */}
                    <FadeInView delay={0.1}>
                        {(order.admin_message || ['processing', 'shipped'].includes(order.status)) && (
                            <div className="bg-neutral-50 border border-neutral-200 p-10 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                    <Package className="w-48 h-48" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-black mb-4">
                                        {order.status === 'processing' ? 'We are tailoring your order' :
                                            order.status === 'shipped' ? 'Your package is on the way' :
                                                'Order Update'}
                                    </h3>
                                    <p className="text-neutral-600 font-medium text-base leading-relaxed mb-8 max-w-lg">
                                        {order.admin_message ? order.admin_message :
                                            order.status === 'processing'
                                                ? 'Our team is carefully preparing each item. You will receive an automated shipping notification shortly.'
                                                : 'Your order has left our boutique and is currently with the courier.'}
                                    </p>

                                    {order.tracking_number && (
                                        <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2">Carrier Details</p>
                                                <p className="text-black font-mono font-bold text-lg">{order.tracking_number}</p>
                                            </div>
                                            <Link href="#" className="text-black text-xs font-bold uppercase tracking-widest flex items-center hover:underline bg-neutral-100 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                                                Track Shipment <ExternalLink className="w-3 h-3 ml-2" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </FadeInView>

                    {/* Items List */}
                    <FadeInView delay={0.2}>
                        <div className="space-y-8">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                                <Package className="w-4 h-4" /> Manifest
                            </h2>
                            <div className="space-y-6">
                                {order.items.map((item: any, i: number) => (
                                    <div key={item.id} className="flex gap-8 group p-6 bg-white border border-neutral-100 rounded-2xl hover:border-neutral-200 transition-all hover:shadow-lg">
                                        <div className="relative w-28 h-36 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200">
                                            {item.image_url ? (
                                                <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                    <Package className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{item.sku || 'N/A'}</p>
                                                    <span className="text-base font-bold text-black">
                                                        {formatCurrency(item.total_price, storeConfig.currency)}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-bold text-black tracking-tight mb-1">{item.title}</h4>
                                                <p className="text-sm font-medium text-neutral-500">{item.variant_title || 'Unique Selection'}</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="px-3 py-1.5 bg-neutral-100 rounded-lg">
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-2">Qty</span>
                                                    <span className="text-xs font-bold text-black">{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeInView>
                </div>

                {/* Sidebar Summary & Details */}
                <div className="space-y-12">
                    {/* Summary Card */}
                    <FadeInView delay={0.3}>
                        <div className="bg-neutral-900 text-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-8 pb-4 border-b border-white/10">Financial Summary</h3>
                            <div className="space-y-5">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-neutral-400">Subtotal</span>
                                    <span>{formatCurrency(order.subtotal, storeConfig.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-neutral-400">Shipping</span>
                                    <span>{formatCurrency(order.shipping_total, storeConfig.currency)}</span>
                                </div>
                                {order.tax_total > 0 && (
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-neutral-400">Duties & Taxes</span>
                                        <span>{formatCurrency(order.tax_total, storeConfig.currency)}</span>
                                    </div>
                                )}
                                <div className="pt-8 mt-4 border-t border-white/10">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 pb-1">Total Paid</span>
                                        <span className="text-3xl font-bold tracking-tight">
                                            {formatCurrency(order.total, storeConfig.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInView>

                    {/* Delivery Details */}
                    <FadeInView delay={0.4}>
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-black" /> Recipient Details
                                </h3>
                                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
                                    <p className="font-bold text-black text-lg mb-3">
                                        {order.shipping_address?.first_name || order.shipping_address?.firstName} {order.shipping_address?.last_name || order.shipping_address?.lastName}
                                    </p>
                                    <div className="text-sm font-medium text-neutral-600 space-y-1">
                                        <p>{order.shipping_address?.address1}</p>
                                        {order.shipping_address?.address2 && <p>{order.shipping_address?.address2}</p>}
                                        <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip || order.shipping_address?.postalCode}</p>
                                        <p className="font-bold text-black mt-2">{order.shipping_address?.country}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-black" /> Contact Info
                                </h3>
                                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-1">Email</p>
                                        <p className="text-sm font-bold text-black">{order.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-1">Phone</p>
                                        <p className="text-sm font-bold text-black">{order.phone || order.shipping_address?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Button variant="outline" className="w-full text-xs uppercase tracking-widest border-2 border-neutral-100 hover:border-black font-bold h-12 rounded-xl transition-all">
                                        Need Help?
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </FadeInView>
                </div>
            </div>
        </div>
    );
}
