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
    <footer className="w-full px-6 md:px-12 py-24 md:py-32 bg-background border-t border-border/10">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between gap-16 md:gap-24">

        {/* Giant Brand Title - Left */}
        <div className="flex-1">
          <Link href="/" className="text-[12vw] md:text-[8vw] font-bold tracking-tighter leading-[0.8] uppercase flex flex-col">
            <span>{brandName.split(' ')[0]}</span>
            <span>{brandName.split(' ').slice(1).join(' ')}</span>
          </Link>
          <p className="mt-8 text-sm md:text-base text-muted-foreground max-w-xs font-light tracking-tight">
            © {currentYear} {brandName}. All rights reserved. {config.tagline || defaultConfig.tagline}
          </p>
        </div>

        {/* Link Columns - Right */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
          {/* Dynamic Columns */}
          {(config.columns || defaultConfig.columns).map((column, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links?.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.url}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Links */}
          {config.showSocial && socialLinks.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">
                Social
              </h4>
              <ul className="space-y-4">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light flex items-center gap-2"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
