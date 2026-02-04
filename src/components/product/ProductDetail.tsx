"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
export default function ProductDetail({
  product
}: {
  product: Product
}) {
  // Construct image list
  const validImages = [product.cover_image, ...(product.images || [])].filter((img): img is string => !!img && img.trim().length > 0);
  const distinctImages = Array.from(new Set(validImages)); // De-duplicate

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[10px] font-manrope font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 md:mb-12 px-6 md:px-0 py-4 md:py-0">
        <Link href="/" className="hover:text-foreground transition-colors">Studio</Link>
        <span className="opacity-30">/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors">Catalog</Link>
        <span className="opacity-30">/</span>
        <span className="text-foreground truncate line-clamp-1 max-w-[200px] md:max-w-none">{product.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
        {/* Left Column: Media Gallery - ON TOP for mobile */}
        <div className="lg:col-span-7 order-1">
          <ProductGallery images={distinctImages} title={product.title} />
        </div>

        {/* Mobile Header (Vendor + Title) - BELOW gallery on mobile */}
        <div className="lg:hidden space-y-2 order-2 px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {product.vendor || "TAILEX Standard"}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 leading-tight">
            {product.title}
          </h1>
        </div>

        {/* Right Column: Information (Sticky) */}
        <div className="lg:col-span-5 relative order-3 px-6 md:px-0">
          <div className="sticky top-32">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
