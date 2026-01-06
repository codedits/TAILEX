'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPage() {
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase.from('pages').insert({
        title: 'Untitled Page',
        slug: `page-${Date.now()}`,
        sections: [],
        is_published: false
    }).select().single()

    if (error) throw new Error(error.message)
    
    redirect(`/admin/pages/${data.id}`)
}

export async function deletePage(id: string) {
    const supabase = await createAdminClient()
    await supabase.from('pages').delete().eq('id', id)
    revalidatePath('/admin/pages')
}
