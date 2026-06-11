'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { listarProdutos } from '@/lib/loja/produtos'
import { listarCategoriasPublicas } from '@/lib/loja/categorias'
import type { ProdutoCard } from '@/lib/loja/produtos'
import type { CategoriaPublica } from '@/lib/loja/categorias'
import { useCart } from '@/context/CartContext'
import { Heart, ShoppingCart, Star, SlidersHorizontal, X, Package, Loader2 } from 'lucide-react'
import Link from 'next/link'

const sortOptions = [
  { value: 'relevancia', label: 'Mais Relevantes' },
  { value: 'menor-preco', label: 'Menor Preço' },
  { value: 'maior-preco', label: 'Maior Preço' },
]

const badgeStyle: Record<string, string> = {
  'MAIS VENDIDO': 'bg-[#D4A63A] text-[#002C63]',
  'PROMOÇÃO': 'bg-red-500 text-white',
  'NOVO': 'bg-[#003E8A] text-white',
}

function ProdutoImagem({ url, nome }: { url: string | null; nome: string }) {
  if (url) return <img src={url} alt={nome} className="w-full h-full object-cover" />
  return <Package size={40} className="text-gray-300" />
}

export default function ProdutosPage() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('categoria'))
  const [sort, setSort] = useState('relevancia')
  const [maxPrice, setMaxPrice] = useState(10000)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [produtos, setProdutos] = useState<ProdutoCard[]>([])
  const [categorias, setCategorias] = useState<CategoriaPublica[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    listarCategoriasPublicas().then(setCategorias)
  }, [])

  useEffect(() => {
    const cat = searchParams.get('categoria')
    if (cat) setSelectedCategory(cat)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    listarProdutos({ categoria_slug: selectedCategory ?? undefined }).then((data) => {
      setProdutos(data)
      setLoading(false)
    })
  }, [selectedCategory])

  const filtered = produtos
    .filter((p) => p.preco <= maxPrice)
    .sort((a, b) => {
      if (sort === 'menor-preco') return a.preco - b.preco
      if (sort === 'maior-preco') return b.preco - a.preco
      return 0
    })

  const toggleFav = (id: string) =>
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])

  const categoriaNome = categorias.find((c) => c.slug === selectedCategory)?.nome

  return (
    <ShopLayout>
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-3">
        <p className="text-xs text-gray-400">
          <Link href="/" className="hover:text-[#003E8A]">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#003E8A] font-medium">Produtos</span>
          {selectedCategory && (
            <><span className="mx-1.5">/</span><span className="text-[#003E8A] font-medium">{categoriaNome ?? selectedCategory}</span></>
          )}
        </p>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-[#222]">
              {categoriaNome ?? 'Todos os Produtos'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{loading ? '...' : `${filtered.length} produtos encontrados`}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:border-[#003E8A] hover:text-[#003E8A] transition-colors md:hidden">
              <SlidersHorizontal size={14} /> Filtros
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#003E8A] bg-white">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-56 flex-shrink-0`}>
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24 space-y-6">
              <div>
                <h3 className="font-bold text-sm text-[#222] mb-3">Categorias</h3>
                <div className="space-y-1.5">
                  <button onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-[#003E8A] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    Todas as categorias
                  </button>
                  {categorias.map((cat) => (
                    <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.slug ? 'bg-[#003E8A] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {cat.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#222] mb-3">Preço máximo</h3>
                <input type="range" min={100} max={10000} step={100}
                  value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#003E8A]" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>R$ 100</span>
                  <span className="font-semibold text-[#003E8A]">R$ {maxPrice.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700">
                  <X size={12} /> Limpar filtros
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-gray-300" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map((produto) => (
                  <div key={produto.id} className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md hover:border-[#003E8A]/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                    <div className="relative mb-3">
                      <Link href={`/produtos/${produto.slug}`}>
                        <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                          <ProdutoImagem url={produto.imagem_url} nome={produto.nome} />
                        </div>
                      </Link>
                      {produto.badge && (
                        <span className={`absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded ${badgeStyle[produto.badge]}`}>
                          {produto.badge}
                        </span>
                      )}
                      <button onClick={() => toggleFav(produto.id)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
                        <Heart size={13} className={favorites.includes(produto.id) ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 mb-0.5">{produto.categoria_nome}</p>
                      <Link href={`/produtos/${produto.slug}`}>
                        <h3 className="text-xs font-semibold text-[#222] leading-snug mb-1.5 line-clamp-2 hover:text-[#003E8A] transition-colors">{produto.nome}</h3>
                      </Link>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={9} className={i < Math.round(produto.avaliacao_media) ? 'fill-[#D4A63A] text-[#D4A63A]' : 'fill-gray-200 text-gray-200'} />
                        ))}
                        <span className="text-[9px] text-gray-400 ml-0.5">({produto.total_avaliacoes})</span>
                      </div>
                      {produto.preco_original && (
                        <p className="text-[10px] text-gray-400 line-through">R$ {produto.preco_original.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      )}
                      <p className="text-base font-black text-[#003E8A]">R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-[9px] text-gray-400 mb-3">em até 12x sem juros</p>
                    </div>

                    <button
                      onClick={() => addItem({ id: produto.id, nome: produto.nome, preco: produto.preco, imagem_url: produto.imagem_url, slug: produto.slug })}
                      disabled={produto.estoque_fisico === 0 && !produto.dropshipping}
                      className="w-full bg-[#003E8A] hover:bg-[#002C63] disabled:bg-gray-200 disabled:text-gray-400 text-white text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      <ShoppingCart size={11} />
                      {produto.estoque_fisico === 0 && !produto.dropshipping ? 'Indisponível' : 'Adicionar ao Carrinho'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
