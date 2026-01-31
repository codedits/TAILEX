import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductDetail from "@/components/product/ProductDetail";
import Featuring from "@/components/sections/Featuring";
import RelatedProducts from "@/components/product/RelatedProducts";
import { StoreConfigService } from "@/services/config";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Product } from "@/lib/types";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch product for metadata
  const { data: product } = await supabase
    .from("products")
    .select("title, description, cover_image")
    .eq("slug", slug)
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = `${product.title} | TAILEX`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Discover ${product.title} at TAILEX.`;

  const images = product.cover_image ? [product.cover_image] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch product and all config in parallel
  const [productResult, config] = await Promise.all([
    supabase
      .from("products")
      .select(`*, options:product_options(*), variants:product_variants(*)`)
      .eq("slug", slug)
      .single(),
    StoreConfigService.getStoreConfig()
  ]);

  if (productResult.error || !productResult.data) {
    console.error("Product not found:", productResult.error);
    notFound();
  }

  const typedProduct = productResult.data as Product;

  const brand = config.brand;
  const footerConfig = config.footer;
  const socialConfig = config.social;
  const navItemsList = config.navigation.main;

  // Fetch Related Products (excluding current product, same category preferred)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("id, title, slug, price, sale_price, cover_image, images")
    .eq("status", "active")
    .eq("category_id", typedProduct.category_id)
    .neq("id", typedProduct.id)
    .limit(4);

  const safeRelated = (relatedProducts || []) as Product[];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": typedProduct.title,
            "image": [typedProduct.cover_image, ...(typedProduct.images || [])],
            "description": typedProduct.description,
            "sku": typedProduct.id,
            "brand": {
              "@type": "Brand",
              "name": "Tailex"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://tailex.studio/product/${typedProduct.slug}`,
              "priceCurrency": "USD",
              "price": typedProduct.sale_price || typedProduct.price,
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            }
          })
        }}
      />
      <Navbar brandName={brand.name} navItems={navItemsList} />

      <div className="pt-24 pb-20 px-6 md:px-12">
        <ProductDetail product={typedProduct} />
      </div>

      <div className="w-full mb-20">
        <Featuring images={[typedProduct.cover_image, ...(typedProduct.images || [])].filter(Boolean) as string[]} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-2xl lg:text-3xl font-manrope font-black tracking-tight uppercase">
            You May Also Like
          </h2>
          <Link href="/shop" className="text-xs font-manrope font-bold uppercase tracking-widest underline underline-offset-8">
            View all
          </Link>
        </div>
        <RelatedProducts products={safeRelated} />
      </div>

      <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
    </main>
  );
}

