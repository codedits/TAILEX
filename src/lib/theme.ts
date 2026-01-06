// src/lib/theme.ts
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createStaticClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

export type Theme = 'light' | 'dark'
export type BrandConfig = {
    mode: Theme
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    foregroundColor: string
    font: string
    borderRadius: string
}

const defaultBrandConfig: BrandConfig = {
    mode: 'light',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    font: 'manrope',
    borderRadius: '0.5rem'
}

// Cached fetcher for brand config
const getCachedSupabaseConfig = unstable_cache(
    async () => {
        const supabase = createStaticClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'theme')
            .maybeSingle()
        return data?.value
    },
    ['brand-config-db'],
    { tags: ['site_config'], revalidate: 3600 }
)

export async function getTheme(): Promise<Theme> {
    const cookieStore = await cookies()
    return (cookieStore.get('theme')?.value as Theme) || 'light'
}

export async function getBrandConfig(): Promise<BrandConfig> {
    try {
        // First, check cookies for fast access (Zero Flash)
        const cookieStore = await cookies()
        const cachedPrimary = cookieStore.get('brand-primary')?.value
        const cachedFont = cookieStore.get('brand-font')?.value
        
        // If we have cached values, use them for instant render
        if (cachedPrimary && cachedFont) {
            return {
                ...defaultBrandConfig,
                primaryColor: cachedPrimary,
                font: cachedFont
            }
        }
        
        // Otherwise, fetch from cache/database
        const themeConfig = await getCachedSupabaseConfig()
        
        if (themeConfig) {
            return { ...defaultBrandConfig, ...themeConfig }
        }
        
        return defaultBrandConfig
    } catch {
        return defaultBrandConfig
    }
}
