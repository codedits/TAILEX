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
 * Footer - Server Component
 * 
 * Optimized for streaming:
 * - No "use client" - rendered on server
 * - CSS animations instead of Framer Motion
 * - Interactivity (scroll-to-top) in client island
 * - Wrapped in Suspense by parent - streams last
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
    <footer className="bg-black text-white border-t border-white/10 font-sans relative overflow-hidden section-fade-in">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 pt-24 pb-12">
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24 mb-24">

          {/* Brand Column */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block text-4xl font-light tracking-tighter mb-6 hover:opacity-80 transition-opacity">
              {brandName}
            </Link>
            <p className="text-white/60 font-light leading-relaxed text-sm">
              {config.tagline}
            </p>

            <NewsletterForm />
          </div>

          {/* Links Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {(config.columns || []).map((column, idx) => (
              <div key={idx} className="flex flex-col gap-6">
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
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center pt-8 border-t border-white/5 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label={`Visit our ${link.name} page`}
                >
                  <link.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-white/30 font-light">
              {copyrightText}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <ScrollToTopButton />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
