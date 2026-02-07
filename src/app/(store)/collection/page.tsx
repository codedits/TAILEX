import Navbar from "@/components/layout/Navbar";

import { CollectionCard } from "@/components/collection/CollectionCard";
import CollectionBrowser from "@/components/collection/CollectionBrowser";
import { createClient } from "@/lib/supabase/server";
import { StoreConfigService } from "@/services/config";
import { getProducts } from "@/lib/api/products";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { type Product, type Collection } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const revalidate = 300; // 5 minutes - aggressive cache

// Static metadata - no DB call
export const metadata: Metadata = {
  title: `Shop All Collections | TAILEX`,
  description: `Explore our complete range of premium fashion collections. Quality craftsmanship meets contemporary design.`,
};

export default async function CollectionPage() {
  const supabase = await createClient();

  // Fetch all config and data in parallel
  const [config, productsResult, collectionsResult] = await Promise.all([
    StoreConfigService.getStoreConfig(),
    // Use shared API to ensure consistency (e.g. status='active')
    getProducts({ status: 'active', limit: 1000, orderBy: 'created_at', order: 'desc' }),
    supabase
      .from('collections')
      .select('id, title, slug, image_url, description')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
  ]);

  const brand = config.brand;
  const footerConfig = config.footer;
  const socialConfig = config.social;
  const navItems = config.navigation.main;

  const safeProducts = (productsResult.data?.data || []) as Product[];
  const safeCollections = (collectionsResult.data || []) as Collection[];

  // Calculate product count per collection
  const collectionsWithCounts = safeCollections.map(col => ({
    ...col,
    product_count: safeProducts.filter(p => p.category_id === col.id).length
  }));

  return (
    <main className="min-h-screen bg-background">
      <Navbar brandName={brand.name} navItems={navItems} />

      <div className="pt-40 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        {/* Minimal Header */}
        <div className="mb-12">
          <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Collection
          </h1>
        </div>

        {/* Collections Grid - High-end editorial style */}
        {safeCollections.length > 0 && (
          <section className="mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {collectionsWithCounts.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                />
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        {/* <div className="h-px bg-border mb-12" /> */}

        {/* All Products Removed - See /shop */}
      </div>


    </main>
  );
}
