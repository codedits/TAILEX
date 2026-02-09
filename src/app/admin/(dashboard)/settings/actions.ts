'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { processImage, generateImageFilename } from '@/lib/image-processor'

// ==========================================
// IMAGE UPLOAD HELPER
// ==========================================
async function uploadHeroImage(file: File): Promise<{ url: string; blurDataURL: string }> {
  const supabase = await createAdminClient()
  
  if (!file || file.size === 0) {
    throw new Error('Invalid file')
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit')
  }
  
  // Process through Sharp: resize for hero (up to 2560px), convert to WebP, generate blur
  const processed = await processImage(file, 'hero');
  const fileName = generateImageFilename('hero');
  
  const { error: uploadError } = await supabase.storage
    .from('collections')
    .upload(fileName, processed.buffer, {
      contentType: processed.contentType,
      cacheControl: '31536000',
    })
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('collections')
    .getPublicUrl(fileName)
  
  return { url: publicUrl, blurDataURL: processed.blurDataURL }
}

// ==========================================
// UPDATE SITE CONFIG
// ==========================================
export async function updateSiteConfig(formData: FormData) {
  const supabase = await createAdminClient()
  const cookieStore = await cookies()

  const heroHeading = formData.get('heroHeading') as string
  const heroSub = formData.get('heroSub') as string
  const heroCtaText = formData.get('heroCtaText') as string
  const heroCtaLink = formData.get('heroCtaLink') as string
  const existingHeroImage = formData.get('existingHeroImage') as string
  const heroImageFile = formData.get('heroImageFile') as File
  
  const themeColor = formData.get('themeColor') as string

  const brandName = formData.get('brandName') as string
  const announcement = formData.get('announcement') as string
  
  // Handle hero image upload
  let heroImage = existingHeroImage || ''
  let heroBlurDataURL = ''
  if (heroImageFile && heroImageFile.size > 0) {
    try {
      const result = await uploadHeroImage(heroImageFile)
      heroImage = result.url
      heroBlurDataURL = result.blurDataURL
    } catch (error) {
      console.error('Hero image upload error:', error)
      // Continue with existing image if upload fails
    }
  }
  
  // Build hero config
  const heroConfig: Record<string, any> = { 
    heading: heroHeading, 
    subheading: heroSub, 
    image: heroImage,
    ctaText: heroCtaText || 'Shop Now',
    ctaLink: heroCtaLink || '/collection'
  }
  if (heroBlurDataURL) {
    heroConfig.blurDataURL = heroBlurDataURL
  }

  // Upsert Configs
  await supabase.from('site_config').upsert({
      key: 'hero',
      value: heroConfig
  }, { onConflict: 'key' })
  
  // Only update theme if color is provided
  if (themeColor) {
    await supabase.from('site_config').upsert({
        key: 'theme',
        value: { primaryColor: themeColor }
    }, { onConflict: 'key' })
    
    cookieStore.set('brand-color', themeColor, { path: '/' })
  }

  await supabase.from('site_config').upsert({
      key: 'brand',
      value: { name: brandName, announcement: announcement }
  }, { onConflict: 'key' })

  revalidatePath('/', 'layout')
  revalidatePath('/admin/settings')
  
  return { success: true }
}

// ==========================================
// DELETE HERO IMAGE
// ==========================================
export async function deleteHeroImage() {
  const supabase = await createAdminClient()
  
  const { data: current } = await supabase.from('site_config').select('value').eq('key', 'hero').single()
  
  await supabase.from('site_config').upsert({
      key: 'hero',
      value: { ...current?.value, image: '' }
  }, { onConflict: 'key' })
  
  revalidatePath('/', 'layout')
  revalidatePath('/admin/settings')
  
  return { success: true }
}

