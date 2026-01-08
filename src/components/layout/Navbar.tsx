"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { CartSheet } from "@/components/layout/CartSheet";
import { SearchModal } from "@/components/layout/SearchModal";
import { MenuItem } from "@/lib/types";

const Navbar = ({ brandName = "TAILEX", navItems }: { brandName?: string; navItems?: MenuItem[] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = navItems?.map(item => ({
    name: item.label,
    href: item.url
  })) || [
      { name: "Collection", href: "/collection" },
      { name: "Product", href: "/product" },
      { name: "About", href: "/about" },
      { name: "Journal", href: "/news" },
    ];

  return (
    <>
      <CartSheet />
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className={`px-6 md:px-12 h-20 md:h-24 flex items-center justify-between transition-colors duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/10' : 'bg-transparent'}`}>
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold tracking-tighter uppercase z-50 relative hover:opacity-70 transition-opacity"
          >
            {brandName}
          </Link>

          {/* Desktop Nav - Centered/Right as per reference */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6 z-50 relative">
            <Link href="/login" className="hidden md:block hover:opacity-70 transition-opacity">
              <User className="w-5 h-5 text-foreground/70" />
            </Link>

            <button
              className="relative group flex items-center gap-2 hover:opacity-70 transition-opacity"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <span className="text-[10px] font-bold absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center scale-75">
                {cartCount}
              </span>
            </button>

            <button
              className="md:hidden hover:opacity-70 transition-opacity text-[10px] font-bold tracking-widest"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? "CLOSE" : "MENU"}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 bg-black text-white flex flex-col justify-center items-center"
          >
            <nav className="flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-6xl md:text-8xl font-black uppercase tracking-tighter hover:text-neutral-500 transition-colors"
                  >
                    {link.name}
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
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
