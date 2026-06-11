'use client'

import { use, useState, useEffect, useRef } from 'react'
import { notFound } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { buscarProdutoPorSlug, listarProdutos } from '@/lib/loja/produtos'
import type { ProdutoCard, ProdutoDetalhe } from '@/lib/loja/produtos'
import { useCart } from '@/context/CartContext'
import {
  Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Plus, Minus,
  Package, Loader2, Heart, ChevronDown, Tag, TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

const badgeStyle: Record<string, string> = {
  'MAIS VENDIDO': 'bg-[#D4A63A] text-[#002C63]',
  'PROMOÇÃO':    'bg-red-500 text-white',
  'NOVO':        'bg-[#003E8A] text-white',
}

export default function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [produto, setProduto]             = useState<ProdutoDetalhe | null | undefined>(undefined)
  const [maisProcurados, setMaisProcurados] = useState<ProdutoCard[]>([])
  const [imagemAtiva, setImagemAtiva]     = useState(0)
  const [quantidade, setQuantidade]       = useState(1)
  const [isFav, setIsFav]                 = useState(false)
  const descricaoRef                      = useRef<HTMLDivElement>(null)
  const { addItem }                       = useCart()

  useEffect(() => {
    buscarProdutoPorSlug(slug).then((data) => {
      setProduto(data)
      // Busca outros produtos da mesma categoria; fallback: todos os produtos
      const fetchRelated = data?.categoria_slug
        ? listarProdutos({ categoria_slug: data.categoria_slug })
        : listarProdutos()
      fetchRelated.then((rel) =>
        setMaisProcurados(rel.filter((p) => p.slug !== slug).slice(0, 8))
      )
    })
  }, [slug])

  if (produto === undefined) {
    return (
      <ShopLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={36} className="animate-spin text-gray-300" />
        </div>
      </ShopLayout>
    )
  }

  if (produto === null) notFound()

  const discount    = produto.preco_original
    ? Math.round((1 - produto.preco / produto.preco_original) * 100)
    : null
  const imagemAtual = produto.imagens[imagemAtiva]?.url ?? produto.imagem_url
  const emEstoque   = produto.estoque_fisico > 0 || produto.dropshipping

  const handleAddToCart = () => {
    for (let i = 0; i < quantidade; i++) {
      addItem({ id: produto.id, nome: produto.nome, preco: produto.preco, imagem_url: produto.imagem_url, slug: produto.slug })
    }
  }

  return (
    <ShopLayout>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-3">
        <p className="text-xs text-gray-400">
          <Link href="/" className="hover:text-[#003E8A]">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/produtos" className="hover:text-[#003E8A]">Produtos</Link>
          {produto.categoria_nome && (<>
            <span className="mx-1.5">/</span>
            <Link href={`/produtos?categoria=${produto.categoria_slug}`} className="hover:text-[#003E8A]">{produto.categoria_nome}</Link>
          </>)}
          <span className="mx-1.5">/</span>
          <span className="text-[#003E8A] font-medium truncate">{produto.nome}</span>
        </p>
      </div>

      <div className="px-4 md:px-8 py-6">

        {/*
          ── ESTRUTURA PRINCIPAL ────────────────────────────────────────────
          Flex horizontal:
            • Esquerda (flex-1): galeria + desc resumida | descrição completa
            • Direita (w-80, sticky): sidebar título/preço/carrinho
          O sidebar fica fixo durante AMBAS as seções e para apenas quando
          chegar na seção "Mais procurados" (que fica fora deste flex).
          ──────────────────────────────────────────────────────────────────
        */}
        <div className="flex gap-6 items-start mb-10">

          {/* ── COLUNA ESQUERDA (conteúdo principal) ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Seção 1 — Galeria | Descrição resumida (sticky dentro desta grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-6 items-start">

              {/* Galeria */}
              <div>
                <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden mb-3 border border-gray-100">
                  {imagemAtual
                    ? <img src={imagemAtual} alt={produto.nome} className="w-full h-full object-contain p-4" />
                    : <Package size={80} className="text-gray-200" />
                  }
                </div>
                {produto.imagens.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {produto.imagens.map((img, i) => (
                      <button key={i} onClick={() => setImagemAtiva(i)}
                        className={`w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border-2 transition-colors ${imagemAtiva === i ? 'border-[#003E8A]' : 'border-gray-100 hover:border-gray-300'}`}>
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Descrição resumida — sticky apenas dentro desta grid */}
              <div className="hidden lg:block sticky top-24 self-start">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-sm text-[#222] mb-3 flex items-center gap-2">
                    <Tag size={13} className="text-[#D4A63A]" /> Sobre o produto
                  </h3>

                  {produto.descricao_curta && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3 font-medium">
                      {produto.descricao_curta}
                    </p>
                  )}

                  {produto.descricao && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-6 mb-3">
                      {produto.descricao}
                    </p>
                  )}

                  {!produto.descricao && !produto.descricao_curta && (
                    <p className="text-sm text-gray-400 italic mb-3">Sem descrição disponível.</p>
                  )}

                  {produto.specs.length > 0 && (
                    <div className="border-t border-gray-200 pt-3 mb-3 space-y-1.5">
                      {produto.specs.slice(0, 5).map((spec, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span className="text-gray-400 w-28 flex-shrink-0">{spec.chave}</span>
                          <span className="font-semibold text-[#222] line-clamp-1">{spec.valor}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => descricaoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="flex items-center gap-1.5 text-sm text-[#003E8A] font-semibold hover:underline mt-1">
                    Ver descrição completa <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Descrição resumida mobile */}
            {(produto.descricao_curta || produto.descricao) && (
              <div className="lg:hidden bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h3 className="font-bold text-sm text-[#222] mb-2 flex items-center gap-2">
                  <Tag size={12} className="text-[#D4A63A]" /> Sobre o produto
                </h3>
                {produto.descricao_curta && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{produto.descricao_curta}</p>
                )}
                {produto.descricao && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">{produto.descricao}</p>
                )}
                <button
                  onClick={() => descricaoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="flex items-center gap-1 text-sm text-[#003E8A] font-semibold hover:underline mt-2">
                  Ver mais <ChevronDown size={13} />
                </button>
              </div>
            )}

            {/* Seção 2 — Descrição completa + Specs (ocupa toda a coluna esquerda ~74%) */}
            <div ref={descricaoRef} className="scroll-mt-24 space-y-4">
              {produto.descricao && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-black text-[#222] mb-3">Descrição completa</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{produto.descricao}</p>
                </div>
              )}
              {produto.specs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-black text-[#222] mb-3">Especificações técnicas</h2>
                  <div className="space-y-0">
                    {produto.specs.map((spec, i) => (
                      <div key={i} className={`flex gap-4 text-sm py-2.5 ${i < produto.specs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                        <span className="text-gray-500 w-44 flex-shrink-0">{spec.chave}</span>
                        <span className="font-semibold text-[#222]">{spec.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR DIREITA (sticky — fica fixo em ambas as seções acima) ── */}
          <div className="hidden lg:block w-[466px] flex-shrink-0 sticky top-24 self-start">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              {produto.badge && (
                <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded mb-2 ${badgeStyle[produto.badge]}`}>
                  {produto.badge}
                </span>
              )}

              <h1 className="text-base font-black text-[#222] mb-2 leading-snug">{produto.nome}</h1>

              <div className="flex items-center gap-1.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} className={i < Math.round(produto.avaliacao_media) ? 'fill-[#D4A63A] text-[#D4A63A]' : 'fill-gray-200 text-gray-200'} />
                ))}
                <span className="text-xs text-gray-400 ml-0.5">({produto.total_avaliacoes})</span>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-100">
                {produto.preco_original && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs text-gray-400 line-through">
                      R$ {produto.preco_original.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {discount && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">-{discount}%</span>
                    )}
                  </div>
                )}
                <p className="text-2xl font-black text-[#003E8A]">
                  R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  ou 12x de R$ {(produto.preco / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
                </p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{quantidade}</span>
                  <button onClick={() => setQuantidade((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => setIsFav(!isFav)}
                  className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:border-red-300 transition-colors flex-shrink-0">
                  <Heart size={14} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
              </div>

              <button onClick={handleAddToCart} disabled={!emEstoque}
                className="w-full bg-[#003E8A] hover:bg-[#002C63] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mb-3">
                <ShoppingCart size={15} />
                {emEstoque ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </button>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
                  <Truck size={11} className="text-[#003E8A] flex-shrink-0" />
                  <span>Entrega para todo o Brasil</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
                  <ShieldCheck size={11} className="text-green-500 flex-shrink-0" />
                  <span>Produto original com nota fiscal</span>
                </div>
              </div>

              {/* Calculadora de frete */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-[#222] mb-2 flex items-center gap-1.5">
                  <Truck size={12} className="text-[#003E8A]" /> Calcular frete
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="00000-000"
                    maxLength={9}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-gray-50"
                  />
                  <button
                    type="button"
                    className="bg-[#003E8A] hover:bg-[#002C63] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Calcular
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Prazo e valor calculados no checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIS PROCURADOS (fora do flex — sidebar para de ser sticky aqui) ── */}
        {maisProcurados.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#D4A63A]" />
              <h2 className="text-lg font-black text-[#222]">Mais procurados da categoria</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {maisProcurados.map((rel) => (
                <Link key={rel.id} href={`/produtos/${rel.slug}`}
                  className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md hover:border-[#003E8A]/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                  <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden mb-2 relative">
                    {rel.imagem_url
                      ? <img src={rel.imagem_url} alt={rel.nome} className="w-full h-full object-cover" />
                      : <Package size={24} className="text-gray-300" />
                    }
                    {rel.badge && (
                      <span className={`absolute top-1 left-1 text-[8px] font-black px-1 py-0.5 rounded ${badgeStyle[rel.badge]}`}>
                        {rel.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-[#222] line-clamp-2 mb-1 leading-tight flex-1">{rel.nome}</p>
                  <p className="text-xs font-black text-[#003E8A]">
                    R$ {rel.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2">
          <Link href="/produtos" className="flex items-center gap-2 text-sm text-[#003E8A] font-semibold hover:gap-3 transition-all">
            <ArrowLeft size={14} /> Voltar para produtos
          </Link>
        </div>
      </div>
    </ShopLayout>
  )
}
