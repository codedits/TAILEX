import type { Metadata } from "next";
import { cookies } from "next/headers";
import { manrope, inter, playfair, spaceMono, getFont } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getBaseUrl, hexToHslValues } from "@/lib/utils";

// ============================================
// STATIC METADATA - No DB call, instant
// ============================================
const baseUrl = getBaseUrl();
const SITE_NAME = 'TAILEX';
const TAGLINE = 'Timeless Wardrobe, Everyday Power';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: `${SITE_NAME} | ${TAGLINE}`,
  description: `Discover premium fashion essentials at ${SITE_NAME}. Quality craftsmanship meets modern style.`,
  keywords: ["fashion", "clothing", "premium clothing", "style", SITE_NAME.toLowerCase()],
  openGraph: {
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: `Discover premium fashion essentials. Quality craftsmanship meets modern style.`,
    type: "website",
    url: baseUrl,
    images: [`${baseUrl}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: `Discover premium fashion essentials. Quality craftsmanship meets modern style.`,
    images: [`${baseUrl}/og-image.png`],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ============================================
  // LAYER 1: COOKIES - INSTANT (0ms, no await DB)
  // ============================================
  const cookieStore = await cookies();
  
  // Read all visual preferences from cookies
  const theme = (cookieStore.get('theme')?.value as 'light' | 'dark') || DEFAULTS.theme;
  const primaryColor = cookieStore.get('brand-primary')?.value || DEFAULTS.primaryColor;
  const secondaryColor = cookieStore.get('brand-secondary')?.value || DEFAULTS.secondaryColor;
  const backgroundColor = cookieStore.get('brand-background')?.value || DEFAULTS.backgroundColor;
  const foregroundColor = cookieStore.get('brand-foreground')?.value || DEFAULTS.foregroundColor;
  const fontName = cookieStore.get('font')?.value || DEFAULTS.font;
  const borderRadius = cookieStore.get('brand-radius')?.value || DEFAULTS.borderRadius;
  
  const font = getFont(fontName.toLowerCase());

  // Map Brand colors to shadcn HSL variables for full theme integration
  const hslPrimary = hexToHslValues(primaryColor);
  const hslBackground = hexToHslValues(backgroundColor);
  const hslForeground = hexToHslValues(foregroundColor);

  // Dynamic CSS variables - injected at root level, zero DB calls
  const dynamicStyles = {
    colorScheme: theme,
    // Brand Specific
    ['--brand-primary' as string]: primaryColor,
    ['--brand-secondary' as string]: secondaryColor,
    ['--brand-background' as string]: backgroundColor,
    ['--brand-foreground' as string]: foregroundColor,
    ['--brand-radius' as string]: borderRadius,
    ['--font-display' as string]: `var(--font-${fontName})`,
    ['--font-body' as string]: `var(--font-${fontName})`,

    // Shadcn / System Overrides (HSL values)
    ['--primary' as string]: hslPrimary,
    ['--background' as string]: hslBackground,
    ['--foreground' as string]: hslForeground,
    ['--radius' as string]: borderRadius,
  };
  
  return (
    <html 
      lang="en" 
      data-theme={theme} 
      style={dynamicStyles} 
      className={`${theme} ${manrope.variable} ${inter.variable} ${playfair.variable} ${spaceMono.variable}`}
    >
      <body className={font.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
