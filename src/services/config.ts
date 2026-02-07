import { createAdminClient } from '@/lib/supabase/admin';
import { AppError } from './errors';
import { unstable_cache } from 'next/cache';
import { HomepageSection, FooterConfig, SocialConfig, BenefitsConfig, GlobalDiscountConfig } from '@/lib/types';

export type StoreConfig = {
    brand: { name: string; tagline: string; announcement: string; showAnnouncement: boolean; logoUrl?: string };
    theme: {
        primaryColor: string;
        font: string;
        borderRadius: string;
        backgroundColor?: string;
        foregroundColor?: string;
        secondaryColor?: string;
        mode?: 'light' | 'dark';
    };
    navigation: { main: any[]; footer: any[] };
    footer: FooterConfig;
    social: SocialConfig;
    currency: { code: string; symbol: string };
    hero: {
        heading?: string;
        subheading?: string;
        image?: string;
        mobileImage?: string;
        ctaText?: string;
        ctaLink?: string;
        overlayOpacity?: number;
        slides?: Array<{
            id: string;
            image: string;
            mobileImage?: string;
            heading?: string;
            subheading?: string;
            ctaText?: string;
            ctaLink?: string;
        }>;
        autoPlayInterval?: number;
    };
    benefits: BenefitsConfig;
    categoryGrid: { aspectRatio: string };
    homepageLayout: HomepageSection[];
    globalDiscount: GlobalDiscountConfig;
    delivery: {
        standard: { price: number; time: string; description: string };
        express: { price: number; time: string; description: string };
        freeThreshold: number;
    };
};

export const StoreConfigService = {
    getStoreConfig: unstable_cache(
        async (): Promise<StoreConfig> => {
            const supabase = await createAdminClient();

            // 1. Fetch Key-Value Config
            const { data, error } = await supabase.from('site_config').select('key, value');
            if (error) throw new AppError(error.message, 'DB_ERROR');

            // 2. Fetch Navigation Menus
            const { data: navMenus } = await supabase.from('navigation_menus').select('*');

            // 3. Fetch Collections to inject into navigation
            const { data: collections } = await supabase
                .from('collections')
                .select('title, slug')
                .eq('is_visible', true)
                .order('sort_order', { ascending: true });

            const dbConfig: any = {};
            data.forEach(row => {
                dbConfig[row.key] = row.value;
            });

            // Format dynamic collections as navigation items
            const collectionNavItems = collections?.map(c => ({
                label: c.title.toUpperCase(),
                url: `/collection/${c.slug}`
            })) || [];

            // Combine manual links with dynamic collections
            // We want: HOME, Collections..., SHOP
            // Current manual main menu might have some of these, but we'll prepend HOME and inject collections
            const rawMainNav = navMenus?.find(n => n.handle === 'main-menu')?.items || [];
            const mainNav = [
                { label: 'HOME', url: '/' },
                ...collectionNavItems,
                { label: 'SHOP', url: '/shop' }
            ];

            // Navigation fallback logic
            const footerNavItems = navMenus?.find(n => n.handle === 'footer')?.items || [];

            // Defaults
            const defaultBrand = { name: 'TAILEX', tagline: '', announcement: '', showAnnouncement: false };
            const defaultTheme = {
                primaryColor: '#000000',
                font: 'helvetica',
                borderRadius: '0.5rem',
                backgroundColor: '#ffffff',
                foregroundColor: '#000000',
                mode: 'light' as const
            };
            const defaultCurrency = { code: 'PKR', symbol: 'Rs.' };
            const defaultHero = { heading: '', subheading: '', image: '', mobileImage: '', ctaText: '', ctaLink: '', overlayOpacity: 0.3 };
            const defaultBenefits = { enabled: true, items: [] };
            const defaultGlobalDiscount: GlobalDiscountConfig = {
                enabled: false,
                title: '',
                percentage: 0,
                imageUrl: '',
                delaySeconds: 5,
                showOncePerSession: true
            };

            const defaultDelivery = {
                standard: { price: 250, time: '3-5 Working Days', description: 'Reliable delivery via TCS or Leopards.' },
                express: { price: 450, time: '1-2 Working Days', description: 'Priority processing and overnight shipping.' },
                freeThreshold: 2000
            };

            const defaultFooter: FooterConfig = {
                tagline: 'Timeless wardrobe essentials.',
                columns: [], // Will be populated below if not in config
                showSocial: true,
                copyright: '© {year} {brand}. All rights reserved.'
            };

            const defaultSocial = { instagram: 'https://www.instagram.com/tailex.pakistan/', twitter: '', facebook: '' };

            // Merge DB config with defaults
            const brand = { ...defaultBrand, ...dbConfig.brand };
            const theme = { ...defaultTheme, ...dbConfig.theme };
            const currency = dbConfig.currency || defaultCurrency;
            const hero = { ...defaultHero, ...dbConfig.hero };
            const benefits = { ...defaultBenefits, ...dbConfig.benefits };
            const social = { ...defaultSocial, ...dbConfig.social };
            const globalDiscount = { ...defaultGlobalDiscount, ...dbConfig.global_discount };
            const delivery = { ...defaultDelivery, ...dbConfig.delivery };

            // Footer Logic: Merge DB footer config with defaults AND inject navigation items if needed
            const dbFooter = dbConfig.footer || {};
            const footer: FooterConfig = {
                ...defaultFooter,
                ...dbFooter,
                // Ensure columns exist. If DB has columns use them, otherwise use navigation menu items as a single column or empty
                columns: dbFooter.columns || (footerNavItems.length > 0 ? [{ title: 'Links', links: footerNavItems }] : [])
            };

            const homepageLayout = dbConfig.homepage_layout || [];
            const categoryGrid = dbConfig.categoryGrid || { aspectRatio: '0.8' };

            return {
                brand,
                theme,
                navigation: { main: mainNav, footer: footerNavItems }, // Keep for backward compat
                footer,
                social,
                currency,
                hero,
                benefits,
                categoryGrid,
                homepageLayout,
                globalDiscount,
                delivery
            };
        },
        ['store-config'],
        { tags: ['site_config', 'navigation_menus'], revalidate: 3600 }
    ),

    async updateConfig(key: string, value: any): Promise<void> {
        const supabase = await createAdminClient();
        const { error } = await supabase
            .from('site_config')
            .upsert({ key, value }, { onConflict: 'key' })
            .select();

        if (error) throw new AppError(error.message, 'DB_ERROR');
    }
};
