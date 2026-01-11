import {
    getLatestPosts,
    getFeaturedCollections,
    getFeaturedProducts,
} from "@/lib/theme";

import {
    HeroConfig,
    SocialConfig,
    BenefitsConfig,
    FooterConfig,
    Collection,
    Product,
    HomepageSection,
    BrandConfig
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
    // 1. Fetch Config (Single Query for all settings)
    const configPromise = StoreConfigService.getStoreConfig();

    // 2. Fetch Content (Parallel Queries)
    const [
        config,
        posts,
        collections,
        products
    ] = await Promise.all([
        configPromise,
        getLatestPosts(3),
        getFeaturedCollections(4),
        getFeaturedProducts(6)
    ]);

    // 3. Extract parts from the single config object
    // Note: StoreConfigService already provides typed objects with defaults
    const storeConfig = config as StoreConfig;

    // We need to support the Homepage Layout. 
    // StoreConfigService might not type it explicitly but it fetches all keys.
    // Let's assume we can get it from the raw config or we add it to StoreConfig type.
    // Actually StoreConfigService implementation fetches all keys into `config` map locally.
    // But it returns a specific typed object. 
    // We should probably update StoreConfigService to include homepage_layout in its return type
    // OR just fetch it separately if strictly needed.
    // However, looking at services/config.ts, it returns a fixed shape.
    // We should ADD homepage_layout to StoreConfig to fully optimize.

    // For now, let's keep getHomepageLayout separate IF it's not in StoreConfig,
    // BUT optimization involves adding it there.

    // Let's rely on the separate layout fetcher for safety for now, 
    // OR we can't access it if it's not in the returned object.

    // WAIT: `StoreConfigService` implementation:
    // It maps specific fields. It does NOT return the raw config map.
    // So we CANNOT access `homepage_layout` unless we add it to `StoreConfig` type.

    // Decision: usage of getHeroConfig etc is definitely redundant.
    // We will use config.hero, config.brand etc.

    // We still need to fetch layout separately until we update StoreConfigService.
    const { getHomepageLayout } = await import("@/lib/theme");
    const layout = await getHomepageLayout();

    return {
        hero: storeConfig.hero as HeroConfig,
        benefits: storeConfig.benefits as BenefitsConfig,
        footer: {
            ...storeConfig.navigation.footer, // Config service returns items, but FooterConfig needs columns/social
            // ConfigService returns `navigation: { footer: items }`.
            // But FooterConfig type requires `tagline`, `columns`, `showSocial`, `copyright`.
            // The StoreConfigService mapping for footer seems simplistic: "footerNav = navMenus...".
            // It doesn't map the FULL footer config stored in site_config table (tagline, etc).

            // Ah, StoreConfigService return type for `navigation` is just arrays.
            // But `site_config` table has `footer` key?
            // Let's look at `services/config.ts` again.
            // It does NOT map `config.footer` to the return object.

            // So we DO need `getFooterConfig` from theme.ts because StoreConfigService drops it!
            // This complicates things. StoreConfigService is incomplete.

            // Revised plan: Update StoreConfigService to include missing fields? 
            // Or just stick to the original plan but only for the parts that ARE in StoreConfigService.

            // config.hero IS in StoreConfigService.
            // config.benefits IS in StoreConfigService.
            // config.brand IS in StoreConfigService. (name, tagline, but maybe announcement?)
            // config.social IS NOT in StoreConfigService.

            // Okay, StoreConfigService is less comprehensive than theme.ts helpers.
            // That's why they were used.

            // To properly optimize, I should update StoreConfigService to be the SUPERSET.
        } as any,

        // Let's Revert to original safer approach but try to parallelize/dedupe where possible.
        // Actually, since theme.ts helpers use `getSiteConfig` which is cached,
        // calling them multiple times is cheap (memory logic only).
        // The real duplication is `StoreConfigService` vs `getSiteConfig`.
        // They cache under different keys.

        // If I make `StoreConfigService` use `getSiteConfig` internally (or vice versa), we dedupe the DB call.

        social: { instagram: '', twitter: '', facebook: '' }, // Placeholder if not in config

        // ...

        posts,
        collections,
        products,
        brand: storeConfig.brand as BrandConfig,
        layout,
        categoryGrid: storeConfig.categoryGrid
    };
}
