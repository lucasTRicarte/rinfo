import type { Metadata } from 'next'
import { Suspense } from 'react'
import { listarCategoriasPublicas } from '@/lib/loja/categorias'
import ProdutosPageClient from './ProdutosPageClient'
import { Loader2 } from 'lucide-react'

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ categoria?: string }> }
): Promise<Metadata> {
  const { categoria } = await searchParams

  if (categoria) {
    const categorias = await listarCategoriasPublicas()
    const cat = categorias.find((c) => c.slug === categoria)
    if (cat) {
      const desc = `Compre ${cat.nome} com o melhor preço na Ricarte Informática. Entrega para todo o Brasil em até 12x sem juros.`
      return {
        title: cat.nome,
        description: desc,
        openGraph: { title: `${cat.nome} | Ricarte Informática`, description: desc },
      }
    }
  }

  return {
    title: 'Produtos',
    description:
      'Catálogo completo de computadores, notebooks, periféricos e acessórios. Encontre o produto certo com o melhor preço na Ricarte Informática.',
  }
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><Loader2 size={32} className="animate-spin text-gray-300" /></div>}>
      <ProdutosPageClient />
    </Suspense>
  )
}
