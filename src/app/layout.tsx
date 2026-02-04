import type { Metadata } from "next";
import { cookies } from "next/headers";
import { manrope, inter, playfair, spaceMono, getFont } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getBaseUrl, hexToHslValues } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";

// ============================================
// STATIC METADATA - No DB call, instant
// ============================================
const baseUrl = "https://tailex.studio";
const SITE_NAME = 'Tailex';
const TAGLINE = 'Premium Streetwear & Minimalist Clothing';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${SITE_NAME} | ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Shop ${SITE_NAME} for premium streetwear and minimalist clothing. Discover high-quality apparel designed for modern wardrobes. Experience Timeless Power.`,
  keywords: ["Premium Streetwear", "Tailex", "Minimalist Clothing", "Apparel", "Fashion", "Streetwear Brand"],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: `Shop ${SITE_NAME} for premium streetwear and minimalist clothing. High-quality apparel designed for modern wardrobes.`,
    type: "website",
    url: baseUrl,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Premium Streetwear`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: `Shop ${SITE_NAME} for premium streetwear and minimalist clothing. High-quality apparel designed for modern wardrobes.`,
    images: [`${baseUrl}/og-image.jpg`],
    creator: "@tailexstudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: '/tailexicon.svg',
    apple: '/tailexicon.svg',
  },
};

// ============================================
// DEFAULTS - Used when no cookie is set
// ============================================
const DEFAULTS = {
  theme: 'light' as const,
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  font: 'manrope',
  borderRadius: '0.5rem',
};

// ... imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  // Fetch Config from DB (Cached)
  const config = await StoreConfigService.getStoreConfig();

  // Force Light Mode for Storefront (Admin handles its own dark mode)
  const theme = 'light';

  // Brand settings from DB
  const primaryColor = config.theme.primaryColor;
  const fontName = config.theme.font;
  const borderRadius = config.theme.borderRadius;

  const font = getFont(fontName.toLowerCase());

  // Hero Images
  const defaultHeroImage = "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";
  const heroImage = config.hero.image || defaultHeroImage;
  const mobileHeroImage = config.hero.mobileImage;

  // Map Brand colors to shadcn HSL variables
  const hslPrimary = hexToHslValues(primaryColor);
  const hslBackground = hexToHslValues(config.theme.backgroundColor || '#ffffff');
  const hslForeground = hexToHslValues(config.theme.foregroundColor || '#000000');

  // Dynamic CSS variables
  const dynamicStyles = {
    colorScheme: theme,
    ['--brand-primary' as string]: primaryColor,
    ['--brand-radius' as string]: borderRadius,
    ['--font-display' as string]: `var(--font-${fontName})`,
    ['--font-body' as string]: `var(--font-${fontName})`,

    // Shadcn overrides
    ['--primary' as string]: hslPrimary,
    ['--background' as string]: hslBackground,
    ['--foreground' as string]: hslForeground,
    ['--radius' as string]: borderRadius,
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={theme}
      style={dynamicStyles}
      className={`${theme} ${manrope.variable} ${inter.variable} ${playfair.variable} ${spaceMono.variable}`}
    >
      <head>
        {/* Preconnect to critical CDNs for faster resource loading */}
        <link rel="preconnect" href="https://ipumyrjzquyglyesiuur.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ipumyrjzquyglyesiuur.supabase.co" />
        <link rel="preconnect" href="https://framerusercontent.com" />
        <link rel="dns-prefetch" href="https://framerusercontent.com" />

        {/* Preload Hero Image for instant LCP - Responsive */}
        {mobileHeroImage && (
          <link
            rel="preload"
            as="image"
            href={mobileHeroImage}
            media="(max-width: 768px)"
            fetchPriority="high"
          />
        )}
        <link
          rel="preload"
          as="image"
          href={heroImage}
          media={mobileHeroImage ? "(min-width: 769px)" : undefined}
          fetchPriority="high"
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Tailex",
              "url": "https://tailex.studio",
              "logo": "https://tailex.studio/logo.png",
              "sameAs": [
                "https://instagram.com/tailexstudio",
                "https://twitter.com/tailexstudio"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "hello@tailex.studio",
                "contactType": "Customer Service"
              }
            })
          }}
        />
      </head>
      <body className={font.className}>
        <Providers initialConfig={config}>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}

