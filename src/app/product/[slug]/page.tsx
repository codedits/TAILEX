import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { getNavigation, getBrandConfig, getFooterConfig, getSocialConfig } from "@/lib/theme";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Product } from "@/lib/types";

export const revalidate = 60; // Revalidate every minute

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch product and all config in parallel
  const [productResult, navItems, brand, footerConfig, socialConfig] = await Promise.all([
    supabase
      .from("products")
      .select(`*, options(*), variants(*)`)
      .eq("slug", slug)
      .single(),
    getNavigation('main-menu'),
    getBrandConfig(),
    getFooterConfig(),
    getSocialConfig()
  ]);

  if (productResult.error || !productResult.data) {
    console.error("Product not found:", productResult.error);
    notFound();
  }

  const typedProduct = productResult.data as Product;

  // Fetch Related Products (excluding current product, same category preferred)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("id, title, slug, price, sale_price, cover_image, images")
    .eq("status", "active")
    .neq("id", typedProduct.id)
    .limit(4);

  const safeRelated = (relatedProducts || []) as Product[];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar brandName={brand.name} navItems={navItems} />

      <div className="pt-32 pb-20 px-6 md:px-12">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/product">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{typedProduct.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <ProductDetail product={typedProduct} relatedProducts={safeRelated} />
      </div>

      <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
    </main>
  );
}

