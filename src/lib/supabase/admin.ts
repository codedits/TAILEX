import { createClient } from '@supabase/supabase-js'

export async function createAdminClient() {
  // Uses the Service Role Key to bypass RLS for admin actions
  // This allows the admin panel to work without a traditional login session
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
