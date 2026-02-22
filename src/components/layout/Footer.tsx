'use client';

import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, ChevronDown } from "lucide-react";
import { FooterConfig, SocialConfig } from "@/lib/types";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { NewsletterForm } from "./NewsletterForm";
import { useState } from "react";

interface FooterProps {
  config?: FooterConfig;
  brandName?: string;
  social?: SocialConfig;
}

const defaultConfig: FooterConfig = {
  tagline: 'Minimalist design, premium quality, enduring style.',
  columns: [],
  showSocial: true,
  copyright: '© {year} {brand}.'
};

const FooterColumn = ({
  title,
  links
}: {
  title: string;
  links: { name: string; href: string }[]
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col border-b border-neutral-900 lg:border-none">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between py-4 lg:py-0 lg:mb-6 w-full text-left"
      >
        <h4 className="text-white text-xs font-semibold uppercase tracking-widest">{title}</h4>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 transition-transform duration-300 lg:hidden ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Desktop always visible, Mobile toggleable */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <ul className="flex flex-col gap-3 pb-6 lg:pb-0">
          {links.map(link => (
            <li key={link.name}>
              <Link href={link.href} className="text-neutral-400 text-sm hover:text-white transition-colors duration-300">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


const Footer = ({
  config = defaultConfig,
  brandName = 'TAILEX',
  social = {}
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

  // Parse copyright string
  const copyrightText = (config.copyright || '© {year} {brand}.')
    .replace('{year}', String(currentYear))
    .replace('{brand}', brandName);

  // Social Links
  const socialLinks = [
    social.facebook && { name: 'Facebook', href: social.facebook, Icon: Facebook },
    social.instagram && { name: 'Instagram', href: social.instagram, Icon: Instagram },
    social.twitter && { name: 'X', href: social.twitter, Icon: Twitter },
    social.youtube && { name: 'YouTube', href: social.youtube, Icon: Youtube },
  ].filter(Boolean) as { name: string; href: string; Icon: typeof Facebook }[];

  const defaultSocialLinks = [
    { name: 'Instagram', href: 'https://instagram.com/tailex', Icon: Instagram },
    { name: 'X', href: 'https://twitter.com/tailex', Icon: Twitter },
    { name: 'Facebook', href: 'https://facebook.com/tailex', Icon: Facebook },
    { name: 'YouTube', href: 'https://youtube.com/tailex', Icon: Youtube },
  ];

  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

  return (
    <footer className="bg-black text-white font-sans border-t border-neutral-900 relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">

          {/* Left: Brand & Newsletter */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6">
            <div>
              <Link href="/" className="text-3xl font-bold tracking-tighter text-white inline-block uppercase">
                {brandName}
              </Link>
              <p className="mt-3 text-neutral-400 text-sm max-w-sm leading-relaxed">
                {config.tagline || 'Minimalist design, premium quality, enduring style.'}
              </p>
            </div>

            <div className="mt-2 text-white">
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4">
                Join our newsletter
              </h3>
              <div className="max-w-md">
                <NewsletterForm placeholder="Email address" />
              </div>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div className="w-full lg:w-7/12 grid grid-cols-1 md:grid-cols-3 gap-0 lg:gap-10 border-t border-neutral-900 lg:border-none">

            <FooterColumn
              title="Shop"
              links={[
                { name: 'All Products', href: '/shop' },
                { name: 'Collections', href: '/collection' }
              ]}
            />

            <FooterColumn
              title="Company"
              links={[
                { name: 'About Us', href: '/about' },
                { name: 'Journal', href: '/news' },
                { name: 'Careers', href: '/careers' },
                { name: 'Contact', href: '/contact' }
              ]}
            />

            <FooterColumn
              title="Support"
              links={[
                { name: 'My Account', href: '/account' },
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms & Conditions', href: '/terms' },
                { name: 'Cookie Policy', href: '/cookies' },
              ]}
            />

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-900">
        <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row justify-between items-center gap-10 relative">

          {/* Scroll To Top - Absolute Centered ABOVE text */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <ScrollToTopButton />
          </div>

          {/* Copyright */}
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest flex-1 text-center lg:text-left">
            <span>{copyrightText} All rights reserved.</span>
          </div>

          {/* Placeholder/Empty Mid for balance on desktop */}
          <div className="hidden lg:block flex-1" />

          {/* Social Links */}
          <div className="flex items-center justify-center lg:justify-end gap-6 flex-1">
            {displaySocialLinks.map((link, idx) => {
              const Icon = link.Icon;
              return (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-white transition-colors duration-300"
                  aria-label={`Follow us on ${link.name}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
