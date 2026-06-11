'use client'

import React, { useState, useEffect } from 'react'
import ShopLayout from '@/components/layout/ShopLayout'
import { User, Package, MapPin, LogOut, Edit2, ChevronRight, CheckCircle, Clock, Truck, Loader2, LayoutDashboard, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/lib/auth/actions'
import { createClient } from '@/lib/db/supabase/client'
import { listarMeusPedidos } from '@/lib/loja/pedidos'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type Tab = 'pedidos' | 'perfil' | 'enderecos'

type Pedido = Awaited<ReturnType<typeof listarMeusPedidos>>[number]

const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  aguardando_pagamento: { label: 'Aguardando pagamento', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <AlertCircle size={12} /> },
  pagamento_aprovado:   { label: 'Pagamento aprovado',   color: 'text-blue-600 bg-blue-50 border-blue-200',     icon: <CheckCircle size={12} /> },
  em_separacao:         { label: 'Em separação',         color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Package size={12} /> },
  enviado:              { label: 'Enviado',              color: 'text-blue-600 bg-blue-50 border-blue-200',      icon: <Truck size={12} /> },
  entregue:             { label: 'Entregue',             color: 'text-green-600 bg-green-50 border-green-200',   icon: <CheckCircle size={12} /> },
  cancelado:            { label: 'Cancelado',            color: 'text-red-600 bg-red-50 border-red-200',         icon: <XCircle size={12} /> },
  reembolsado:          { label: 'Reembolsado',          color: 'text-gray-600 bg-gray-50 border-gray-200',      icon: <Clock size={12} /> },
}

export default function ContaPage() {
  const [tab, setTab] = useState<Tab>('pedidos')
  const [editing, setEditing] = useState(false)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      setSupabaseUser(u ?? null)
      if (u) {
        setName(u.user_metadata?.nome ?? u.email?.split('@')[0] ?? 'Usuário')
        setPhone(u.user_metadata?.telefone ?? '')
      }
    })

    listarMeusPedidos().then((data) => {
      setPedidos(data)
      setLoadingPedidos(false)
    })

    supabase.from('perfis').select('role').then(({ data }) => {
      if (data?.[0]?.role === 'admin') setIsAdmin(true)
    })
  }, [])

  const email = supabaseUser?.email ?? ''

  const tabsList: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'pedidos', label: 'Meus pedidos', icon: <Package size={16} /> },
    { id: 'perfil', label: 'Meu perfil', icon: <User size={16} /> },
    { id: 'enderecos', label: 'Endereços', icon: <MapPin size={16} /> },
  ]

  return (
    <ShopLayout>
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-3">
        <p className="text-xs text-gray-400">
          <Link href="/" className="hover:text-[#003E8A]">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#003E8A] font-medium">Minha Conta</span>
        </p>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#003E8A] rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#222] truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate">{email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabsList.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${tab === t.id ? 'bg-[#003E8A] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </nav>
            </div>

            {isAdmin && (
              <Link href="/admin"
                className="flex items-center gap-2.5 w-full bg-[#002C63] hover:bg-[#001a3d] text-white rounded-xl px-4 py-3 text-sm font-bold transition-colors">
                <LayoutDashboard size={16} className="text-[#D4A63A]" />
                <div>
                  <p className="leading-tight">Painel Admin</p>
                  <p className="text-[10px] text-white/60 font-normal">Gerenciar a loja</p>
                </div>
                <ChevronRight size={14} className="ml-auto text-white/50" />
              </Link>
            )}

            <form action={logout}>
              <button type="submit"
                className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-white border border-gray-100 rounded-xl px-4 py-2.5 transition-colors">
                <LogOut size={15} /> Sair da conta
              </button>
            </form>
          </div>

          {/* Conteúdo */}
          <div className="md:col-span-3">
            {/* Pedidos */}
            {tab === 'pedidos' && (
              <div className="space-y-4">
                <h2 className="font-black text-[#222]">Meus pedidos</h2>
                {loadingPedidos ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-gray-300" />
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                    <Package size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400 mb-3">Você ainda não fez nenhum pedido</p>
                    <Link href="/produtos" className="text-sm text-[#003E8A] font-bold hover:underline">
                      Explorar produtos
                    </Link>
                  </div>
                ) : (
                  pedidos.map((pedido) => {
                    const status = statusInfo[pedido.status] ?? statusInfo['aguardando_pagamento']
                    const itens = (pedido.itens ?? []) as { nome_produto: string; quantidade: number; preco_unitario: number }[]
                    return (
                      <div key={pedido.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                          <div>
                            <p className="text-xs text-gray-400 font-mono font-semibold">
                              Pedido #{String(pedido.numero).padStart(5, '0')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(pedido.criado_em as string).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <div className="space-y-1.5 mb-3">
                          {itens.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Package size={13} className="text-gray-300 flex-shrink-0" />
                              <span className="text-gray-600 line-clamp-1">{item.nome_produto}</span>
                              <span className="text-gray-400 text-xs flex-shrink-0">x{item.quantidade}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <p className="font-black text-[#003E8A]">
                            R$ {(pedido.total as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Perfil */}
            {tab === 'perfil' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-[#222]">Meu perfil</h2>
                  <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 text-sm text-[#003E8A] font-semibold">
                    <Edit2 size={13} /> {editing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nome completo</label>
                    {editing
                      ? <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      : <p className="text-sm text-[#222] font-medium">{name}</p>
                    }
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
                    <p className="text-sm text-gray-400">{email} <span className="text-xs">(não editável)</span></p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Telefone</label>
                    {editing
                      ? <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      : <p className="text-sm text-[#222] font-medium">{phone || 'Não informado'}</p>
                    }
                  </div>
                  {editing && (
                    <button onClick={() => setEditing(false)} className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
                      Salvar alterações
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Endereços */}
            {tab === 'enderecos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-[#222]">Endereços</h2>
                  <button className="text-sm font-bold text-[#003E8A] flex items-center gap-1 hover:underline">
                    + Adicionar endereço
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                  <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 mb-2">Nenhum endereço salvo ainda</p>
                  <p className="text-xs text-gray-400">Os endereços inseridos no checkout aparecerão aqui em breve.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
