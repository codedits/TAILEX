"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { CartSheet } from "@/components/CartSheet";
import { SearchModal } from "@/components/SearchModal";

interface NavLinkItem {
  label: string;
  url: string;
}

const Navbar = ({ 
  brandName = "TAILEX",
  navItems = []
}: { 
  brandName?: string,
  navItems?: NavLinkItem[]
}) => {
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

  // Default links if none provided from DB
  const defaultLinks = [
    { label: "Collection", url: "/collection" },
    { label: "Product", url: "/product" },
    { label: "About", url: "/about" },
    { label: "Journal", url: "/news" },
  ];

  const linksToDisplay = navItems.length > 0 ? navItems : defaultLinks;

  return (
    <>
      <CartSheet />
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "h-20 bg-background/80 backdrop-blur-md border-b border-border/50 text-foreground" 
            : "h-24 bg-transparent text-white mix-blend-difference"
        }`}
      >
        <div className="px-6 md:px-12 h-full flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-black tracking-tighter uppercase z-50 relative hover:opacity-70 transition-opacity"
          >
            {brandName}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-12">
            {linksToDisplay.map((link) => (
              <Link
                key={link.label}
                href={link.url}
                className="text-[10px] font-medium uppercase tracking-[0.3em] hover:opacity-60 transition-opacity relative group"
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-foreground' : 'bg-white'}`} />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6 z-50 relative">
            <SearchModal />
            
            <Link href="/login" className="hidden md:block hover:opacity-70 transition-opacity">
              <User className="w-5 h-5" />
            </Link>

            <button 
              className="relative group hover:opacity-70 transition-opacity"
              onClick={() => setIsCartOpen(true)}
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] hidden md:inline-block mr-2">Cart</span>
              <span className="text-[10px] font-medium">({cartCount})</span>
            </button>

            <button
              className="md:hidden hover:opacity-70 transition-opacity text-[10px] font-medium tracking-[0.3em]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? "CLOSE" : "MENU"}
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
              {linksToDisplay.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                >
                  <Link
                    href={link.url}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-6xl md:text-8xl font-black uppercase tracking-tighter hover:text-neutral-500 transition-colors"
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
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
