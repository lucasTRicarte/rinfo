'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit2, Trash2, Package, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { listarProdutosAdmin, toggleProdutoAtivo, excluirProduto } from '@/lib/admin/produtos'

type Produto = {
  id: string; nome: string; slug: string; preco: number; preco_original: number | null
  badge: string | null; sku: string | null; estoque_fisico: number; ativo: boolean
  destaque: boolean; dropshipping: boolean; criado_em: string
  categoria: { id: string; nome: string; slug: string } | null
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const POR_PAGINA = 20

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [isPending, startTransition] = useTransition()

  const totalPaginas = Math.ceil(total / POR_PAGINA)

  const carregar = (p: number, b: string) => {
    setLoading(true)
    listarProdutosAdmin({ busca: b || undefined, pagina: p, por_pagina: POR_PAGINA })
      .then(({ produtos: d, total: t }) => { setProdutos(d as unknown as Produto[]); setTotal(t); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar(pagina, busca) }, [pagina])

  const handleBusca = (v: string) => {
    setBusca(v)
    setPagina(1)
    if (v.length === 0 || v.length > 2) carregar(1, v)
  }

  const handleToggleAtivo = (id: string, ativo: boolean) => {
    startTransition(async () => { await toggleProdutoAtivo(id, ativo); carregar(pagina, busca) })
  }

  const handleDelete = (id: string, nome: string) => {
    if (!confirm(`Desativar "${nome}"?`)) return
    startTransition(async () => { await excluirProduto(id); carregar(pagina, busca) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#222]">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} produto{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/produtos/novo" className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-2.5 px-4 rounded-xl text-sm">
          <Plus size={15} /> Novo produto
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          value={busca}
          onChange={(e) => handleBusca(e.target.value)}
          placeholder="Buscar por nome do produto..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
        {busca && (
          <button type="button" onClick={() => handleBusca('')} className="text-xs text-gray-400 hover:text-gray-600">Limpar</button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 mb-3">{busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
            {!busca && <Link href="/admin/produtos/novo" className="text-sm text-[#003E8A] font-bold hover:underline">Criar primeiro produto</Link>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Produto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 hidden md:table-cell">Categoria</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400">Preço</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 hidden sm:table-cell">Estoque</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {produtos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#222] text-sm leading-tight">{p.nome}</p>
                          {p.badge && (
                            <span className="text-[9px] font-black bg-[#D4A63A]/15 text-[#D4A63A] px-1.5 py-0.5 rounded-full">{p.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku || p.slug}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{p.categoria?.nome ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-bold text-[#222]">{fmt(p.preco)}</p>
                        {p.preco_original && p.preco_original > p.preco && (
                          <p className="text-[11px] text-gray-400 line-through">{fmt(p.preco_original)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {p.dropshipping ? (
                          <span className="text-xs text-blue-500 font-medium">Drop</span>
                        ) : (
                          <span className={`text-xs font-bold ${p.estoque_fisico === 0 ? 'text-red-500' : p.estoque_fisico < 5 ? 'text-amber-500' : 'text-green-600'}`}>
                            {p.estoque_fisico}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => handleToggleAtivo(p.id, !p.ativo)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${p.ativo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/admin/produtos/${p.id}/editar`} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#003E8A]">
                            <Edit2 size={13} />
                          </Link>
                          <button type="button" onClick={() => handleDelete(p.id, p.nome)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Página {pagina} de {totalPaginas}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isPending && (
        <div className="fixed bottom-4 right-4 bg-[#003E8A] text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Loader2 size={12} className="animate-spin" /> Atualizando...
        </div>
      )}
    </div>
  )
}
