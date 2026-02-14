"use client";

import Link from "next/link";
import { X, Instagram, Facebook, ArrowRight } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";

interface MobileMenuOverlayProps {
    navLinks: MenuItem[];
    onClose: () => void;
}

export default function MobileMenuOverlay({ navLinks, onClose }: MobileMenuOverlayProps) {
    const lenis = useLenis();
    const pathname = usePathname();

    return (
        <div className="fixed inset-0 z-[1000] overflow-hidden">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            />

            {/* Sidebar Content */}
            <div
                className="absolute top-0 left-0 h-full w-[85%] max-w-[400px] bg-white text-black shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 ease-out-expo"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-6 py-10 flex flex-col gap-6">
                    {navLinks.map((link, i) => (
                        <div
                            key={link.label}
                            className="animate-in fade-in slide-in-from-left-4 duration-500"
                            style={{ animationDelay: `${100 + i * 50}ms`, animationFillMode: 'both' }}
                        >
                            <Link
                                href={link.url}
                                onClick={(e) => {
                                    if (link.url.startsWith('/#') && pathname === '/') {
                                        e.preventDefault();
                                        onClose();
                                        const targetId = link.url.replace('/#', '');
                                        const element = document.getElementById(targetId);
                                        if (element && lenis) {
                                            // Delays slightly to let the menu close animation start
                                            setTimeout(() => {
                                                lenis.scrollTo(element, { offset: -40, duration: 1.5 });
                                            }, 100);
                                        }
                                    } else {
                                        onClose();
                                    }
                                }}
                                className="group flex items-center justify-between py-2 border-b border-neutral-50"
                            >
                                <span className="text-3xl font-bold uppercase tracking-tighter font-helvetica group-hover:pl-2 transition-all duration-300">
                                    {link.label}
                                </span>
                                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-8 bg-neutral-50 border-t border-neutral-100 mt-auto">
                    <div className="flex gap-6 mb-8">
                        <Link href="https://www.instagram.com/tailex.pakistan/" target="_blank" className="hover:opacity-60 transition-opacity">
                            <Instagram className="w-5 h-5 text-neutral-400" />
                        </Link>
                        <Link href="https://facebook.com" target="_blank" className="hover:opacity-60 transition-opacity">
                            <Facebook className="w-5 h-5 text-neutral-400" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                            © 2026 TAILEX STUDIOS
                        </p>
                        <p className="text-[10px] font-medium leading-relaxed text-neutral-400 max-w-[200px]">
                            DEFINING THE FUTURE OF MODERN MINIMALISM.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
