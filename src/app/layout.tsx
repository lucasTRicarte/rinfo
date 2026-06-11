import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ricarte Informática — Tecnologia que acompanha seu ritmo',
  description: 'Computadores, notebooks, periféricos e assistência especializada com a confiança da Ricarte Informática.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F5F7FA] text-[#222222]">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
