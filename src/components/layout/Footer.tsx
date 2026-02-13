import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { FooterConfig, SocialConfig } from "@/lib/types";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { NewsletterForm } from "./NewsletterForm";

interface FooterProps {
  config?: FooterConfig;
  brandName?: string;
  social?: SocialConfig;
}

const defaultConfig: FooterConfig = {
  tagline: '',
  columns: [],
  showSocial: true,
  copyright: '© {year} {brand}. All rights reserved.'
};

/**
 * Footer - Superfluid Style
 * 
 * distinct 3-layer design:
 * 1. Big Navigation (Shop, About, Contact)
 * 2. Interaction Layer (Newsletter + Utilities)
 * 3. Brand Statement (Massive Typography)
 */
const Footer = ({
  config = defaultConfig,
  brandName = 'TAILEX',
  social = {}
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

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
    <footer className="bg-black text-white font-sans flex flex-col w-full relative z-10">

      {/* 1. TOP SECTION: Primary Navigation */}
      {/* Grid: 3 columns on desktop, stacked on mobile. Borders for the 'grid' look. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-white">
        {['SHOP', 'ABOUT', 'CONTACT'].map((item, idx) => (
          <Link
            href={`/${item.toLowerCase()}`}
            key={item}
            className={`
              group relative h-[30vh] lg:h-[40vh] flex items-center justify-center 
              border-b border-white lg:border-b-0
              ${idx !== 2 ? 'lg:border-r border-white' : ''}
              hover:bg-white hover:text-black transition-colors duration-500
            `}
          >
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {item}
            </span>
          </Link>
        ))}
      </div>

      {/* 2. MIDDLE SECTION: Newsletter & Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full border-t border-white">

        {/* Left: Newsletter / Movement */}
        <div className="p-8 md:p-16 lg:p-24 border-b lg:border-b-0 border-white lg:border-r flex flex-col justify-between">
          <div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-[0.9] tracking-tight max-w-xl">
              JOIN THE <br />
              {brandName} <br />
              MOVEMENT
            </h3>
          </div>
          <div className="mt-12 w-full max-w-md">
            <p className="text-sm font-bold uppercase tracking-widest mb-2">EMAIL</p>
            <NewsletterForm placeholder="ENTER YOUR EMAIL" />
            <p className="text-[10px] uppercase mt-4 text-white/60">
              By subscribing you agree to our privacy policy.
            </p>
          </div>
        </div>

        {/* Right: Utility Links Grid */}
        <div className="p-8 md:p-16 lg:p-24 bg-black">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {/* Help Column */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-2">HELP</h4>
              <ul className="flex flex-col gap-2">
                {[
                  { name: 'Contact Us', href: '/contact' },
                  { name: 'FAQ', href: '/contact' },
                  { name: 'Shipments', href: '/contact' },
                  { name: 'Payments', href: '/contact' },
                  { name: 'Track Your Order', href: '/account' },
                  { name: 'Returns', href: '/contact' },
                ].map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-2">LEGAL INFO</h4>
              <ul className="flex flex-col gap-2">
                {[
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms & Conditions', href: '/terms' },
                  { name: 'Return Policy', href: '/terms' },
                  { name: 'Cookie Policy', href: '/cookies' },
                ].map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Column */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-2">FOLLOW US</h4>
              <ul className="flex flex-col gap-2">
                {[...socialLinks, { name: 'Tiktok', href: 'https://tiktok.com/@tailex' }].map((link, i) => (
                  <li key={link.name || i}>
                    <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BRAND SECTION: Massive Typography */}
      <div className="relative w-full overflow-hidden border-t border-white py-4 lg:py-0">
        <h1 className="text-[15vw] leading-none font-bold tracking-tighter text-center uppercase select-none">
          {brandName}
        </h1>
      </div>

      {/* 4. BOTTOM BAR */}
      <div className="w-full px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/20">
        {/* Icons / Values */}
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-1 group">
            <span className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs group-hover:bg-white group-hover:text-black transition-colors">⚡</span>
            <span className="text-[8px] uppercase tracking-widest">FAST</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <span className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs group-hover:bg-white group-hover:text-black transition-colors">∞</span>
            <span className="text-[8px] uppercase tracking-widest">DURABLE</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <span className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs group-hover:bg-white group-hover:text-black transition-colors">★</span>
            <span className="text-[8px] uppercase tracking-widest">PREMIUM</span>
          </div>
        </div>

        {/* Scroll Top */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <ScrollToTopButton />
        </div>

        {/* Copyright & Cards */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] uppercase text-white/60">
          <span>{copyrightText}</span>
          <div className="flex gap-2">
            <span className="w-8 h-5 bg-white/10 rounded" />
            <span className="w-8 h-5 bg-white/10 rounded" />
            <span className="w-8 h-5 bg-white/10 rounded" />
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
