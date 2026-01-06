import type { Metadata } from "next";
import { manrope, inter, playfair, spaceMono, getFont } from "@/lib/fonts";
import { getTheme, getThemeConfig, getBrandConfig } from "@/lib/theme";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getBaseUrl, hexToHslValues } from "@/lib/utils";

const baseUrl = getBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandConfig();
  const siteName = brand.name || 'TAILEX';
  const tagline = brand.tagline || 'Timeless Wardrobe, Everyday Power';
  
  return {
    metadataBase: new URL(baseUrl),
    title: `${siteName} | ${tagline}`,
    description: `Discover premium fashion essentials at ${siteName}. Quality craftsmanship meets modern style.`,
    keywords: ["fashion", "clothing", "premium clothing", "style", siteName.toLowerCase()],
    openGraph: {
      title: `${siteName} | ${tagline}`,
      description: `Discover premium fashion essentials. Quality craftsmanship meets modern style.`,
      type: "website",
      url: baseUrl,
      images: [`${baseUrl}/og-image.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | ${tagline}`,
      description: `Discover premium fashion essentials. Quality craftsmanship meets modern style.`,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  const themeConfig = await getThemeConfig();
  const fontName = themeConfig.font.toLowerCase();
  const font = getFont(fontName);

  // Map Brand colors to shadcn HSL variables for full theme integration
  const hslPrimary = hexToHslValues(themeConfig.primaryColor);
  const hslBackground = hexToHslValues(themeConfig.backgroundColor);
  const hslForeground = hexToHslValues(themeConfig.foregroundColor);

  // Dynamic CSS variables that are injected at the root level.
  // These override defaults from globals.css and can be controlled by the Admin Theme panel.
  const dynamicStyles = {
    colorScheme: theme,
    // Brand Specific
    ['--brand-primary' as string]: themeConfig.primaryColor,
    ['--brand-secondary' as string]: themeConfig.secondaryColor,
    ['--brand-background' as string]: themeConfig.backgroundColor,
    ['--brand-foreground' as string]: themeConfig.foregroundColor,
    ['--brand-radius' as string]: themeConfig.borderRadius,
    ['--font-display' as string]: `var(--font-${fontName})`,
    ['--font-body' as string]: `var(--font-${fontName})`,

    // Shadcn / System Overrides (HSL values)
    ['--primary' as string]: hslPrimary,
    ['--background' as string]: hslBackground,
    ['--foreground' as string]: hslForeground,
    ['--radius' as string]: themeConfig.borderRadius,
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
