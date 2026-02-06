// src/lib/fonts.ts
import { Manrope, Inter, Playfair_Display, Space_Mono } from 'next/font/google'

export const manrope = Manrope({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const fonts = {
  manrope,
  inter,
  playfair,
  'space mono': spaceMono,
  spacemono: spaceMono,
  mono: spaceMono,
  script: manrope,
  helvetica: { variable: '--font-helvetica', className: 'font-helvetica' }
}

export function getFont(fontName: string) {
  const font = fonts[fontName as keyof typeof fonts] || fonts.manrope
  return font as any
}
