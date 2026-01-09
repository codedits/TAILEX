"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, LogOut, Settings, CreditCard } from "lucide-react";
import { useAuth } from "@/context/UserAuthContext";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const navItems = [
        { href: "/account", label: "Overview", icon: User },
        { href: "/account/orders", label: "Orders", icon: Package },
        // Future items
        // { href: "/account/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-neutral-50/50 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto w-full">

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl border border-neutral-200 p-4 lg:p-6 shadow-sm sticky top-24 z-30">
                            <div className="hidden lg:block mb-8 px-2">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Menu</h2>
                            </div>

                            {/* Mobile: Horizontal Scroll | Desktop: Vertical Stack */}
                            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-hide">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                                                    ? "bg-black text-white shadow-md shadow-black/10"
                                                    : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400 group-hover:text-black"}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                <div className="hidden lg:block pt-4 mt-4 border-t border-neutral-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </nav>
                        </div>

                        {/* Mobile Logout (Separate to avoid cluttering horiz scroll if not needed, or add to end) */}
                        {/* Keeping simple for now, relying on desktop-first logout in nav or adding to end of scroll if critical */}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 min-w-0"> {/* min-w-0 prevents flex child overflow issues */}
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
