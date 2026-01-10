import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppError } from './errors';
import { unstable_cache } from 'next/cache';

export type StoreConfig = {
    brand: { name: string; tagline: string; announcement: string; showAnnouncement: boolean };
    theme: {
        primaryColor: string;
        font: string;
        borderRadius: string;
        backgroundColor?: string;
        foregroundColor?: string;
        secondaryColor?: string; // Optional legacy
        mode?: 'light' | 'dark';
    };
    navigation: { main: any[]; footer: any[] };
    currency: { code: string; symbol: string };
    hero?: { heading?: string; subheading?: string; image?: string; ctaText?: string; ctaLink?: string };
    benefits?: { enabled: boolean; items: { icon: string; text: string }[] };
    categoryGrid?: { aspectRatio: string };
};

export const StoreConfigService = {
    getStoreConfig: unstable_cache(
        async (): Promise<StoreConfig> => {
            const supabase = await createAdminClient();
            const { data, error } = await supabase.from('site_config').select('key, value');

            if (error) throw new AppError(error.message, 'DB_ERROR');

            const { data: navMenus } = await supabase.from('navigation_menus').select('*');

            const config: any = {};
            data.forEach(row => {
                config[row.key] = row.value;
            });

            const mainNav = navMenus?.find(n => n.handle === 'main-menu')?.items || [];
            // If footer nav exists in DB use it, otherwise fallback/empty
            const footerNav = navMenus?.find(n => n.handle === 'footer')?.items || [];

            // Transform raw KV to typed object with defaults
            return {
                brand: config.brand || { name: 'TAILEX', tagline: '', announcement: '', showAnnouncement: false },
                theme: {
                    primaryColor: '#000000',
                    font: 'manrope',
                    borderRadius: '0.5rem',
                    backgroundColor: '#ffffff',
                    foregroundColor: '#000000',
                    ...config.theme // access DB overrides
                },
                navigation: { main: mainNav, footer: footerNav },
                currency: config.currency || { code: 'PKR', symbol: 'Rs.' },
                hero: config.hero || { heading: '', subheading: '', image: '', ctaText: '', ctaLink: '' },
                benefits: config.benefits || { enabled: true, items: [] },
                categoryGrid: config.categoryGrid || { aspectRatio: '0.8' } // Default to 4:5
            };
        },
        ['store-config'],
        { tags: ['site_config'], revalidate: 3600 }
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
