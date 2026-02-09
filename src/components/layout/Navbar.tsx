"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, Instagram, Facebook } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/UserAuthContext";
const CartSheet = dynamic(() => import("@/components/layout/CartSheet").then(mod => mod.CartSheet), { ssr: false });
const SearchModal = dynamic(() => import("@/components/layout/SearchModal").then(mod => mod.SearchModal), { ssr: false });
import { MenuItem } from "@/lib/types";

// Lazy-load the mobile menu to reduce initial bundle size
const MobileMenuOverlay = dynamic(() => import("./MobileMenuOverlay"), {
  ssr: false,
  loading: () => null,
});

const Navbar = ({ brandName = "TAILEX", navItems }: { brandName?: string; navItems?: MenuItem[] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const defaultLinks: MenuItem[] = [
    { label: "HOME", url: "/" },
    { label: "SHOP", url: "/shop" },
    { label: "COLLECTIONS", url: "/collection" },
    { label: "ABOUT", url: "/about" },
  ];

  const linksToDisplay = navItems && navItems.length > 0 ? navItems : defaultLinks;

  return (
    <>
      <CartSheet />
      <header
        className={`w-full z-50 transition-all duration-300 border-b group/nav ${isHome
          ? "absolute top-full bg-transparent text-white border-white/70 hover:bg-white hover:text-black hover:border-black"
          : "relative bg-white text-black border-black shadow-sm"
          }`}
      >
        {/* Row 1: Social Icons (Desktop) */}
        <div className="hidden md:flex justify-end px-6 md:px-12 py-1">
          <div className="flex items-center gap-4">
            <Link href="https://facebook.com" target="_blank" className="hover:opacity-60 transition-opacity">
              <Facebook className="w-4 h-4" />
            </Link>
            <Link href="https://www.instagram.com/tailex.pakistan/" target="_blank" className="hover:opacity-60 transition-opacity">
              <Instagram className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Row 2: Logo (Desktop Only) */}
        <div className="hidden md:flex w-full justify-center py-4 md:py-6">
          <Link
            href="/"
            className="text-4xl md:text-6xl font-bold tracking-tighter uppercase font-helvetica"
          >
            {brandName}
          </Link>
        </div>

        {/* Row 3: Navigation & Actions (Enclosed) */}
        <div className={`px-6 md:px-12 pt-4 pb-4 flex items-center justify-between border-t ${isHome
          ? "border-white/70 group-hover/nav:border-black"
          : "border-black"
          }`}>
          {/* Left: Search (Desktop) / Menu (Mobile) */}
          <div className="flex-1 flex items-center justify-start">
            <div className="hidden md:block">
              <SearchModal />
            </div>
            <button
              className="md:hidden hover:opacity-70 transition-opacity"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center: Navigation Links (Desktop) / Logo (Mobile) */}
          <div className="flex md:hidden flex-1 items-center justify-center">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter uppercase font-helvetica -translate-y-0.5"
            >
              {brandName}
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-12 flex-wrap">
            {linksToDisplay.map((item) => (
              <Link
                key={item.label}
                href={item.url}
                className="relative text-[13px] font-bold uppercase tracking-widest group/link py-1"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-current transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-6">
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="hidden md:block hover:opacity-60 transition-opacity"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            <button
              className="relative hover:opacity-60 transition-opacity"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
              <span className="absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 bg-black text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Menu Overlay - Dynamically Loaded */}
      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenuOverlay navLinks={linksToDisplay} onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
