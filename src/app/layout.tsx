import type { Metadata } from "next";
import { cookies } from "next/headers";
import { manrope, inter, playfair, spaceMono, getFont } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { getBaseUrl, hexToHslValues } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";

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
      <body className={font.className}>
        <Providers initialConfig={config}>{children}</Providers>
      </body>
    </html>
  );
}

