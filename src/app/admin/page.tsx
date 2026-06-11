'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ShoppingBag, Package, Users, DollarSign, Clock, Truck, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { statsAdmin, listarPedidosAdmin } from '@/lib/admin/pedidos'

type Stats = { totalPedidos: number; totalProdutos: number; totalClientes: number; receitaTotal: number }
type Pedido = {
  id: string; numero: string; status: string; total: number; criado_em: string
  perfil: { nome: string } | null
  itens: { nome_produto: string }[]
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusBadge: Record<string, string> = {
  entregue: 'bg-green-100 text-green-700',
  enviado: 'bg-blue-100 text-blue-700',
  em_separacao: 'bg-indigo-100 text-indigo-700',
  aguardando_pagamento: 'bg-orange-100 text-orange-700',
  pagamento_aprovado: 'bg-teal-100 text-teal-700',
  cancelado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-gray-100 text-gray-600',
}

const statusLabel: Record<string, string> = {
  entregue: 'Entregue', enviado: 'Enviado', em_separacao: 'Em separação',
  aguardando_pagamento: 'Aguard. pagto.', pagamento_aprovado: 'Pago',
  cancelado: 'Cancelado', reembolsado: 'Reembolsado',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      statsAdmin(),
      listarPedidosAdmin({ pagina: 1, por_pagina: 5 }),
    ]).then(([s, { pedidos: p }]) => {
      setStats(s)
      setPedidos(p as unknown as Pedido[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    )
  }

  const statCards = [
    { label: 'Receita total', value: fmt(stats?.receitaTotal ?? 0), icon: <DollarSign size={20} className="text-[#D4A63A]" />, bg: 'bg-[#D4A63A]/10' },
    { label: 'Total de pedidos', value: String(stats?.totalPedidos ?? 0), icon: <ShoppingBag size={20} className="text-[#003E8A]" />, bg: 'bg-[#003E8A]/10' },
    { label: 'Produtos ativos', value: String(stats?.totalProdutos ?? 0), icon: <Package size={20} className="text-purple-500" />, bg: 'bg-purple-100' },
    { label: 'Clientes', value: String(stats?.totalClientes ?? 0), icon: <Users size={20} className="text-green-500" />, bg: 'bg-green-100' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#222]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral da Ricarte Informática</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-xl font-black text-[#222]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[#222]">Pedidos recentes</h2>
            <Link href="/admin/pedidos" className="text-xs text-[#003E8A] font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          {pedidos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum pedido ainda</p>
          ) : (
            <div className="space-y-3">
              {pedidos.map((order) => (
                <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#222]">#{order.numero}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.perfil?.nome ?? 'Cliente'} · {order.itens?.[0]?.nome_produto ?? '—'}
                    </p>
                  </div>
                  <p className="text-sm font-black text-[#003E8A] flex-shrink-0">{fmt(order.total)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadge[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-black text-[#222] mb-4 text-sm">Atalhos</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/produtos/novo', label: 'Cadastrar produto', icon: <Package size={14} /> },
                { href: '/admin/categorias', label: 'Gerenciar categorias', icon: <Package size={14} /> },
                { href: '/admin/estoque', label: 'Controle de estoque', icon: <Package size={14} /> },
                { href: '/admin/pedidos', label: 'Ver pedidos', icon: <ShoppingBag size={14} /> },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-[#003E8A] py-2 border-b border-gray-50 last:border-0 font-medium transition-colors"
                >
                  <span className="text-gray-400">{link.icon}</span>
                  {link.label}
                  <ArrowRight size={12} className="ml-auto text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#003E8A] rounded-2xl p-5 text-white">
            <TrendingUp size={24} className="mb-3 text-[#D4A63A]" />
            <p className="font-black text-lg">{fmt(stats?.receitaTotal ?? 0)}</p>
            <p className="text-xs text-white/70 mt-0.5">Receita acumulada</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/70">Total de pedidos</p>
              <p className="text-sm font-bold text-[#D4A63A]">{stats?.totalPedidos ?? 0} pedidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
