'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const phone = formData.get('phone') as string

  // Address fields
  const address1 = formData.get('address1') as string
  const address2 = formData.get('address2') as string
  const city = formData.get('city') as string
  const province = formData.get('province') as string
  const zip = formData.get('zip') as string
  const country = formData.get('country') as string || 'US'

  const { error } = await supabase
    .from('customers')
    .update({
      first_name,
      last_name,
      phone,
      address1,
      address2,
      city,
      province,
      zip,
      country
    })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/account')
  return { success: true }
}
