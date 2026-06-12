'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, Clock, Truck, CheckCircle, XCircle, Package, Loader2, RefreshCw } from 'lucide-react'
import { listarPedidosAdmin, atualizarStatusPedido } from '@/lib/admin/pedidos'
import type { StatusPedido } from '@/types/database'

type Pedido = {
  id: string; numero: string; status: StatusPedido; total: number; frete: number; criado_em: string
  pagamento_metodo: string | null; codigo_rastreio: string | null
  frete_servico: string | null
  perfil: { nome: string; telefone: string | null } | null
  itens: { id: string; nome_produto: string; quantidade: number; preco_unitario: number }[]
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  aguardando_pagamento: { label: 'Aguard. pagamento', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock size={11} /> },
  pagamento_aprovado: { label: 'Pago', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: <CheckCircle size={11} /> },
  em_separacao: { label: 'Em separação', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <Package size={11} /> },
  enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Truck size={11} /> },
  entregue: { label: 'Entregue', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={11} /> },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={11} /> },
  reembolsado: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <RefreshCw size={11} /> },
}

const ALL_STATUS: (StatusPedido | 'todos')[] = ['todos', 'aguardando_pagamento', 'pagamento_aprovado', 'em_separacao', 'enviado', 'entregue', 'cancelado']

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<StatusPedido | ''>('')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [statusMenuAberto, setStatusMenuAberto] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const carregar = () => {
    setLoading(true)
    listarPedidosAdmin({ status: statusFiltro || undefined, pagina: 1, por_pagina: 50 })
      .then(({ pedidos: d, total: t }) => { setPedidos(d as unknown as Pedido[]); setTotal(t); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [statusFiltro])

  const filtrados = pedidos.filter((p) => {
    if (!busca) return true
    const q = busca.toLowerCase()
    return p.numero.toLowerCase().includes(q) || (p.perfil?.nome ?? '').toLowerCase().includes(q)
  })

  const handleStatusChange = (id: string, newStatus: StatusPedido) => {
    setStatusMenuAberto(null)
    startTransition(async () => {
      await atualizarStatusPedido(id, newStatus)
      carregar()
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#222]">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} pedido{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtros de status */}
      <div className="flex gap-2 flex-wrap mb-4">
        {ALL_STATUS.map((s) => (
          <button key={s} type="button"
            onClick={() => setStatusFiltro(s === 'todos' ? '' : s as StatusPedido)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              (s === 'todos' && !statusFiltro) || s === statusFiltro
                ? 'bg-[#003E8A] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-[#003E8A]/40'
            }`}
          >
            {s === 'todos' ? 'Todos' : statusInfo[s]?.label ?? s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por número do pedido ou cliente..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtrados.map((pedido) => {
              const info = statusInfo[pedido.status] ?? { label: pedido.status, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: null }
              const isExp = expandido === pedido.id
              return (
                <div key={pedido.id}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <button type="button" onClick={() => setExpandido(isExp ? null : pedido.id)}
                      className="flex-1 grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 text-left min-w-0"
                    >
                      <div>
                        <p className="text-xs font-black text-[#222]">#{pedido.numero}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#222] truncate">{pedido.perfil?.nome ?? 'Cliente'}</p>
                        <p className="text-xs text-gray-400">{pedido.itens?.length ?? 0} {(pedido.itens?.length ?? 0) === 1 ? 'item' : 'itens'}</p>
                      </div>
                      <p className="font-black text-[#003E8A] text-sm flex-shrink-0">{fmt(pedido.total)}</p>
                    </button>

                    {/* Status selector */}
                    <div className="relative flex-shrink-0">
                      <button type="button"
                        onClick={() => setStatusMenuAberto(statusMenuAberto === pedido.id ? null : pedido.id)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border ${info.color}`}
                      >
                        {info.icon} <span className="hidden sm:inline">{info.label}</span> <ChevronDown size={10} />
                      </button>
                      {statusMenuAberto === pedido.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setStatusMenuAberto(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1 min-w-[160px]">
                            {Object.entries(statusInfo).map(([key, val]) => (
                              <button key={key} type="button"
                                onClick={() => handleStatusChange(pedido.id, key as StatusPedido)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 text-left ${pedido.status === key ? 'text-[#003E8A]' : 'text-gray-600'}`}
                              >
                                {val.icon} {val.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {isExp && (
                    <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100">
                      <div className="pt-3 space-y-1">
                        {pedido.itens?.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-gray-600">{item.quantidade}× {item.nome_produto}</span>
                            <span className="font-semibold text-[#222]">{fmt(item.preco_unitario * item.quantidade)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 pt-2 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <p className="text-xs text-gray-500">
                            Frete: <span className="font-semibold text-[#222]">
                              {pedido.frete_servico ?? '—'}
                              {pedido.frete > 0 && ` · ${fmt(pedido.frete)}`}
                            </span>
                          </p>
                          {pedido.pagamento_metodo && (
                            <p className="text-xs text-gray-500">Pagamento: <span className="font-semibold text-[#222]">{pedido.pagamento_metodo}</span></p>
                          )}
                          {pedido.codigo_rastreio && (
                            <p className="text-xs text-blue-600">Rastreio: <span className="font-mono font-bold">{pedido.codigo_rastreio}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isPending && (
        <div className="fixed bottom-4 right-4 bg-[#003E8A] text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Loader2 size={12} className="animate-spin" /> Atualizando status...
        </div>
      )}
    </div>
  )
}
