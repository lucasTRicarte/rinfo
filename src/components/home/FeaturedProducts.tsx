'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, ArrowRight, Star, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { listarProdutosPorBadge, listarProdutosDestaque } from '@/lib/loja/produtos'
import type { ProdutoCard } from '@/lib/loja/produtos'

type Tab = 'best' | 'promo' | 'new'

const tabs: { key: Tab; label: string; badge: string }[] = [
  { key: 'best', label: 'Mais Vendidos', badge: 'MAIS VENDIDO' },
  { key: 'promo', label: 'Promoções', badge: 'PROMOÇÃO' },
  { key: 'new', label: 'Novidades', badge: 'NOVO' },
]

const badgeStyle: Record<string, string> = {
  'MAIS VENDIDO': 'bg-[#D4A63A] text-[#002C63]',
  'PROMOÇÃO': 'bg-red-500 text-white',
  'NOVO': 'bg-[#003E8A] text-white',
}

function ProdutoImagem({ url, nome }: { url: string | null; nome: string }) {
  if (url) {
    return <img src={url} alt={nome} className="w-full h-full object-cover" />
  }
  return <Package size={36} className="text-gray-300" />
}

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<Tab>('best')
  const [produtos, setProdutos] = useState<ProdutoCard[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    const badge = tabs.find((t) => t.key === activeTab)!.badge
    listarProdutosPorBadge(badge).then((data) => {
      if (data.length > 0) {
        setProdutos(data.slice(0, 6))
      } else {
        listarProdutosDestaque().then((d) => setProdutos(d.slice(0, 6)))
      }
    })
  }, [activeTab])

  const toggleFav = (id: string) =>
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])

  return (
    <section className="px-4 md:px-8 py-8">
      <div className="flex items-end justify-between mb-2">
        <h2 className="text-xl font-black text-[#222]">Destaques para você</h2>
        <Link href="/produtos" className="hidden md:flex items-center gap-1 text-sm text-[#003E8A] font-semibold hover:gap-2 transition-all">
          Ver todos os produtos <ArrowRight size={14} />
        </Link>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
            className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === tab.key ? 'text-[#D4A63A] border-[#D4A63A]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {produtos.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
              <div className="h-3 bg-gray-100 rounded mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-5 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                <button type="button" onClick={() => toggleFav(produto.id)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart size={13} className={favorites.includes(produto.id) ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
                </button>
              </div>

              <div className="flex-1 flex flex-col">
                <p className="text-[10px] text-gray-400 mb-0.5">{produto.categoria_nome}</p>
                <Link href={`/produtos/${produto.slug}`}>
                  <h3 className="text-xs font-semibold text-[#222] leading-snug mb-2 line-clamp-2 hover:text-[#003E8A] transition-colors">
                    {produto.nome}
                  </h3>
                </Link>
                <div className="flex items-center gap-0.5 mb-2">
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

              <button type="button"
                onClick={() => addItem({ id: produto.id, nome: produto.nome, preco: produto.preco, imagem_url: produto.imagem_url, slug: produto.slug })}
                className="w-full bg-[#003E8A] hover:bg-[#002C63] text-white text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                <ShoppingCart size={11} /> Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 text-center md:hidden">
        <Link href="/produtos" className="text-sm text-[#003E8A] font-semibold">
          Ver todos os produtos →
        </Link>
      </div>
    </section>
  )
}
