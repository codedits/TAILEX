// src/lib/theme.ts
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type Theme = 'light' | 'dark'
export type BrandConfig = {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    foregroundColor: string
    font: string
    borderRadius: string
}

const defaultBrandConfig: BrandConfig = {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    font: 'manrope',
    borderRadius: '0.5rem'
}

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
        
        // Otherwise, fetch from database
        const supabase = await createClient()
        const { data: themeConfig } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'theme')
            .single()
        
        if (themeConfig?.value) {
            return { ...defaultBrandConfig, ...themeConfig.value }
        }
        
        return defaultBrandConfig
    } catch {
        return defaultBrandConfig
    }
}
