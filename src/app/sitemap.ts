import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/db/supabase/service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const supabase = createServiceClient()

  const [{ data: produtos }, { data: categorias }] = await Promise.all([
    supabase.from('produtos').select('slug, atualizado_em').eq('ativo', true),
    supabase.from('categorias').select('slug, atualizado_em').eq('ativo', true),
  ])

  const rotas: MetadataRoute.Sitemap = [
    { url: siteUrl,                changeFrequency: 'daily',  priority: 1.0, lastModified: new Date() },
    { url: `${siteUrl}/produtos`,  changeFrequency: 'daily',  priority: 0.9, lastModified: new Date() },
  ]

  for (const p of produtos ?? []) {
    rotas.push({
      url: `${siteUrl}/produtos/${p.slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
      lastModified: new Date(p.atualizado_em as string),
    })
  }

  for (const c of categorias ?? []) {
    rotas.push({
      url: `${siteUrl}/produtos?categoria=${c.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: new Date(c.atualizado_em as string),
    })
  }

  return rotas
}
