"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/UserAuthContext";
import { CartSheet } from "@/components/layout/CartSheet";
import { SearchModal } from "@/components/layout/SearchModal";
import { MenuItem } from "@/lib/types";

// Lazy-load the mobile menu to reduce initial bundle size
// This separates 80KB+ of Framer Motion animation code from the critical path
const MobileMenuOverlay = dynamic(() => import("./MobileMenuOverlay"), {
  ssr: false,
  loading: () => null,
});

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
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="hover:opacity-70 transition-opacity"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* Cart */}
            <button
              className="relative hover:opacity-70 transition-opacity"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
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
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Menu Overlay - Dynamically Loaded */}
      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenuOverlay navLinks={navLinks} onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
