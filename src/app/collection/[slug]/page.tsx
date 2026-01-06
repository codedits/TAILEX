import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Product, Collection } from "@/lib/types";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the collection details
  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!collection) {
    notFound();
  }

  // Fetch products in this collection
  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const products = (productsData || []) as Product[];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div>
          <h1 className="section-title text-foreground mb-4">{collection.title} Collection</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            {collection.description || `Explore our selection of premium ${collection.title} essentials.`}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-20">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">No products found in this collection.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
