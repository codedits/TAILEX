import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CollectionBrowser from "@/components/CollectionBrowser";
import { createClient } from "@/lib/supabase/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { type Product, type Collection } from "@/lib/types";

export const revalidate = 60; // ISR

export default async function CollectionPage() {
  const supabase = await createClient();
  
  // Fetch all Products (no status filter for now - DB may not have status column)
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  // Fetch Visible Collections
  const { data: collections } = await supabase.from('collections').select('*').order('title', { ascending: true });

  const safeProducts = (products || []) as Product[];
  const safeCollections = (collections || []) as Collection[];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 md:px-12">
        {/* Breadcrumbs */}
        <div className="mb-12">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shop All</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-4">
            The Collection
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg font-light">
            Timeless pieces designed for the modern wardrobe. Quality craftsmanship meets contemporary silhouette.
          </p>
        </div>

        <CollectionBrowser products={safeProducts} collections={safeCollections} />
      </div>

      <Footer />
    </main>
  );
}
