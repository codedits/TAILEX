"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FooterConfig, SocialConfig } from "@/lib/types";

interface FooterProps {
  config?: FooterConfig;
  brandName?: string;
  social?: SocialConfig;
}

const defaultConfig: FooterConfig = {
  tagline: 'Timeless wardrobe essentials designed for everyday confidence.',
  columns: [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', url: '/collection/all' },
        { label: 'New Arrivals', url: '/collection/new' },
        { label: 'Best Sellers', url: '/collection/best-sellers' },
        { label: 'Accessories', url: '/collection/accessories' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', url: '/about' },
        { label: 'Sustainability', url: '/sustainability' },
        { label: 'Careers', url: '/careers' },
        { label: 'Press', url: '/press' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', url: '/faq' },
        { label: 'Shipping', url: '/shipping' },
        { label: 'Returns', url: '/returns' },
        { label: 'Contact', url: '/contact' },
      ]
    },
  ],
  showSocial: true,
  copyright: '© {year} {brand}. All rights reserved.'
};

const Footer = ({
  config = defaultConfig,
  brandName = 'TAILEX',
  social = {}
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Parse copyright string
  const copyrightText = (config.copyright || defaultConfig.copyright!)
    .replace('{year}', String(currentYear))
    .replace('{brand}', brandName);

  // Social Links
  const socialLinks = [
    social.facebook && { name: 'Facebook', href: social.facebook, Icon: Facebook },
    social.instagram && { name: 'Instagram', href: social.instagram, Icon: Instagram },
    social.twitter && { name: 'X', href: social.twitter, Icon: Twitter },
    social.youtube && { name: 'YouTube', href: social.youtube, Icon: Youtube },
  ].filter(Boolean) as { name: string; href: string; Icon: typeof Facebook }[];

  return (
    <footer className="bg-black text-white border-t border-white/10 font-sans">
      <motion.div
        className="max-w-[1920px] mx-auto px-6 md:px-12 py-20 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand & Newsletter Section - Spans 5 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col gap-8 pr-0 lg:pr-12">
            <div>
              <Link href="/" className="inline-block text-3xl font-bold tracking-tight mb-4">
                {brandName}
              </Link>
              <p className="text-white/60 leading-relaxed max-w-md text-base">
                {config.tagline || defaultConfig.tagline}
              </p>
            </div>

            {/* Newsletter Input */}
            <div className="flex flex-col gap-3 max-w-md">
              <label htmlFor="footer-email" className="text-sm font-medium text-white/90">
                Subscribe to our newsletter
              </label>
              <div className="relative group">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-white text-white/60 transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-white/40">
                By subscribing, you agree to our Privacy Policy and provide consent to receive updates from our company.
              </p>
            </div>
          </motion.div>

          {/* Links Grid - Spans 7 columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {(config.columns || defaultConfig.columns).map((column, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex flex-col gap-4">
                <h4 className="font-medium text-sm text-white uppercase tracking-wider">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {column.links?.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.url}
                        className="text-sm text-white/60 hover:text-white transition-colors block w-fit"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              {config.showSocial && socialLinks.length > 0 && (
                <>
                  <h4 className="font-medium text-sm text-white uppercase tracking-wider">
                    Follow Us
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {socialLinks.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-2 group w-fit"
                        >
                          <link.Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            {copyrightText}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs text-white/40 hover:text-white transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
