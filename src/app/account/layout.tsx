import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { User, Package, Settings, LogOut } from "lucide-react";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="hidden lg:block">
                            <h1 className="text-3xl font-light text-white mb-2">My Account</h1>
                            <p className="text-white/40 text-sm">Manage your orders and preferences.</p>
                        </div>

                        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                            <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">Profile</span>
                            </Link>
                            <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap">
                                <Package className="w-4 h-4" />
                                <span className="text-sm font-medium">Orders</span>
                            </Link>
                            <Link href="/account/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap">
                                <Settings className="w-4 h-4" />
                                <span className="text-sm font-medium">Settings</span>
                            </Link>
                            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left w-full mt-auto whitespace-nowrap">
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
