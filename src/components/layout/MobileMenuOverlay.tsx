"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MenuItem } from "@/lib/types";

interface MobileMenuOverlayProps {
    navLinks: MenuItem[];
    onClose: () => void;
}

export default function MobileMenuOverlay({ navLinks, onClose }: MobileMenuOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[1000] bg-black text-white flex flex-col justify-center items-center"
        >
            <nav className="flex flex-col items-center gap-6">
                {navLinks.map((link, i) => (
                    <motion.div
                        key={link.label}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <Link
                            href={link.url}
                            onClick={onClose}
                            className="text-4xl md:text-6xl font-black uppercase tracking-tighter hover:text-neutral-500 transition-colors"
                        >
                            {link.label}
                        </Link>
                    </motion.div>
                ))}
            </nav>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 text-sm text-neutral-500 uppercase tracking-widest"
            >
                © 2026 Tailex Studios
            </motion.div>
        </motion.div>
    );
}
