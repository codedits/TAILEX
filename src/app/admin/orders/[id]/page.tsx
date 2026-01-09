import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusSelector } from "@/components/admin/orders/order-status-selector"; // We will create this
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Truck, Package, CreditCard, Calendar, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: order } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single();

    if (!order) {
        notFound();
    }

    // Helper for Badge Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'shipped': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case 'processing': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case 'cancelled': return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <Link href="/admin/orders" className="text-white/40 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-light text-white flex items-center gap-3">
                        Order #{order.id.slice(0, 8)}
                        <Badge variant="outline" className={`${getStatusColor(order.status)} uppercase text-xs tracking-wider font-medium border`}>
                            {order.status}
                        </Badge>
                    </h1>
                    <p className="text-white/40 text-sm font-mono mt-1">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="ml-auto flex gap-3">
                    <Button variant="outline" className="text-xs uppercase tracking-widest border-white/10 hover:bg-white/5">
                        Print Invoice
                    </Button>
                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Items Card */}
                    <div className="bg-neutral-900 border border-white/5 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                            <Package className="w-4 h-4 text-white/40" />
                            <h3 className="text-sm font-medium uppercase tracking-widest text-white/80">Items ({order.items.length})</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-6">
                                    <div className="relative w-20 h-24 bg-neutral-800 rounded-sm overflow-hidden flex-shrink-0">
                                        {item.image_url && <Image src={item.image_url} alt={item.title} fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium">{item.title}</h4>
                                        <p className="text-white/40 text-sm mt-1 mb-2">{item.variant_title || 'Standard'}</p>
                                        <div className="flex items-center gap-4 text-sm font-mono text-white/60">
                                            <span>Qty: {item.quantity}</span>
                                            <span>×</span>
                                            <span>{formatCurrency(item.unit_price)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium font-mono">
                                            {formatCurrency(item.total_price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-neutral-950/50 p-6 space-y-3">
                            <div className="flex justify-between text-sm text-white/60">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/60">
                                <span>Shipping</span>
                                <span>{formatCurrency(order.shipping_total)}</span>
                            </div>
                            {order.tax_total > 0 && (
                                <div className="flex justify-between text-sm text-white/60">
                                    <span>Tax</span>
                                    <span>{formatCurrency(order.tax_total)}</span>
                                </div>
                            )}
                            <Separator className="bg-white/10 my-2" />
                            <div className="flex justify-between text-lg font-medium text-white">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Notes (Placeholder for now, can be expanded) */}
                    <div className="bg-neutral-900 border border-white/5 rounded-lg p-6">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-white/80 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-white/40" /> Order Timeline
                        </h3>
                        <div className="space-y-6 relative ml-2 border-l border-white/10 pl-6 py-2">
                            <div className="relative">
                                <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-neutral-900" />
                                <p className="text-sm text-white">Order Placed</p>
                                <p className="text-xs text-white/40 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            {order.status !== 'pending' && (
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-neutral-900" />
                                    <p className="text-sm text-white">Status updated to <span className="uppercase font-bold text-xs">{order.status}</span></p>
                                    <p className="text-xs text-white/40 mt-1">Recent update</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar: Customer & Address */}
                <div className="space-y-8">
                    <div className="bg-neutral-900 border border-white/5 rounded-lg p-6">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-white/80 mb-4 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-white/40" /> Customer
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-white">{order.email}</p>
                                {order.phone && <p className="text-white/60 text-sm mt-1">{order.phone}</p>}
                            </div>
                            <Button variant="secondary" className="w-full text-xs">View Customer Profile</Button>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-white/5 rounded-lg p-6">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-white/80 mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-white/40" /> Shipping Address
                        </h3>
                        {order.shipping_address ? (
                            <div className="text-sm text-white/70 leading-relaxed">
                                <p className="text-white font-medium mb-1">
                                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                                </p>
                                <p>{order.shipping_address.address1}</p>
                                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}</p>
                                <p className="uppercase text-xs mt-2 tracking-wide opacity-60">{order.shipping_address.country}</p>
                            </div>
                        ) : (
                            <p className="text-white/40 text-sm italic">No shipping details provided</p>
                        )}
                    </div>

                    <div className="bg-neutral-900 border border-white/5 rounded-lg p-6">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-white/80 mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-white/40" /> Payment
                        </h3>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                            <span className="text-sm text-white/60 uppercase text-xs tracking-wider">Status</span>
                            <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                {order.payment_status}
                            </Badge>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
