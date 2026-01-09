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
        layout
    ] = await Promise.all([
        getHeroConfig(),
        getBenefitsConfig(),
        getFooterConfig(),
        getSocialConfig(),
        getLatestPosts(3),
        getFeaturedCollections(4),
        getFeaturedProducts(6),
        getBrandConfig(),
        getHomepageLayout()
    ]);

    return {
        hero: hero as HeroConfig,
        benefits: benefits as BenefitsConfig,
        footer: footer as FooterConfig,
        social: social as SocialConfig,
        posts,
        collections,
        products,
        brand: brand as BrandConfig,
        layout
    };
}
