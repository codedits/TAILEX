"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, ArrowRight, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { FooterConfig, SocialConfig } from "@/lib/types";

interface FooterProps {
  config?: FooterConfig;
  brandName?: string;
  social?: SocialConfig;
}

const defaultConfig: FooterConfig = {
  // Config is now driven by theme.ts, this is just a fallback for typing/safety
  tagline: '',
  columns: [],
  showSocial: true,
  copyright: '© {year} {brand}. All rights reserved.'
};

const Footer = ({
  config = defaultConfig,
  brandName = 'TAILEX',
  social = {}
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  const copyrightText = (config.copyright || '© {year} {brand}. All rights reserved.')
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
    <footer className="bg-black text-white border-t border-white/10 font-sans relative overflow-hidden">
      {/* Subtle Background Pattern (Optional) */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <motion.div
        className="max-w-[1920px] mx-auto px-6 md:px-12 pt-24 pb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24 mb-24">

          {/* Brand Column */}
          <motion.div variants={itemVariants} className="max-w-sm">
            <Link href="/" className="inline-block text-4xl font-light tracking-tighter mb-6 hover:opacity-80 transition-opacity">
              {brandName}
            </Link>
            <p className="text-white/60 font-light leading-relaxed text-sm">
              {config.tagline}
            </p>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="bg-transparent border-b border-white/20 text-white placeholder:text-white/20 py-2 text-sm w-full focus:outline-none focus:border-white transition-colors"
                />
                <button className="text-white hover:text-white/70 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Links Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {(config.columns || []).map((column, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex flex-col gap-6">
                <h4 className="font-medium text-xs text-white uppercase tracking-[0.2em]">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {column.links?.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.url}
                        className="text-sm font-light text-white/50 hover:text-white transition-colors block w-fit"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end md:items-center pt-8 border-t border-white/5 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                  <link.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-white/30 font-light">
              {copyrightText}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
            >
              Back to Top
              <ArrowUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
};

export default Footer;
