'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setTheme(theme: 'light' | 'dark') {
  const cookieStore = await cookies()
  cookieStore.set('theme', theme, { path: '/' })
  revalidatePath('/')
}

export async function setBrandColor(color: string) {
  const cookieStore = await cookies()
  cookieStore.set('brand-color', color, { path: '/' })
  revalidatePath('/')
}

export async function setFont(font: string) {
    const cookieStore = await cookies()
    cookieStore.set('font', font, { path: '/' })
    revalidatePath('/')
  }
