import { requireAuth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, MapPin, CreditCard, ChevronRight } from "lucide-react";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
    const user = await requireAuth();

    return (
        <div className="space-y-8">
            {/* Unique Welcome Header */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-light text-black mb-2">
                        Welcome back, <span className="font-semibold">{user.name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-neutral-500 text-sm">
                        Manage your profile, check order status, and view your purchase history.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" asChild>
                        <Link href="/account/orders">
                            <Package className="w-4 h-4" /> Track Order
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Profile Card */}
                <Card className="border-neutral-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-neutral-100 pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-neutral-400" /> Profile Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">Email</label>
                                <p className="text-sm font-medium mt-1">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">Phone</label>
                                <p className="text-sm font-medium mt-1">{user.phone || '—'}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">Full Name</label>
                            <p className="text-sm font-medium mt-1">{user.name || 'Not set'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Address Card */}
                <Card className="border-neutral-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-neutral-100 pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neutral-400" /> Primary Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {user.address ? (
                            <div className="space-y-1 text-sm text-neutral-600">
                                <p className="font-semibold text-black mb-1">
                                    {user.address.first_name} {user.address.last_name}
                                </p>
                                <p>{user.address.address1}</p>
                                <p>{user.address.city}, {user.address.zip}</p>
                                <p>{user.address.country}</p>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-neutral-400 text-sm italic">
                                No address saved yet.
                            </div>
                        )}
                        <div className="mt-6 pt-4 border-t border-neutral-50 text-xs text-neutral-400">
                            Addresses are automatically updated when you place a new order.
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity / Status (Placeholder) */}
                <div className="md:col-span-2">
                    <Card className="border-neutral-200 shadow-sm bg-gradient-to-r from-neutral-50 to-white">
                        <div className="p-8 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium text-black">Wardrobe Concierge</h3>
                                <p className="text-neutral-500 text-sm max-w-md">
                                    Need help with sizing or styling? Our concierge team is ready to assist you.
                                </p>
                            </div>
                            <Button className="bg-black text-white hover:bg-neutral-800">Contact Concierge</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

