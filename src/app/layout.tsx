import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800"],
  variable: "--font-body",
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
