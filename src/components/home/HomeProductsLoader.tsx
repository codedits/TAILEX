import { Product } from "@/lib/types";
import ProductGridSection from "@/components/sections/ProductGridSection";
import { HOMEPAGE_TEXT } from "@/config/homepage-text";
import { HomepageSection } from "@/lib/types";

interface HomeProductsLoaderProps {
    productsPromise: Promise<Product[]>;
    content?: HomepageSection['content'];
}

/**
 * Server Component that awaits products and renders the grid.
 */
export async function HomeProductsLoader({ productsPromise, content }: HomeProductsLoaderProps) {
    const products = await productsPromise;

    if (!products || products.length === 0) return null;

    return (
        <div className="w-full">
            <ProductGridSection
                products={products}
                title={content?.title || HOMEPAGE_TEXT.featuredProducts.title}
                description={content?.description || HOMEPAGE_TEXT.featuredProducts.description}
            />
        </div>
    );
}
