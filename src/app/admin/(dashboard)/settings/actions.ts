'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// ==========================================
// IMAGE UPLOAD HELPER
// ==========================================
async function uploadHeroImage(file: File): Promise<string> {
  const supabase = await createAdminClient()
  
  if (!file || file.size === 0) {
    throw new Error('Invalid file')
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit')
  }
  
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `hero/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('collections')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '31536000',
    })
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('collections')
    .getPublicUrl(fileName)
  
  return publicUrl
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
  if (heroImageFile && heroImageFile.size > 0) {
    try {
      heroImage = await uploadHeroImage(heroImageFile)
    } catch (error) {
      console.error('Hero image upload error:', error)
      // Continue with existing image if upload fails
    }
  }
  
  // Upsert Configs
  await supabase.from('site_config').upsert({
      key: 'hero',
      value: { 
        heading: heroHeading, 
        subheading: heroSub, 
        image: heroImage,
        ctaText: heroCtaText || 'Shop Now',
        ctaLink: heroCtaLink || '/collection'
      }
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

