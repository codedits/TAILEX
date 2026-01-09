import {
    getHeroConfig,
    getBenefitsConfig,
    getFooterConfig,
    getSocialConfig,
    getLatestPosts,
    getFeaturedCollections,
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

export interface HomeData {
    hero: HeroConfig;
    benefits: BenefitsConfig;
    footer: FooterConfig;
    social: SocialConfig;
    posts: any[];
    collections: Collection[];
    products: Product[];
    brand: BrandConfig;
    layout: HomepageSection[];
    categoryGrid?: { aspectRatio: string };
}

export async function getHomeData(): Promise<HomeData> {
    const [
        hero,
        benefits,
        footer,
        social,
        posts,
        collections,
        products,
        brand,
        layout,
        config
    ] = await Promise.all([
        getHeroConfig(),
        getBenefitsConfig(),
        getFooterConfig(),
        getSocialConfig(),
        getLatestPosts(3),
        getFeaturedCollections(4),
        getFeaturedProducts(6),
        getBrandConfig(),
        getHomepageLayout(),
        StoreConfigService.getStoreConfig() // Fetch full config to get categoryGrid
    ]);

    const storeConfig = config as StoreConfig;

    return {
        hero: hero as HeroConfig,
        benefits: benefits as BenefitsConfig,
        footer: footer as FooterConfig,
        social: social as SocialConfig,
        posts,
        collections,
        products,
        brand: brand as BrandConfig,
        layout,
        categoryGrid: storeConfig.categoryGrid
    };
}
