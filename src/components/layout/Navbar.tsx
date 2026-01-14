"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/UserAuthContext";
import { CartSheet } from "@/components/layout/CartSheet";
import { SearchModal } from "@/components/layout/SearchModal";
import { MenuItem } from "@/lib/types";

const Navbar = ({ brandName = "TAILEX", navItems }: { brandName?: string; navItems?: MenuItem[] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/shop" },
    { name: "JOURNAL", href: "/news" },
    { name: "ABOUT", href: "/about" },
  ];

  return (
    <>
      <CartSheet />
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
          ? "bg-white text-black border-neutral-200 shadow-sm"
          : "bg-transparent text-white border-white/10"
          }`}
      >
        <div className="px-6 md:px-8 py-4 w-full flex items-center justify-between relative">

          {/* Left Nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] font-medium uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-1"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Center Logo (Desktop) / Left Logo (Mobile) */}
          <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
            <Link
              href="/"
              className="text-2xl md:text-3xl font-bold tracking-tighter uppercase hover:opacity-80 transition-opacity"
            >
              TAILEX
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6 flex-1 justify-end">

            {/* Icons */}
            <SearchModal />

            {/* Account */}
            <Link href={isAuthenticated ? "/account" : "/login"} className="hover:opacity-70 transition-opacity">
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* Cart */}
            <button
              className="relative hover:opacity-70 transition-opacity"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden hover:opacity-70 transition-opacity"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

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
