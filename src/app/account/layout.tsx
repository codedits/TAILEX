"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, LogOut, Settings, CreditCard } from "lucide-react";
import { useAuth } from "@/context/UserAuthContext";
import { cn } from "@/lib/utils";

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
        <div className="min-h-screen bg-white flex flex-col font-manrope">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto w-full text-foreground">

                <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-12">

                    {/* Sidebar Navigation */}
                    <aside className="lg:border-r border-neutral-100 lg:pr-8">
                        <div className="sticky top-32 space-y-8">
                            <div>
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-6 px-2">Account</h2>
                                
                                <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        const Icon = item.icon;
                                        
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group whitespace-nowrap",
                                                    isActive 
                                                        ? "bg-black text-white shadow-lg shadow-black/5" 
                                                        : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "w-4 h-4 transition-transform group-hover:scale-110",
                                                    isActive ? "text-white" : "text-neutral-400"
                                                )} />
                                                <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                                {isActive && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="pt-8 border-t border-neutral-100 hidden lg:block">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2.5 w-full text-neutral-500 hover:text-red-600 transition-colors group"
                                >
                                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-sm font-medium">Log out</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="min-h-[600px]">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
