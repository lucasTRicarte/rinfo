import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buscarProdutoPorSlug } from '@/lib/loja/produtos'
import ProdutoPageClient from './ProdutoPageClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const produto = await buscarProdutoPorSlug(slug)
  if (!produto) return { title: 'Produto não encontrado' }

  const descricao =
    produto.descricao_curta ??
    (produto.descricao ? produto.descricao.slice(0, 155) + '…' : null) ??
    `Compre ${produto.nome} com o melhor preço na Ricarte Informática. Entrega para todo o Brasil.`

  const images = produto.imagem_url
    ? [{ url: produto.imagem_url, alt: produto.nome }]
    : []

  return {
    title: produto.nome,
    description: descricao,
    openGraph: {
      title: produto.nome,
      description: descricao,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: produto.nome,
      description: descricao,
      images: images.map((i) => i.url),
    },
  }
}

export default async function ProdutoPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const produto = await buscarProdutoPorSlug(slug)
  if (!produto) notFound()

  const emEstoque = produto.estoque_fisico > 0 || produto.dropshipping

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.nome,
    ...(produto.descricao_curta ? { description: produto.descricao_curta } : {}),
    ...(produto.imagem_url ? { image: produto.imagem_url } : {}),
    sku: produto.id,
    brand: { '@type': 'Brand', name: 'Ricarte Informática' },
    offers: {
      '@type': 'Offer',
      price: produto.preco,
      priceCurrency: 'BRL',
      availability: emEstoque
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/produtos/${slug}`,
      seller: { '@type': 'Organization', name: 'Ricarte Informática' },
    },
    ...(produto.total_avaliacoes > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: produto.avaliacao_media,
            reviewCount: produto.total_avaliacoes,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Produtos', item: `${SITE_URL}/produtos` },
      ...(produto.categoria_nome && produto.categoria_slug
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: produto.categoria_nome,
              item: `${SITE_URL}/produtos?categoria=${produto.categoria_slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: produto.categoria_nome ? 4 : 3,
        name: produto.nome,
        item: `${SITE_URL}/produtos/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProdutoPageClient slug={slug} />
    </>
  )
}
