'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Search, Loader2, AlertTriangle, CheckCircle, Package, Edit2, Check, X } from 'lucide-react'
import { listarEstoque, atualizarEstoque } from '@/lib/admin/produtos'

type ProdutoEstoque = {
  id: string; nome: string; slug: string; sku: string | null
  estoque_fisico: number; dropshipping: boolean; ativo: boolean
  categoria: { nome: string } | null
}

export default function AdminEstoquePage() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const carregar = (b: string) => {
    setLoading(true)
    listarEstoque(b || undefined)
      .then((d) => { setProdutos(d as unknown as ProdutoEstoque[]); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar('') }, [])

  const handleBusca = (v: string) => {
    setBusca(v)
    if (v.length === 0 || v.length > 2) carregar(v)
  }

  const startEdit = (id: string, current: number) => {
    setEditingId(id)
    setEditValue(String(current))
  }

  const cancelEdit = () => { setEditingId(null); setEditValue('') }

  const saveEdit = (id: string) => {
    const qty = parseInt(editValue, 10)
    if (isNaN(qty) || qty < 0) return
    startTransition(async () => {
      await atualizarEstoque(id, qty)
      setEditingId(null)
      setProdutos((prev) => prev.map((p) => p.id === id ? { ...p, estoque_fisico: qty } : p))
    })
  }

  const semEstoque = produtos.filter((p) => !p.dropshipping && p.estoque_fisico === 0).length
  const estoquebaixo = produtos.filter((p) => !p.dropshipping && p.estoque_fisico > 0 && p.estoque_fisico < 5).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#222]">Controle de estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">{produtos.length} produtos ativos</p>
        </div>
        <Link href="/admin/produtos/novo" className="text-sm text-[#003E8A] font-semibold hover:underline">
          + Novo produto
        </Link>
      </div>

      {/* Alertas */}
      {(semEstoque > 0 || estoquebaixo > 0) && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {semEstoque > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
              <AlertTriangle size={13} /> {semEstoque} produto{semEstoque !== 1 ? 's' : ''} sem estoque
            </div>
          )}
          {estoquebaixo > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
              <AlertTriangle size={13} /> {estoquebaixo} produto{estoquebaixo !== 1 ? 's' : ''} com estoque baixo (&lt;5)
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          value={busca}
          onChange={(e) => handleBusca(e.target.value)}
          placeholder="Buscar produto por nome..."
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
            <p className="text-sm text-gray-400">Nenhum produto encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Produto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 hidden md:table-cell">Categoria</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400">Situação</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400">Estoque</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {produtos.map((p) => {
                const isEditing = editingId === p.id
                const nivel = p.dropshipping ? 'drop' : p.estoque_fisico === 0 ? 'zero' : p.estoque_fisico < 5 ? 'baixo' : 'ok'
                return (
                  <tr key={p.id} className={`transition-colors ${nivel === 'zero' ? 'bg-red-50/30' : nivel === 'baixo' ? 'bg-amber-50/30' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#222] text-sm">{p.nome}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku ?? p.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{p.categoria?.nome ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.dropshipping ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Dropshipping
                        </span>
                      ) : nivel === 'zero' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <AlertTriangle size={11} /> Sem estoque
                        </span>
                      ) : nivel === 'baixo' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <AlertTriangle size={11} /> Estoque baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle size={11} /> Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.dropshipping ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            autoFocus
                            type="number" min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(p.id); if (e.key === 'Escape') cancelEdit() }}
                            className="w-20 text-center border border-[#003E8A] rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
                          />
                          <button type="button" onClick={() => saveEdit(p.id)} className="w-7 h-7 flex items-center justify-center text-green-500 hover:bg-green-50 rounded-lg">
                            <Check size={13} />
                          </button>
                          <button type="button" onClick={cancelEdit} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-lg font-black ${p.estoque_fisico === 0 ? 'text-red-500' : p.estoque_fisico < 5 ? 'text-amber-500' : 'text-green-600'}`}>
                          {p.estoque_fisico}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!p.dropshipping && !isEditing && (
                        <button type="button" onClick={() => startEdit(p.id, p.estoque_fisico)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#003E8A] mx-auto"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {isPending && (
        <div className="fixed bottom-4 right-4 bg-[#003E8A] text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Loader2 size={12} className="animate-spin" /> Salvando...
        </div>
      )}
    </div>
  )
}
