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

  // Use Cookie overrides if present (e.g. for user toggle), otherwise Config
  const theme = (cookieStore.get('theme')?.value as 'light' | 'dark') || 'light';

  // Brand settings from DB
  const primaryColor = config.theme.primaryColor;
  const fontName = config.theme.font;
  const borderRadius = config.theme.borderRadius;

  const font = getFont(fontName.toLowerCase());

  // Map Brand colors to shadcn HSL variables
  const hslPrimary = hexToHslValues(primaryColor);
  // We might want to derive secondary/background/foreground from primary or keep them white/black for now or add to Config
  // Current logic uses defaults. Let's stick to config for Primary.

  // Dynamic CSS variables
  const dynamicStyles = {
    colorScheme: theme,
    ['--brand-primary' as string]: primaryColor,
    ['--brand-radius' as string]: borderRadius,
    ['--font-display' as string]: `var(--font-${fontName})`,
    ['--font-body' as string]: `var(--font-${fontName})`,

    // Shadcn overrides
    ['--primary' as string]: hslPrimary,
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
        {/* Calder Co. Inspired Blue Glow Border */}
        <div className="fixed inset-0 pointer-events-none z-[9999] border-[12px] border-blue-500/10 blur-xl" />
        <div className="fixed inset-0 pointer-events-none z-[9999] border-[1px] border-blue-500/5" />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

