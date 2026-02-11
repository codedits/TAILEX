import { notFound } from "next/navigation";
import { createStaticClient } from "@/lib/supabase/static";
import Navbar from "@/components/layout/Navbar";

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

// Pre-build all active product pages at deploy time (Shopify-style)
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'active');
  return (data || []).map((p) => ({ slug: p.slug }));
}

// Allow new products added after build to be ISR-rendered on demand
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();

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
  const supabase = createStaticClient();

  // Fetch product and all config in parallel
  const [productResult, config] = await Promise.all([
    supabase
      .from("products")
      .select(`*, options:product_options(*), variants:product_variants(*)`)
      .eq("slug", slug)
      .maybeSingle(),
    StoreConfigService.getStoreConfig()
  ]);

  if (productResult.error || !productResult.data) {
    if (productResult.error) {
      console.error("Product fetch error:", productResult.error);
    }
    notFound();
  }

  let productData = productResult.data;

  // Fetch inventory levels for variants
  if (productData.variants && productData.variants.length > 0) {
    const variantIds = productData.variants.map((v: any) => v.id);
    const { data: inventory } = await supabase
      .from("inventory_levels")
      .select("variant_id, available")
      .in("variant_id", variantIds);

    if (inventory) {
      // Build inventory map (sum across locations)
      const inventoryMap: Record<string, number> = {};
      for (const inv of inventory) {
        inventoryMap[inv.variant_id] = (inventoryMap[inv.variant_id] || 0) + (inv.available || 0);
      }

      // Attach inventory_quantity to each variant
      productData = {
        ...productData,
        variants: productData.variants.map((v: any) => ({
          ...v,
          inventory_quantity: inventoryMap[v.id] || 0
        }))
      };
    }
  }

  const typedProduct = productData as Product;

  const brand = config.brand;
  const footerConfig = config.footer;
  const socialConfig = config.social;
  const navItems = config.navigation.main;

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
      <Navbar brandName={brand.name} navItems={navItems} />

      <div className="pt-0 md:pt-8 pb-20 px-0 md:px-12">
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


    </main>
  );
}

