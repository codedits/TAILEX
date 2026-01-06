'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMenu() {
    const supabase = await createAdminClient()
    
    // Check if main-menu exists first to avoid duplicates or handles? 
    // For now simplistic create.
    
    const { data, error } = await supabase.from('navigation_menus').insert({
        title: 'New Menu',
        handle: `menu-${Date.now()}`,
        items: []
    }).select().single()

    if (error) throw new Error(error.message)
    
    redirect(`/admin/navigation/${data.id}`)
}

export async function deleteMenu(id: string) {
    const supabase = await createAdminClient()
    await supabase.from('navigation_menus').delete().eq('id', id)
    revalidatePath('/admin/navigation')
}
