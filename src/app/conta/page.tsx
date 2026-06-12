'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import ShopLayout from '@/components/layout/ShopLayout'
import {
  User, Package, MapPin, LogOut, Edit2, ChevronRight, CheckCircle, Clock,
  Truck, Loader2, LayoutDashboard, XCircle, AlertCircle, Camera, Phone,
  Plus, Trash2, Star, Home, Save, X, Search,
} from 'lucide-react'
import Link from 'next/link'
import { logout, atualizarPerfil } from '@/lib/auth/actions'
import { createClient } from '@/lib/db/supabase/client'
import { listarMeusPedidos } from '@/lib/loja/pedidos'
import {
  listarEnderecos, criarEndereco, atualizarEndereco, excluirEndereco, definirEnderecoPrincipal,
  type Endereco,
} from '@/lib/loja/enderecos'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type Tab = 'pedidos' | 'perfil' | 'enderecos'
type Pedido = Awaited<ReturnType<typeof listarMeusPedidos>>[number]
type Msg = { type: 'success' | 'error'; text: string }

const UFs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  aguardando_pagamento: { label: 'Aguardando pagamento', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <AlertCircle size={12} /> },
  pagamento_aprovado:   { label: 'Pagamento aprovado',   color: 'text-blue-600 bg-blue-50 border-blue-200',     icon: <CheckCircle size={12} /> },
  em_separacao:         { label: 'Em separação',         color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Package size={12} /> },
  enviado:              { label: 'Enviado',              color: 'text-blue-600 bg-blue-50 border-blue-200',      icon: <Truck size={12} /> },
  entregue:             { label: 'Entregue',             color: 'text-green-600 bg-green-50 border-green-200',   icon: <CheckCircle size={12} /> },
  cancelado:            { label: 'Cancelado',            color: 'text-red-600 bg-red-50 border-red-200',         icon: <XCircle size={12} /> },
  reembolsado:          { label: 'Reembolsado',          color: 'text-gray-600 bg-gray-50 border-gray-200',      icon: <Clock size={12} /> },
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const emptyForm = { apelido: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }

export default function ContaPage() {
  const [tab, setTab] = useState<Tab>('pedidos')
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(true)

  // Perfil
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [editingPerfil, setEditingPerfil] = useState(false)
  const [perfilMsg, setPerfilMsg] = useState<Msg | null>(null)
  const [savingPerfil, startSavePerfil] = useTransition()
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [loadingEnd, setLoadingEnd] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEndId, setEditingEndId] = useState<string | null>(null)
  const [endForm, setEndForm] = useState(emptyForm)
  const [loadingCep, setLoadingCep] = useState(false)
  const [endMsg, setEndMsg] = useState<Msg | null>(null)
  const [savingEnd, startSaveEnd] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user
      setSupabaseUser(u ?? null)
      if (!u) return

      const { data: perfil } = await supabase
        .from('perfis')
        .select('nome, telefone, foto_url, role')
        .eq('id', u.id)
        .single()

      setNome(perfil?.nome || u.email?.split('@')[0] || 'Usuário')
      setTelefone(perfil?.telefone || '')
      setFotoUrl(perfil?.foto_url || '')
      setIsAdmin(perfil?.role === 'admin')
    })

    listarMeusPedidos().then((data) => { setPedidos(data); setLoadingPedidos(false) })
    listarEnderecos().then((data) => { setEnderecos(data); setLoadingEnd(false) })
  }, [])

  const recarregarEnderecos = () => {
    listarEnderecos().then(setEnderecos)
  }

  // — Foto upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !supabaseUser) return
    setUploadingFoto(true)
    setPerfilMsg(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `avatars/${supabaseUser.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('imagens').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('imagens').getPublicUrl(path)
      const result = await atualizarPerfil({ nome, telefone, foto_url: publicUrl })
      if (result?.error) throw new Error(result.error)
      setFotoUrl(publicUrl)
      setPerfilMsg({ type: 'success', text: 'Foto atualizada!' })
    } catch (err) {
      setPerfilMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao fazer upload' })
    } finally {
      setUploadingFoto(false)
    }
  }

  // — Salvar perfil
  const handleSavePerfil = () => {
    setPerfilMsg(null)
    startSavePerfil(async () => {
      try {
        const result = await atualizarPerfil({ nome, telefone, foto_url: fotoUrl || undefined })
        if (result?.error) { setPerfilMsg({ type: 'error', text: result.error }); return }
        setPerfilMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        setEditingPerfil(false)
      } catch (err) {
        setPerfilMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erro inesperado' })
      }
    })
  }

  // — CEP auto-fill
  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setEndForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }))
      }
    } catch { /* ignorar erro de CEP */ }
    finally { setLoadingCep(false) }
  }

  // — Abrir form de endereço
  const abrirFormEndereco = (endereco?: Endereco) => {
    if (endereco) {
      setEditingEndId(endereco.id)
      setEndForm({
        apelido: endereco.apelido || '',
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento || '',
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
      })
    } else {
      setEditingEndId(null)
      setEndForm(emptyForm)
    }
    setEndMsg(null)
    setShowForm(true)
  }

  const fecharFormEndereco = () => { setShowForm(false); setEditingEndId(null); setEndForm(emptyForm) }

  // — Salvar endereço
  const handleSaveEndereco = () => {
    setEndMsg(null)
    startSaveEnd(async () => {
      try {
        const params = {
          apelido: endForm.apelido || null,
          cep: endForm.cep,
          logradouro: endForm.logradouro,
          numero: endForm.numero,
          complemento: endForm.complemento || null,
          bairro: endForm.bairro,
          cidade: endForm.cidade,
          estado: endForm.estado,
        }
        const result = editingEndId
          ? await atualizarEndereco(editingEndId, params)
          : await criarEndereco(params)
        if (result.error) { setEndMsg({ type: 'error', text: result.error }); return }
        fecharFormEndereco()
        recarregarEnderecos()
      } catch (err) {
        setEndMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erro inesperado' })
      }
    })
  }

  // — Excluir endereço
  const handleExcluirEndereco = async (id: string) => {
    if (!confirm('Excluir este endereço?')) return
    const result = await excluirEndereco(id)
    if (result.error) { setEndMsg({ type: 'error', text: result.error }); return }
    recarregarEnderecos()
  }

  // — Definir principal
  const handleSetPrincipal = async (id: string) => {
    await definirEnderecoPrincipal(id)
    recarregarEnderecos()
  }

  const email = supabaseUser?.email ?? ''
  const initials = nome.charAt(0).toUpperCase()

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
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-[#003E8A] flex items-center justify-center text-white font-black text-lg border-2 border-[#003E8A]/20">
                  {fotoUrl
                    ? <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#222] truncate">{nome}</p>
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

            {/* ─── PEDIDOS ─── */}
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
                    <Link href="/produtos" className="text-sm text-[#003E8A] font-bold hover:underline">Explorar produtos</Link>
                  </div>
                ) : (
                  pedidos.map((pedido) => {
                    const status = statusInfo[pedido.status] ?? statusInfo['aguardando_pagamento']
                    const itens = (pedido.itens ?? []) as { nome_produto: string; quantidade: number; preco_unitario: number }[]
                    return (
                      <div key={pedido.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                          <div>
                            <p className="text-xs text-gray-400 font-mono font-semibold">Pedido #{String(pedido.numero).padStart(5, '0')}</p>
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

            {/* ─── PERFIL ─── */}
            {tab === 'perfil' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-[#222]">Meu perfil</h2>
                  {!editingPerfil && (
                    <button onClick={() => { setEditingPerfil(true); setPerfilMsg(null) }}
                      className="flex items-center gap-1.5 text-sm text-[#003E8A] font-semibold hover:underline">
                      <Edit2 size={13} /> Editar
                    </button>
                  )}
                </div>

                {perfilMsg && (
                  <div className={`mb-4 text-sm px-4 py-3 rounded-xl border ${perfilMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {perfilMsg.text}
                  </div>
                )}

                {/* Foto */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-[#003E8A] flex items-center justify-center text-white font-black text-3xl border-2 border-[#003E8A]/20">
                      {fotoUrl
                        ? <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    {(editingPerfil || !fotoUrl) && (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingFoto}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#003E8A] hover:bg-[#002C63] text-white rounded-full flex items-center justify-center shadow transition-colors disabled:opacity-60">
                        {uploadingFoto ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                      </button>
                    )}
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </div>
                  <div>
                    <p className="font-bold text-[#222]">{nome}</p>
                    <p className="text-xs text-gray-400">{email}</p>
                    <button type="button" onClick={() => photoInputRef.current?.click()} disabled={uploadingFoto}
                      className="text-xs text-[#003E8A] hover:underline mt-1 font-medium">
                      {uploadingFoto ? 'Enviando...' : 'Alterar foto'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nome completo</label>
                    {editingPerfil
                      ? <input value={nome} onChange={(e) => setNome(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      : <p className="text-sm text-[#222] font-medium">{nome}</p>
                    }
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
                    <p className="text-sm text-gray-400">{email} <span className="text-xs">(não editável)</span></p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      <span className="flex items-center gap-1"><Phone size={12} /> Telefone</span>
                    </label>
                    {editingPerfil
                      ? <input value={telefone} onChange={(e) => setTelefone(formatPhone(e.target.value))}
                          placeholder="(00) 00000-0000"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      : <p className="text-sm text-[#222] font-medium">{telefone || 'Não informado'}</p>
                    }
                  </div>

                  {editingPerfil && (
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSavePerfil} disabled={savingPerfil}
                        className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
                        {savingPerfil ? <><Loader2 size={13} className="animate-spin" /> Salvando...</> : <><Save size={13} /> Salvar alterações</>}
                      </button>
                      <button onClick={() => { setEditingPerfil(false); setPerfilMsg(null) }}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3">
                        <X size={13} /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── ENDEREÇOS ─── */}
            {tab === 'enderecos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-[#222]">Endereços</h2>
                  {!showForm && (
                    <button onClick={() => abrirFormEndereco()}
                      className="flex items-center gap-1.5 text-sm font-bold text-[#003E8A] hover:underline">
                      <Plus size={14} /> Adicionar endereço
                    </button>
                  )}
                </div>

                {endMsg && (
                  <div className={`text-sm px-4 py-3 rounded-xl border ${endMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {endMsg.text}
                  </div>
                )}

                {/* Formulário de endereço */}
                {showForm && (
                  <div className="bg-white rounded-xl border border-[#003E8A]/20 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#222] text-sm">
                        {editingEndId ? 'Editar endereço' : 'Novo endereço'}
                      </h3>
                      <button onClick={fecharFormEndereco} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2 sm:w-1/2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Apelido (ex: Casa, Trabalho)</label>
                        <input value={endForm.apelido} onChange={(e) => setEndForm({ ...endForm, apelido: e.target.value })}
                          placeholder="Casa"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">CEP *</label>
                        <div className="relative">
                          <input
                            value={endForm.cep}
                            onChange={(e) => setEndForm({ ...endForm, cep: formatCep(e.target.value) })}
                            onBlur={(e) => buscarCep(e.target.value)}
                            placeholder="00000-000" maxLength={9}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {loadingCep ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Preenchimento automático ao sair do campo</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Rua / Logradouro *</label>
                        <input value={endForm.logradouro} onChange={(e) => setEndForm({ ...endForm, logradouro: e.target.value })}
                          placeholder="Nome da rua"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Número *</label>
                        <input value={endForm.numero} onChange={(e) => setEndForm({ ...endForm, numero: e.target.value })}
                          placeholder="123"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Complemento</label>
                        <input value={endForm.complemento} onChange={(e) => setEndForm({ ...endForm, complemento: e.target.value })}
                          placeholder="Apto, casa..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Bairro *</label>
                        <input value={endForm.bairro} onChange={(e) => setEndForm({ ...endForm, bairro: e.target.value })}
                          placeholder="Seu bairro"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Cidade *</label>
                        <input value={endForm.cidade} onChange={(e) => setEndForm({ ...endForm, cidade: e.target.value })}
                          placeholder="Sua cidade"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Estado *</label>
                        <select value={endForm.estado} onChange={(e) => setEndForm({ ...endForm, estado: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50">
                          <option value="">Selecione</option>
                          {UFs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button onClick={handleSaveEndereco} disabled={savingEnd || !endForm.cep || !endForm.logradouro || !endForm.numero || !endForm.bairro || !endForm.cidade || !endForm.estado}
                        className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
                        {savingEnd ? <><Loader2 size={13} className="animate-spin" /> Salvando...</> : <><Save size={13} /> Salvar endereço</>}
                      </button>
                      <button onClick={fecharFormEndereco} className="text-sm text-gray-500 hover:text-gray-700 px-3">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de endereços */}
                {loadingEnd ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-gray-300" />
                  </div>
                ) : enderecos.length === 0 && !showForm ? (
                  <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                    <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400 mb-1">Nenhum endereço salvo</p>
                    <p className="text-xs text-gray-400">Clique em "Adicionar endereço" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enderecos.map((end) => (
                      <div key={end.id} className={`bg-white rounded-xl border p-4 ${end.principal ? 'border-[#003E8A]/30 bg-[#003E8A]/2' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${end.principal ? 'bg-[#003E8A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                              <Home size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                {end.apelido && <p className="text-sm font-bold text-[#222]">{end.apelido}</p>}
                                {end.principal && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#003E8A] bg-[#003E8A]/10 px-2 py-0.5 rounded-full">
                                    <Star size={9} fill="currentColor" /> Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{end.logradouro}, {end.numero}{end.complemento ? `, ${end.complemento}` : ''}</p>
                              <p className="text-xs text-gray-400">{end.bairro} · {end.cidade}/{end.estado} · CEP {end.cep}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!end.principal && (
                              <button onClick={() => handleSetPrincipal(end.id)} title="Tornar principal"
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-yellow-50 text-gray-300 hover:text-yellow-500 transition-colors">
                                <Star size={13} />
                              </button>
                            )}
                            <button onClick={() => abrirFormEndereco(end)} title="Editar"
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-300 hover:text-[#003E8A] transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleExcluirEndereco(end.id)} title="Excluir"
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
