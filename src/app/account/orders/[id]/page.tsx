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
            case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-neutral-50 text-neutral-700 border-neutral-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'shipped': return <Truck className="w-3.5 h-3.5" />;
            case 'processing': return <Package className="w-3.5 h-3.5" />;
            case 'cancelled': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return <Clock className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <FadeInView>
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <Link href="/account/orders" className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-all group shadow-sm bg-white">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Order Detail</span>
                                <Badge variant="outline" className={`${getStatusStyles(order.status)} uppercase text-[9px] tracking-[0.15em] font-bold border rounded-full px-3 py-0.5 flex items-center gap-1.5`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-light text-black tracking-tight">
                                ID <span className="font-mono font-medium tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 rounded-full font-bold text-xs uppercase tracking-widest px-6 border-neutral-100 hover:border-black transition-colors shadow-sm bg-white">
                            <Printer className="w-4 h-4 mr-2" /> Invoice
                        </Button>
                        <Button className="h-12 rounded-full font-bold text-xs uppercase tracking-widest px-6 bg-black text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-black/5">
                            Track Order
                        </Button>
                    </div>
                </div>
            </FadeInView>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Status Message */}
                    <FadeInView delay={0.1}>
                        {(order.admin_message || ['processing', 'shipped'].includes(order.status)) && (
                            <div className="bg-neutral-50 border border-neutral-100 p-8 rounded-[2.5rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Package className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-medium text-black mb-3">
                                        {order.status === 'processing' ? 'We are tailoring your order' : 
                                         order.status === 'shipped' ? 'Your package is on the way' : 
                                         'Order Update'}
                                    </h3>
                                    <p className="text-neutral-500 font-light text-sm leading-relaxed mb-6 max-w-sm">
                                        {order.admin_message ? order.admin_message :
                                         order.status === 'processing'
                                            ? 'Our team is carefully preparing each item. You will receive an automated shipping notification shortly.'
                                            : 'Your order has left our boutique and is currently with the courier.'}
                                    </p>
                                    
                                    {order.tracking_number && (
                                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-300 mb-1">Carrier Details</p>
                                                <p className="text-black font-mono font-medium">{order.tracking_number}</p>
                                            </div>
                                            <Link href="#" className="text-black text-[10px] font-bold uppercase tracking-widest flex items-center hover:underline">
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
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 pb-4 mb-6">Manifest</h2>
                            <div className="space-y-4">
                                {order.items.map((item: any, i: number) => (
                                    <div key={item.id} className="flex gap-8 group">
                                        <div className="relative w-24 h-32 bg-neutral-50 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100 transition-transform group-hover:scale-[1.02] duration-500 shadow-sm">
                                            {item.image_url ? (
                                                <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-200">
                                                    <Package className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow py-2 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mb-1">{item.sku || 'N/A'}</p>
                                                <h4 className="text-xl font-light text-black tracking-tight">{item.title}</h4>
                                                <p className="text-neutral-500 text-xs mt-2 font-light italic">{item.variant_title || 'Unique Selection'}</p>
                                            </div>
                                            <div className="flex items-center gap-6 mt-4">
                                                <div className="px-3 py-1 bg-neutral-50 rounded-lg border border-neutral-100">
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2">Qty</span>
                                                    <span className="text-xs font-semibold text-black">{item.quantity}</span>
                                                </div>
                                                <p className="text-lg font-light text-black tracking-tighter">
                                                    {formatCurrency(item.total_price, storeConfig.currency)}
                                                </p>
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
                        <div className="bg-neutral-50/50 border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-8 pb-4 border-b border-neutral-100">Financial Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-light">Boutique Subtotal</span>
                                    <span className="text-black font-medium">{formatCurrency(order.subtotal, storeConfig.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-light">Global Shipping</span>
                                    <span className="text-black font-medium">{formatCurrency(order.shipping_total, storeConfig.currency)}</span>
                                </div>
                                {order.tax_total > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500 font-light">Duties & Taxes</span>
                                        <span className="text-black font-medium">{formatCurrency(order.tax_total, storeConfig.currency)}</span>
                                    </div>
                                )}
                                <div className="pt-6 mt-2 border-t border-neutral-200">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 pb-1">Total Amount</span>
                                        <span className="text-3xl font-light text-black tracking-tighter">
                                            {formatCurrency(order.total, storeConfig.currency)}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em]">{order.payment_status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInView>

                    {/* Delivery Details */}
                    <FadeInView delay={0.4}>
                        <div className="space-y-8 px-4">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4 flex items-center gap-3">
                                    <MapPin className="w-3.5 h-3.5" /> Recipient Details
                                </h3>
                                <div className="text-sm text-neutral-600 font-light leading-relaxed">
                                    <p className="font-medium text-black text-base mb-2">{order.shipping_address?.first_name || order.shipping_address?.firstName} {order.shipping_address?.last_name || order.shipping_address?.lastName}</p>
                                    <p>{order.shipping_address?.address1}</p>
                                    {order.shipping_address?.address2 && <p>{order.shipping_address?.address2}</p>}
                                    <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip || order.shipping_address?.postalCode}</p>
                                    <p>{order.shipping_address?.country}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4 flex items-center gap-3">
                                    <Calendar className="w-3.5 h-3.5" /> Order Metadata
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-neutral-300 tracking-widest mb-0.5">Contact</p>
                                        <p className="text-sm text-black font-light">{order.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-neutral-300 tracking-widest mb-0.5">Purchased On</p>
                                        <p className="text-sm text-black font-light">
                                            {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-8 pt-4">
                                     <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest border-neutral-100 font-bold h-12 rounded-xl">Contact Support</Button>
                                </div>
                            </div>
                        </div>
                    </FadeInView>
                </div>
            </div>
        </div>
    );
}
