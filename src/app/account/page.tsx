import { requireAuth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, MapPin, CreditCard, ChevronRight, Settings, Heart, ShoppingBag } from "lucide-react";
import Link from 'next/link';
import { FadeInView } from '@/components/animations/FadeInView';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
    const user = await requireAuth();
    const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0];

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Elegant Welcome Header */}
            <FadeInView>
                <div className="mb-12 border-b border-neutral-200 pb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Personal Dashboard</p>
                            <h1 className="text-4xl md:text-5xl font-light text-black tracking-tight">
                                Greeting, <span className="font-medium italic">{firstName}</span>.
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-black">{user.email}</p>
                                <p className="text-xs text-neutral-500">Member since {new Date(user.created_at || Date.now()).getFullYear()}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-medium text-neutral-600">
                                {firstName?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </FadeInView>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Recent Orders', value: 'Check Status', icon: Package, href: '/account/orders', color: 'bg-orange-50' },
                    { label: 'Wishlist', value: '0 Items', icon: Heart, href: '/shop', color: 'bg-rose-50' },
                    { label: 'Shopping Bag', value: 'View Cart', icon: ShoppingBag, href: '/checkout', color: 'bg-blue-50' }
                ].map((stat, i) => (
                    <FadeInView key={stat.label} delay={0.1 + (i * 0.1)}>
                        <Link href={stat.href} className="block group">
                            <div className="border border-neutral-200 p-6 rounded-2xl hover:border-black transition-all duration-300 bg-white">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.color)}>
                                    <stat.icon className="w-5 h-5 text-neutral-700" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-1">{stat.label}</h3>
                                <p className="text-xl font-medium text-black flex items-center gap-2">
                                    {stat.value}
                                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </p>
                            </div>
                        </Link>
                    </FadeInView>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Profile Section */}
                <FadeInView delay={0.4}>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <h2 className="text-xl font-medium flex items-center gap-2">
                                <User className="w-5 h-5 text-neutral-400" /> Account Details
                            </h2>
                            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold h-8">Edit</Button>
                        </div>
                        
                        <div className="grid gap-6">
                            <div className="group">
                                <label className="text-[10px] uppercase text-neutral-400 font-bold tracking-[0.2em] mb-1 block">Full Name</label>
                                <p className="text-lg text-black font-light group-hover:text-neutral-600 transition-colors">{user.name || 'Not set'}</p>
                            </div>
                            <div className="group">
                                <label className="text-[10px] uppercase text-neutral-400 font-bold tracking-[0.2em] mb-1 block">Email Address</label>
                                <p className="text-lg text-black font-light group-hover:text-neutral-600 transition-colors">{user.email}</p>
                            </div>
                            <div className="group">
                                <label className="text-[10px] uppercase text-neutral-400 font-bold tracking-[0.2em] mb-1 block">Phone Number</label>
                                <p className="text-lg text-black font-light group-hover:text-neutral-600 transition-colors">{user.phone || '—'}</p>
                            </div>
                        </div>
                    </div>
                </FadeInView>

                {/* Shipping Section */}
                <FadeInView delay={0.5}>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <h2 className="text-xl font-medium flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-neutral-400" /> Default Address
                            </h2>
                            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold h-8">Manage</Button>
                        </div>

                        <div className="bg-neutral-50/50 border border-neutral-100 rounded-2xl p-6">
                            {user.address ? (
                                <div className="space-y-2 text-neutral-600 font-light leading-relaxed">
                                    <p className="font-medium text-black text-lg mb-2">
                                        {user.address.first_name} {user.address.last_name}
                                    </p>
                                    <p>{user.address.address1}</p>
                                    <p>{user.address.city}, {user.address.zip}</p>
                                    <p>{user.address.country}</p>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-neutral-400 text-sm font-light italic">
                                    Add a shipping address to speed up your checkout process.
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-orange-50/30 border border-orange-100 rounded-xl flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-orange-100 shrink-0">
                                <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-orange-800 uppercase tracking-wider mb-0.5">Payment Method</p>
                                <p className="text-xs text-orange-700/70">No cards saved. Add one during your next checkout.</p>
                            </div>
                        </div>
                    </div>
                </FadeInView>

                {/* Support Section */}
                <FadeInView delay={0.6} className="md:col-span-2 mt-8">
                    <div className="relative overflow-hidden bg-black text-white rounded-3xl p-8 md:p-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-md">
                                <h3 className="text-2xl font-light mb-4 tracking-tight">Customer Care & Support</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed mb-6 font-light">
                                    Our dedicated support team is here to assist with sizing, style advice, and any order inquiries you may have. We're committed to your satisfaction.
                                </p>
                                <div className="flex gap-4">
                                    <Button className="bg-white text-black hover:bg-neutral-200 transition-colors px-8 border-none font-bold text-xs uppercase tracking-widest">Chat Now</Button>
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 font-bold text-xs uppercase tracking-widest">Email Us</Button>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Available 24/7</p>
                            </div>
                        </div>
                    </div>
                </FadeInView>
            </div>
        </div>
    );
}

