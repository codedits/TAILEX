import { Product } from "@/lib/types";
import FeaturedGrid from "@/components/sections/FeaturedGrid";
import { HomepageSection } from "@/lib/types";

interface HomeProductsLoaderProps {
    productsPromise: Promise<Product[]>;
    content?: HomepageSection['content'];
}

/**
 * Server Component that awaits products and renders the featured grid.
 */
export async function HomeProductsLoader({ productsPromise, content }: HomeProductsLoaderProps) {
    const products = await productsPromise;

    return (
        <div className="w-full">
            <div className="w-full text-center mb-6 md:mb-10 pt-4 md:pt-6 overflow-visible">
                <h2 className="font-great-vibes text-red-900 text-4xl md:text-5xl lg:text-6xl leading-normal select-none">
                    {content?.title || 'New Arrivals'}
                </h2>
            </div>

            <FeaturedGrid
                products={products}
            />
        </div>
    );
}
