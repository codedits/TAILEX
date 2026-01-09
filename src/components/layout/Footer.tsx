"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
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
      title: 'Navigation',
      links: [
        { label: 'Collection', url: '/collection' },
        { label: 'Product', url: '/product' },
        { label: 'About', url: '/about' },
      ]
    },
    {
      title: 'Info',
      links: [
        { label: 'News', url: '/news' },
        { label: 'Contact', url: '/contact' },
        { label: 'Support', url: '/support' },
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

  // Parse copyright string with placeholders
  const copyrightText = (config.copyright || defaultConfig.copyright!)
    .replace('{year}', String(currentYear))
    .replace('{brand}', brandName);

  // Build social links from config
  const socialLinks = [
    social.facebook && { name: 'Facebook', href: social.facebook, Icon: Facebook },
    social.instagram && { name: 'Instagram', href: social.instagram, Icon: Instagram },
    social.twitter && { name: 'X/Twitter', href: social.twitter, Icon: Twitter },
    social.youtube && { name: 'YouTube', href: social.youtube, Icon: Youtube },
  ].filter(Boolean) as { name: string; href: string; Icon: typeof Facebook }[];

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
              {brandName}
            </Link>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              {config.tagline || defaultConfig.tagline}
            </p>
          </motion.div>

          {/* Dynamic Columns */}
          {(config.columns || defaultConfig.columns).map((column, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="font-display text-sm uppercase tracking-wider text-foreground mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links?.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.url}
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social Links */}
          {config.showSocial && socialLinks.length > 0 && (
            <motion.div variants={itemVariants}>
              <h4 className="font-display text-sm uppercase tracking-wider text-foreground mb-4">
                Social
              </h4>
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                    >
                      <link.Icon className="w-4 h-4" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30 px-6 md:px-12 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
