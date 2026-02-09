import {
    getHeroConfig,
    getBenefitsConfig,
    getFooterConfig,
    getSocialConfig,
    getLatestPosts,
    getFeaturedCollections,
    getCollectionsWithProducts,
    getFeaturedProducts,
    getBrandConfig,
    getHomepageLayout
} from "@/lib/theme";

import {
    ThemeConfig,
    BrandConfig,
    HeroConfig,
    SocialConfig,
    BenefitsConfig,
    FooterConfig,
    Collection,
    Product,
    HomepageSection
} from "@/lib/types";
import { StoreConfigService, StoreConfig } from "@/services/config";

export async function getHomeData(): Promise<HomeData> {
    // 1. Critical Data - Await these immediately for the Hero & Layout
    const [
        hero,
        benefits,
        footer,
        social,
        brand,
        layout,
        config
    ] = await Promise.all([
        getHeroConfig(),
        getBenefitsConfig(),
        getFooterConfig(),
        getSocialConfig(),
        getBrandConfig(),
        getHomepageLayout(),
        StoreConfigService.getStoreConfig()
    ]);

    // 2. Deferred Data - Start fetching but DO NOT await
    // These promises will be passed to Suspense boundaries
    const postsPromise = getLatestPosts(3);
    const collectionsPromise = getCollectionsWithProducts(4, 8);
    const productsPromise = getFeaturedProducts(6);

    const storeConfig = config as StoreConfig;

    return {
        // Critical (Resolved)
        hero: hero as HeroConfig,
        benefits: benefits as BenefitsConfig,
        footer: footer as FooterConfig,
        social: social as SocialConfig,
        brand: brand as BrandConfig,
        layout,
        categoryGrid: storeConfig.categoryGrid,

        // Deferred (Promises)
        postsPromise,
        collectionsPromise,
        productsPromise,

        // Keep types compatible for now, but valid values will come from promises
        posts: [],
        collections: [],
        products: []
    };
}

// Update Interface to support Promises
export interface HomeData {
    hero: HeroConfig;
    benefits: BenefitsConfig;
    footer: FooterConfig;
    social: SocialConfig;
    brand: BrandConfig;
    layout: HomepageSection[];
    categoryGrid?: { aspectRatio: string };

    // Deferred Data
    postsPromise: Promise<any[]>;
    collectionsPromise: Promise<Collection[]>;
    productsPromise: Promise<Product[]>;

    // Deprecated (kept for temporary compat, will be empty)
    posts: any[];
    collections: Collection[];
    products: Product[];
}
