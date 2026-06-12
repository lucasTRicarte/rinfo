'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { listarProdutos } from '@/lib/loja/produtos'
import { listarCategoriasComSubs } from '@/lib/loja/categorias'
import type { ProdutoCard } from '@/lib/loja/produtos'
import type { CategoriaComSubs } from '@/lib/loja/categorias'
import { useCart } from '@/context/CartContext'
import {
  Heart, ShoppingCart, Star, SlidersHorizontal, X, Package, Loader2,
  Search, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react'
import Link from 'next/link'

const POR_PAGINA = 20

const sortOptions = [
  { value: 'relevancia',  label: 'Mais Relevantes' },
  { value: 'menor-preco', label: 'Menor Preço' },
  { value: 'maior-preco', label: 'Maior Preço' },
  { value: 'avaliacao',   label: 'Melhor Avaliados' },
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

export default function ProdutosPageClient() {
  const searchParams                              = useSearchParams()
  const [selectedCategory, setSelectedCategory]  = useState<string | null>(searchParams.get('categoria'))
  const [sort, setSort]                          = useState<string>('relevancia')
  const [precoMax, setPrecoMax]                  = useState(10000)
  const [precoMaxAplicado, setPrecoMaxAplicado]  = useState(10000)
  const [busca, setBusca]                        = useState('')
  const [buscaDebounced, setBuscaDebounced]      = useState('')
  const [pagina, setPagina]                      = useState(1)
  const [favorites, setFavorites]                = useState<string[]>([])
  const [showFilters, setShowFilters]            = useState(false)
  const [produtos, setProdutos]                  = useState<ProdutoCard[]>([])
  const [total, setTotal]                        = useState(0)
  const [categorias, setCategorias]              = useState<CategoriaComSubs[]>([])
  const [loading, setLoading]                    = useState(true)
  const { addItem }                              = useCart()
  const debounceRef                              = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPages = Math.ceil(total / POR_PAGINA)

  useEffect(() => { listarCategoriasComSubs().then(setCategorias) }, [])

  useEffect(() => {
    const cat = searchParams.get('categoria')
    if (cat !== selectedCategory) { setSelectedCategory(cat); setPagina(1) }
  }, [searchParams])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setBuscaDebounced(busca)
      setPagina(1)
    }, 450)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [busca])

  const fetchProdutos = useCallback(() => {
    setLoading(true)
    listarProdutos({
      categoria_slug: selectedCategory ?? undefined,
      busca: buscaDebounced || undefined,
      preco_max: precoMaxAplicado < 10000 ? precoMaxAplicado : undefined,
      sort: sort as 'relevancia' | 'menor-preco' | 'maior-preco' | 'avaliacao',
      pagina,
      por_pagina: POR_PAGINA,
    }).then(({ produtos: data, total: t }) => {
      setProdutos(data)
      setTotal(t)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedCategory, buscaDebounced, precoMaxAplicado, sort, pagina])

  useEffect(() => { fetchProdutos() }, [fetchProdutos])

  const handleSetCategory = (cat: string | null) => {
    setSelectedCategory(cat)
    setPagina(1)
  }

  const handleSetSort = (s: string) => {
    setSort(s)
    setPagina(1)
  }

  const toggleFav = (id: string) =>
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])

  const categoriaNome = (() => {
    for (const cat of categorias) {
      if (cat.slug === selectedCategory) return cat.nome
      const sub = cat.subcategorias.find((s) => s.slug === selectedCategory)
      if (sub) return sub.nome
    }
    return undefined
  })()

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
        {/* Header com busca */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex-1">
            <h1 className="text-xl font-black text-[#222]">
              {buscaDebounced ? `Busca: "${buscaDebounced}"` : (categoriaNome ?? 'Todos os Produtos')}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? '...' : `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full sm:w-52 pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-white"
              />
              {busca && (
                <button onClick={() => setBusca('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:border-[#003E8A] hover:text-[#003E8A] transition-colors md:hidden">
              <SlidersHorizontal size={14} /> Filtros
            </button>
            <select
              value={sort}
              onChange={(e) => handleSetSort(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#003E8A] bg-white">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filtros */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-56 flex-shrink-0`}>
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24 space-y-6">
              <div>
                <h3 className="font-bold text-sm text-[#222] mb-3">Categorias</h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => handleSetCategory(null)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-[#003E8A] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    Todas as categorias
                  </button>
                  {categorias.map((cat) => {
                    const isParentActive = selectedCategory === cat.slug
                    const hasActiveChild = cat.subcategorias.some((s) => s.slug === selectedCategory)
                    const expanded = isParentActive || hasActiveChild
                    return (
                      <div key={cat.slug}>
                        <button
                          onClick={() => handleSetCategory(cat.slug)}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                            isParentActive
                              ? 'bg-[#003E8A] text-white font-semibold'
                              : hasActiveChild
                              ? 'bg-[#003E8A]/10 text-[#003E8A] font-semibold'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}>
                          <span>{cat.nome}</span>
                          {cat.subcategorias.length > 0 && (
                            <ChevronDown size={12} className={`flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                        {expanded && cat.subcategorias.length > 0 && (
                          <div className="ml-2 mt-0.5 space-y-0.5">
                            {cat.subcategorias.map((sub) => (
                              <button
                                key={sub.slug}
                                onClick={() => handleSetCategory(sub.slug)}
                                className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors border-l-2 ${
                                  selectedCategory === sub.slug
                                    ? 'border-[#003E8A] bg-[#003E8A]/5 text-[#003E8A] font-semibold'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}>
                                {sub.nome}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#222] mb-1">Preço máximo</h3>
                <input
                  type="range" min={100} max={10000} step={100}
                  value={precoMax}
                  onChange={(e) => setPrecoMax(Number(e.target.value))}
                  onMouseUp={() => { setPrecoMaxAplicado(precoMax); setPagina(1) }}
                  onTouchEnd={() => { setPrecoMaxAplicado(precoMax); setPagina(1) }}
                  className="w-full accent-[#003E8A] mt-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>R$ 100</span>
                  <span className="font-semibold text-[#003E8A]">
                    {precoMax >= 10000 ? 'Sem limite' : `R$ ${precoMax.toLocaleString('pt-BR')}`}
                  </span>
                </div>
              </div>

              {(selectedCategory || buscaDebounced || precoMaxAplicado < 10000) && (
                <button
                  onClick={() => { handleSetCategory(null); setBusca(''); setPrecoMax(10000); setPrecoMaxAplicado(10000) }}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700">
                  <X size={12} /> Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Grid de produtos */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-gray-300" />
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum produto encontrado</p>
                {(buscaDebounced || selectedCategory) && (
                  <button onClick={() => { setBusca(''); handleSetCategory(null) }}
                    className="mt-3 text-sm text-[#003E8A] hover:underline">
                    Limpar busca e filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {produtos.map((produto) => (
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

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={pagina === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#003E8A] hover:text-[#003E8A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - pagina) <= 1)
                      .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, idx) =>
                        p === 'ellipsis' ? (
                          <span key={`e${idx}`} className="text-gray-400 text-sm px-1">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPagina(p as number)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors ${
                              pagina === p
                                ? 'bg-[#003E8A] text-white border-[#003E8A]'
                                : 'border-gray-200 text-gray-600 hover:border-[#003E8A] hover:text-[#003E8A]'
                            }`}>
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setPagina((p) => Math.min(totalPages, p + 1))}
                      disabled={pagina === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#003E8A] hover:text-[#003E8A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {totalPages > 1 && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Página {pagina} de {totalPages} · {total} produtos
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
