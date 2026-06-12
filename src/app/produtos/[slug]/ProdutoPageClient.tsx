'use client'

import { useState, useEffect, useRef } from 'react'
import { notFound } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { buscarProdutoPorSlug, listarProdutos } from '@/lib/loja/produtos'
import type { ProdutoCard, ProdutoDetalhe } from '@/lib/loja/produtos'
import { listarAvaliacoes, minhaAvaliacao, criarAvaliacao, excluirMinhaAvaliacao } from '@/lib/loja/avaliacoes'
import type { Avaliacao } from '@/lib/loja/avaliacoes'
import { useCart } from '@/context/CartContext'
import {
  Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Plus, Minus,
  Package, Loader2, Heart, ChevronDown, Tag, TrendingUp, MapPin, Search,
  MessageSquare, ThumbsUp, Send, Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { buscarCep, calcularFrete } from '@/lib/loja/frete'
import type { OpcaoFrete } from '@/lib/loja/frete'

const badgeStyle: Record<string, string> = {
  'MAIS VENDIDO': 'bg-[#D4A63A] text-[#002C63]',
  'PROMOÇÃO':    'bg-red-500 text-white',
  'NOVO':        'bg-[#003E8A] text-white',
}

type ResultadoFrete = { cidade: string; estado: string; opcoes: OpcaoFrete[] }

export default function ProdutoPageClient({ slug }: { slug: string }) {
  const [produto, setProduto]               = useState<ProdutoDetalhe | null | undefined>(undefined)
  const [maisProcurados, setMaisProcurados] = useState<ProdutoCard[]>([])
  const [imagemAtiva, setImagemAtiva]       = useState(0)
  const [quantidade, setQuantidade]         = useState(1)
  const [isFav, setIsFav]                   = useState(false)
  const [cepFrete, setCepFrete]             = useState('')
  const [calcLoading, setCalcLoading]       = useState(false)
  const [calcErro, setCalcErro]             = useState('')
  const [calcResult, setCalcResult]         = useState<ResultadoFrete | null>(null)
  const descricaoRef                        = useRef<HTMLDivElement>(null)
  const { addItem }                         = useCart()

  // Reviews
  const [avaliacoes, setAvaliacoes]         = useState<Avaliacao[]>([])
  const [minhaAvl, setMinhaAvl]             = useState<Avaliacao | null | undefined>(undefined)
  const [avlLoading, setAvlLoading]         = useState(false)
  const [notaForm, setNotaForm]             = useState(5)
  const [tituloForm, setTituloForm]         = useState('')
  const [comentarioForm, setComentarioForm] = useState('')
  const [avlErro, setAvlErro]               = useState('')
  const [avlEnviando, setAvlEnviando]       = useState(false)

  useEffect(() => {
    buscarProdutoPorSlug(slug).then((data) => {
      setProduto(data)
      const fetchRelated = data?.categoria_slug
        ? listarProdutos({ categoria_slug: data.categoria_slug, por_pagina: 8 })
        : listarProdutos({ por_pagina: 8 })
      fetchRelated.then(({ produtos: rel }) =>
        setMaisProcurados(rel.filter((p) => p.slug !== slug).slice(0, 8))
      )
      if (data) {
        listarAvaliacoes(data.id).then(setAvaliacoes)
        minhaAvaliacao(data.id).then(setMinhaAvl)
      }
    })
  }, [slug])

  const handleEnviarAvaliacao = async () => {
    if (!produto) return
    if (!comentarioForm.trim()) { setAvlErro('O comentário é obrigatório.'); return }
    setAvlEnviando(true)
    setAvlErro('')
    const res = await criarAvaliacao({ produto_id: produto.id, nota: notaForm, comentario: comentarioForm, titulo: tituloForm || undefined })
    if (res.error) { setAvlErro(res.error); setAvlEnviando(false); return }
    const [novas, minha] = await Promise.all([listarAvaliacoes(produto.id), minhaAvaliacao(produto.id)])
    setAvaliacoes(novas)
    setMinhaAvl(minha)
    setComentarioForm(''); setTituloForm(''); setNotaForm(5)
    setAvlEnviando(false)
  }

  const handleExcluirAvaliacao = async (id: string) => {
    if (!produto) return
    setAvlLoading(true)
    await excluirMinhaAvaliacao(id)
    const [novas, minha] = await Promise.all([listarAvaliacoes(produto.id), minhaAvaliacao(produto.id)])
    setAvaliacoes(novas)
    setMinhaAvl(minha)
    setAvlLoading(false)
  }

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

  const handleCalcularFrete = async () => {
    const clean = cepFrete.replace(/\D/g, '')
    if (clean.length !== 8) { setCalcErro('Digite um CEP válido com 8 dígitos.'); return }
    setCalcLoading(true)
    setCalcErro('')
    setCalcResult(null)
    const dados = await buscarCep(clean)
    if (!dados) { setCalcErro('CEP não encontrado. Verifique e tente novamente.'); setCalcLoading(false); return }
    const peso = produto?.peso_kg ?? 0.5
    setCalcResult({ cidade: dados.localidade, estado: dados.uf, opcoes: calcularFrete(dados.uf, peso) })
    setCalcLoading(false)
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantidade; i++) {
      addItem({ id: produto.id, nome: produto.nome, preco: produto.preco, imagem_url: produto.imagem_url, slug: produto.slug })
    }
  }

  return (
    <ShopLayout>
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
        <div className="flex gap-6 items-start mb-10">

          <div className="flex-1 min-w-0 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-6 items-start">
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

              <div className="hidden lg:block sticky top-24 self-start">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-sm text-[#222] mb-3 flex items-center gap-2">
                    <Tag size={13} className="text-[#D4A63A]" /> Sobre o produto
                  </h3>
                  {produto.descricao_curta && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3 font-medium">{produto.descricao_curta}</p>
                  )}
                  {produto.descricao && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-6 mb-3">{produto.descricao}</p>
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

            {/* Calcular frete — mobile only */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-[#222] mb-2 flex items-center gap-1.5">
                <Truck size={12} className="text-[#003E8A]" /> Calcular frete
              </p>
              <div className="flex gap-2">
                <input
                  type="text" value={cepFrete}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, '').slice(0, 8)
                    setCepFrete(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d)
                    setCalcErro(''); setCalcResult(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalcularFrete()}
                  placeholder="00000-000" maxLength={9}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-gray-50"
                />
                <button type="button" onClick={handleCalcularFrete} disabled={calcLoading}
                  className="bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5">
                  {calcLoading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                  Calcular
                </button>
              </div>
              {calcErro && <p className="text-[10px] text-red-500 mt-1.5">{calcErro}</p>}
              {calcResult && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                    <MapPin size={10} className="text-[#003E8A]" />
                    Entregando em: <span className="font-semibold text-[#222] ml-1">{calcResult.cidade}/{calcResult.estado}</span>
                  </div>
                  {calcResult.opcoes.map((op) => (
                    <div key={op.nome} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-xs font-bold text-[#222]">{op.nome}</span>
                        <span className="text-[10px] text-gray-400 ml-1">· {op.descricao}</span>
                        <p className="text-[10px] text-gray-400">{op.prazo}</p>
                      </div>
                      <span className="text-sm font-black text-[#003E8A]">
                        R$ {op.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400">* Valores estimados. Prazo exato confirmado no checkout.</p>
                </div>
              )}
              {!calcResult && !calcErro && (
                <p className="text-[10px] text-gray-400 mt-1.5">Digite seu CEP para ver opções de entrega</p>
              )}
            </div>

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
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-[#222] mb-2 flex items-center gap-1.5">
                  <Truck size={12} className="text-[#003E8A]" /> Calcular frete
                </p>
                <div className="flex gap-2">
                  <input
                    type="text" value={cepFrete}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, '').slice(0, 8)
                      setCepFrete(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d)
                      setCalcErro(''); setCalcResult(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalcularFrete()}
                    placeholder="00000-000" maxLength={9}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-gray-50"
                  />
                  <button type="button" onClick={handleCalcularFrete} disabled={calcLoading}
                    className="bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5">
                    {calcLoading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                    Calcular
                  </button>
                </div>
                {calcErro && <p className="text-[10px] text-red-500 mt-1.5">{calcErro}</p>}
                {calcResult && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                      <MapPin size={10} className="text-[#003E8A]" />
                      Entregando em: <span className="font-semibold text-[#222]">{calcResult.cidade}/{calcResult.estado}</span>
                    </div>
                    {calcResult.opcoes.map((op) => (
                      <div key={op.nome} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-xs font-bold text-[#222]">{op.nome}</span>
                          <span className="text-[10px] text-gray-400 ml-1">· {op.descricao}</span>
                          <p className="text-[10px] text-gray-400">{op.prazo}</p>
                        </div>
                        <span className="text-sm font-black text-[#003E8A]">
                          R$ {op.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-400">* Valores estimados. Prazo exato confirmado no checkout.</p>
                  </div>
                )}
                {!calcResult && !calcErro && (
                  <p className="text-[10px] text-gray-400 mt-1.5">Digite seu CEP para ver opções de entrega</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ====== AVALIAÇÕES ====== */}
        {produto && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare size={18} className="text-[#D4A63A]" />
              <h2 className="text-lg font-black text-[#222]">Avaliações dos clientes</h2>
              {avaliacoes.length > 0 && (
                <span className="text-sm text-gray-400">({avaliacoes.length})</span>
              )}
            </div>

            {/* Resumo da nota */}
            {avaliacoes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-[#003E8A]">{produto.avaliacao_media.toFixed(1)}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < Math.round(produto.avaliacao_media) ? 'fill-[#D4A63A] text-[#D4A63A]' : 'fill-gray-200 text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{produto.total_avaliacoes} avaliação{produto.total_avaliacoes !== 1 ? 'ões' : ''}</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const count = avaliacoes.filter((a) => a.nota === n).length
                    const pct   = avaliacoes.length > 0 ? (count / avaliacoes.length) * 100 : 0
                    return (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-gray-500">{n}</span>
                        <Star size={10} className="fill-[#D4A63A] text-[#D4A63A] flex-shrink-0" />
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#D4A63A] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-5 text-right text-gray-400">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Lista de avaliações */}
            <div className="space-y-4 mb-6">
              {avaliacoes.length === 0 && minhaAvl === null && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                  <ThumbsUp size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
                </div>
              )}
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < av.nota ? 'fill-[#D4A63A] text-[#D4A63A]' : 'fill-gray-200 text-gray-200'} />
                        ))}
                        {av.titulo && <span className="text-sm font-bold text-[#222] ml-1">— {av.titulo}</span>}
                      </div>
                      <p className="text-xs text-gray-400">
                        {av.perfil_nome} · {new Date(av.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {minhaAvl?.id === av.id && (
                      <button
                        onClick={() => handleExcluirAvaliacao(av.id)}
                        disabled={avlLoading}
                        className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 flex-shrink-0">
                        <Trash2 size={12} /> Excluir
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{av.comentario}</p>
                </div>
              ))}
            </div>

            {/* Formulário de avaliação */}
            {minhaAvl === undefined ? null : minhaAvl !== null ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                Você já avaliou este produto.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#222] mb-4 flex items-center gap-2">
                  <Star size={15} className="text-[#D4A63A]" /> Deixe sua avaliação
                </h3>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Sua nota</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setNotaForm(n)}
                        className="transition-transform hover:scale-110">
                        <Star size={28} className={n <= notaForm ? 'fill-[#D4A63A] text-[#D4A63A]' : 'fill-gray-200 text-gray-200'} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 self-center">{notaForm} estrela{notaForm !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Título (opcional)</label>
                  <input
                    type="text"
                    value={tituloForm}
                    onChange={(e) => setTituloForm(e.target.value)}
                    placeholder="Resumo da sua avaliação"
                    maxLength={80}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Comentário *</label>
                  <textarea
                    value={comentarioForm}
                    onChange={(e) => setComentarioForm(e.target.value)}
                    placeholder="Conte sua experiência com o produto..."
                    rows={3}
                    maxLength={800}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5 text-right">{comentarioForm.length}/800</p>
                </div>

                {avlErro && (
                  <p className="text-xs text-red-500 mb-3">{avlErro}</p>
                )}

                <button
                  onClick={handleEnviarAvaliacao}
                  disabled={avlEnviando || !comentarioForm.trim()}
                  className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  {avlEnviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Publicar avaliação
                </button>
              </div>
            )}
          </div>
        )}

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
