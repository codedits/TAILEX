'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function updateSiteConfig(formData: FormData) {
  const supabase = await createAdminClient()
  const cookieStore = await cookies()

  const heroHeading = formData.get('heroHeading')
  const heroSub = formData.get('heroSub')
  const heroImage = formData.get('heroImage')
  
  const themeColor = formData.get('themeColor') as string

  const brandName = formData.get('brandName')
  const announcement = formData.get('announcement')
  
  // Upsert Configs
  await supabase.from('site_config').upsert({
      key: 'hero',
      value: { heading: heroHeading, subheading: heroSub, image: heroImage }
  }, { onConflict: 'key' })
  
  await supabase.from('site_config').upsert({
      key: 'theme',
      value: { primaryColor: themeColor }
  }, { onConflict: 'key' })

  // Mirror to cookies for fast access (Zero Flash)
  if (themeColor) {
      cookieStore.set('brand-color', themeColor, { path: '/' })
  }

  await supabase.from('site_config').upsert({
      key: 'brand',
      value: { name: brandName, announcement: announcement }
  }, { onConflict: 'key' })

  revalidatePath('/', 'layout')
}
