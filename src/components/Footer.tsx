"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const footerLinks = {
    navigation: [
      { name: "Collection", href: "/collection" },
      { name: "Product", href: "/product" },
      { name: "About", href: "/about" },
    ],
    info: [
      { name: "News", href: "/news" },
      { name: "Contact", href: "/contact" },
      { name: "Support", href: "/support" },
    ],
    social: [
      { name: "Facebook", href: "https://facebook.com" },
      { name: "Instagram", href: "https://instagram.com" },
      { name: "X/Twitter", href: "https://twitter.com" },
    ],
  };

  return (
    <footer className="bg-secondary/50 border-t border-border/30">
      <motion.div 
        className="px-6 md:px-12 py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-2">
            <Link href="/" className="font-display text-2xl text-foreground mb-4 block">
              TAILEX
            </Link>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Timeless wardrobe essentials designed for everyday confidence. 
              Quality craftsmanship meets modern style.
            </p>
          </motion.div>

          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground mb-4">
              Info
            </h4>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground mb-4">
              Social
            </h4>
            <ul className="space-y-3">
              {footerLinks.social.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30 px-6 md:px-12 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © {currentYear} TAILEX. All rights reserved. Design by Mino.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
