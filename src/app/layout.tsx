import type { Metadata } from "next";
import { manrope, inter, playfair, spaceMono, getFont } from "@/lib/fonts";
import { getTheme, getBrandConfig } from "@/lib/theme";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "TAILEX | Timeless Wardrobe, Everyday Power",
  description: "Discover premium menswear essentials at TAILEX. From crisp polos and refined shirts to versatile jackets — quality craftsmanship meets modern style.",
  keywords: ["menswear", "fashion", "clothing", "jackets", "shirts", "polos", "premium clothing", "men's fashion"],
  openGraph: {
    title: "TAILEX | Timeless Wardrobe, Everyday Power",
    description: "Discover premium menswear essentials. Quality craftsmanship meets modern style.",
    type: "website",
    url: "https://tailex.com",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAILEX | Timeless Wardrobe, Everyday Power",
    description: "Discover premium menswear essentials. Quality craftsmanship meets modern style.",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  const brand = await getBrandConfig();
  const font = getFont(brand.font);

  // Dynamic CSS variables that are injected at the root level.
  // These override defaults from globals.css and can be controlled by the Admin Theme panel.
  const dynamicStyles = {
    colorScheme: theme,
    ['--brand-primary' as string]: brand.primaryColor,
    ['--brand-secondary' as string]: brand.secondaryColor,
    ['--brand-background' as string]: brand.backgroundColor,
    ['--brand-foreground' as string]: brand.foregroundColor,
    ['--brand-radius' as string]: brand.borderRadius,
    ['--font-display' as string]: `var(--font-${brand.font})`,
    ['--font-body' as string]: `var(--font-${brand.font})`,
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
