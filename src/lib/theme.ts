// src/lib/theme.ts
import { cookies } from 'next/headers'
import { createClient as createStaticClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import type { 
    BrandConfig as BrandConfigType, 
    HeroConfig, 
    SocialConfig, 
    BenefitsConfig, 
    FooterConfig,
    MenuItem
} from '@/lib/types'

export type Theme = 'light' | 'dark'
export type ThemeConfig = {
    mode: Theme
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    foregroundColor: string
    font: string
    borderRadius: string
}

const defaultThemeConfig: ThemeConfig = {
    mode: 'light',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    font: 'manrope',
    borderRadius: '0.5rem'
}

const defaultBrandConfig: BrandConfigType = {
    name: 'TAILEX',
    tagline: 'Premium Fashion',
    announcement: '',
    showAnnouncement: false
}

const defaultHeroConfig: HeroConfig = {
    heading: 'Winter Collection',
    subheading: 'Discover the new trends',
    ctaText: 'Shop Now',
    ctaLink: '/collection'
}

const defaultSocialConfig: SocialConfig = {
    instagram: '',
    twitter: '',
    facebook: ''
}

const defaultBenefitsConfig: BenefitsConfig = {
    enabled: true,
    items: [
        { icon: 'truck', text: 'Free shipping on orders over $75' },
        { icon: 'rotate', text: '14-day hassle-free returns' },
        { icon: 'shield', text: '30-day product warranty' },
        { icon: 'headphones', text: 'Customer support 24/7' }
    ]
}

const defaultFooterConfig: FooterConfig = {
    tagline: 'Timeless wardrobe essentials designed for everyday confidence.',
    columns: [
        { title: 'Navigation', handle: 'footer-nav' },
        { title: 'Info', handle: 'footer-info' }
    ],
    showSocial: true,
    copyright: '© {year} {brand}. All rights reserved.'
}

// Create static supabase client for caching
const getSupabase = () => createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ==========================================
// CACHED FETCHERS (with revalidation tags)
// ==========================================

// Unified site_config fetcher - gets all keys in one call
export const getSiteConfig = unstable_cache(
    async () => {
        const supabase = getSupabase()
        const { data } = await supabase
            .from('site_config')
            .select('key, value')
        
        const config: Record<string, unknown> = {}
        data?.forEach(row => {
            config[row.key] = row.value
        })
        return config
    },
    ['site-config-all'],
    { tags: ['site_config'], revalidate: 300 } // 5 minutes
)

// Navigation menu fetcher
export const getNavigation = unstable_cache(
    async (handle = 'main-menu'): Promise<MenuItem[]> => {
        const supabase = getSupabase()
        const { data } = await supabase
            .from('navigation_menus')
            .select('items')
            .eq('handle', handle)
            .maybeSingle()
        return (data?.items as MenuItem[]) || []
    },
    ['navigation'],
    { tags: ['navigation_menus'], revalidate: 300 }
)

// Blog posts fetcher (for NewsSection)
export const getLatestPosts = unstable_cache(
    async (limit = 3) => {
        const supabase = getSupabase()
        const { data } = await supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, featured_image, published_at, author_name')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(limit)
        return data || []
    },
    ['blog-posts-latest'],
    { tags: ['blog_posts'], revalidate: 300 }
)

// ==========================================
// TYPED CONFIG GETTERS (with defaults)
// ==========================================

export async function getTheme(): Promise<Theme> {
    const cookieStore = await cookies()
    return (cookieStore.get('theme')?.value as Theme) || 'light'
}

export async function getThemeConfig(): Promise<ThemeConfig> {
    try {
        const config = await getSiteConfig()
        const themeConfig = config.theme as Partial<ThemeConfig> | undefined
        return { ...defaultThemeConfig, ...themeConfig }
    } catch {
        return defaultThemeConfig
    }
}

export async function getBrandConfig(): Promise<BrandConfigType> {
    try {
        const config = await getSiteConfig()
        const brandConfig = config.brand as Partial<BrandConfigType> | undefined
        return { ...defaultBrandConfig, ...brandConfig }
    } catch {
        return defaultBrandConfig
    }
}

export async function getHeroConfig(): Promise<HeroConfig> {
    try {
        const config = await getSiteConfig()
        const heroConfig = config.hero as Partial<HeroConfig> | undefined
        return { ...defaultHeroConfig, ...heroConfig }
    } catch {
        return defaultHeroConfig
    }
}

export async function getSocialConfig(): Promise<SocialConfig> {
    try {
        const config = await getSiteConfig()
        const socialConfig = config.social as Partial<SocialConfig> | undefined
        return { ...defaultSocialConfig, ...socialConfig }
    } catch {
        return defaultSocialConfig
    }
}

export async function getBenefitsConfig(): Promise<BenefitsConfig> {
    try {
        const config = await getSiteConfig()
        const benefitsConfig = config.benefits as Partial<BenefitsConfig> | undefined
        return { ...defaultBenefitsConfig, ...benefitsConfig }
    } catch {
        return defaultBenefitsConfig
    }
}

export async function getFooterConfig(): Promise<FooterConfig> {
    try {
        const config = await getSiteConfig()
        const footerConfig = config.footer as Partial<FooterConfig> | undefined
        return { ...defaultFooterConfig, ...footerConfig }
    } catch {
        return defaultFooterConfig
    }
}

// ==========================================
// FULL PAGE CONFIG (for SSR pages)
// ==========================================

export type FullSiteConfig = {
    theme: ThemeConfig
    brand: BrandConfigType
    hero: HeroConfig
    social: SocialConfig
    benefits: BenefitsConfig
    footer: FooterConfig
    navigation: MenuItem[]
}

export async function getFullSiteConfig(): Promise<FullSiteConfig> {
    const [configData, navigation] = await Promise.all([
        getSiteConfig(),
        getNavigation('main-menu')
    ])

    return {
        theme: { ...defaultThemeConfig, ...(configData.theme as Partial<ThemeConfig>) },
        brand: { ...defaultBrandConfig, ...(configData.brand as Partial<BrandConfigType>) },
        hero: { ...defaultHeroConfig, ...(configData.hero as Partial<HeroConfig>) },
        social: { ...defaultSocialConfig, ...(configData.social as Partial<SocialConfig>) },
        benefits: { ...defaultBenefitsConfig, ...(configData.benefits as Partial<BenefitsConfig>) },
        footer: { ...defaultFooterConfig, ...(configData.footer as Partial<FooterConfig>) },
        navigation
    }
}
