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

  // update auth metadata as well optionally
  // await supabase.auth.updateUser({ data: { first_name, last_name } })

  const { error } = await supabase
    .from('customers')
    .update({ first_name, last_name, phone })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/account')
  return { success: true }
}

export async function addAddress(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const address = {
        customer_id: user.id,
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        address1: formData.get('address1') as string,
        address2: formData.get('address2') as string,
        city: formData.get('city') as string,
        province: formData.get('province') as string,
        zip: formData.get('zip') as string,
        country: formData.get('country') as string || 'US',
        phone: formData.get('phone') as string,
        is_default: formData.get('is_default') === 'on'
    }

    if (address.is_default) {
        // Unset other defaults
        await supabase.from('customer_addresses')
            .update({ is_default: false })
            .eq('customer_id', user.id)
    }

    const { error } = await supabase.from('customer_addresses').insert(address)
    if (error) return { error: error.message }
    revalidatePath('/account')
    return { success: true }
}

export async function deleteAddress(formData: FormData) {
     const id = formData.get('id') as string
     const supabase = await createClient()
     const { error } = await supabase.from('customer_addresses').delete().eq('id', id)
     if (error) return { error: error.message }
     revalidatePath('/account')
     return { success: true }
}
