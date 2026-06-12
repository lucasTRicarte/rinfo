import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const LOGO_URL  = process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ?? `${SITE_URL}/logo-ricarte.png`
const DESCRICAO = 'Computadores, notebooks, periféricos e assistência técnica especializada. Compre online com entrega para todo o Brasil e parcele em até 12x sem juros.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Ricarte Informática — Tecnologia que acompanha seu ritmo',
    template: '%s | Ricarte Informática',
  },
  description: DESCRICAO,
  keywords: ['informática', 'computadores', 'notebooks', 'periféricos', 'assistência técnica', 'Ricarte Informática', 'tecnologia'],
  authors: [{ name: 'Ricarte Informática' }],
  creator: 'Ricarte Informática',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Ricarte Informática',
    title: 'Ricarte Informática — Tecnologia que acompanha seu ritmo',
    description: DESCRICAO,
    images: [{ url: LOGO_URL, width: 1080, height: 1080, alt: 'Ricarte Informática' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ricarte Informática',
    description: DESCRICAO,
    images: [LOGO_URL],
  },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ricarte Informática',
  url: SITE_URL,
  logo: LOGO_URL,
  taxID: '08.695.271/0001-10',
  description: DESCRICAO,
  sameAs: [],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F5F7FA] text-[#222222]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
