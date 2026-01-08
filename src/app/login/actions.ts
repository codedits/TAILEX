'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { EmailService } from '@/services/email'
import { AppError } from '@/services/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ... existing imports ...

// Helper to generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }

  try {
    const code = generateCode();
    const supabase = await createAdminClient();

    // Store code
    await supabase.from('otp_codes').insert({
      email,
      code
    });

    // Send Email
    await EmailService.sendOTP(email, code);

    return { success: true, message: 'OTP sent to your email' }
  } catch (error) {
    console.error('Send OTP Error:', error);
    return { error: 'Failed to send OTP' }
  }
}

export async function verifyOTP(formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('code') as string

  if (!email || !code) return { error: 'Email and Code required' }

  const supabase = await createAdminClient();

  // Verify Code
  const { data: records } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (!records || records.length === 0) {
    return { error: 'Invalid or expired code' }
  }

  // Valid Code! Consume it (optional)
  await supabase.from('otp_codes').delete().eq('email', email);

  // Create Session via Magic Link trick
  // We generate a magic link, then redirect the user to it. 
  // This allows Supabase to handle the actual session cookie setting securely.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
  });

  if (linkError || !linkData.properties?.action_link) {
    console.error('Generate Link Error:', linkError);
    return { error: 'Failed to create session' };
  }

  redirect(linkData.properties.action_link);
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check email to continue sign in process')
}
