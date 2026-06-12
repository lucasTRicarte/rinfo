'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquare, Filter,
} from 'lucide-react'
import {
  listarTodasAvaliacoes, aprovarAvaliacao, reprovarAvaliacao, excluirAvaliacao,
} from '@/lib/loja/avaliacoes'
import type { Avaliacao } from '@/lib/loja/avaliacoes'

type AvaliacaoAdmin = Avaliacao & { produto_nome: string }

const filtros = [
  { value: 'todos',      label: 'Todas' },
  { value: 'aprovado',   label: 'Aprovadas' },
  { value: 'reprovado',  label: 'Reprovadas' },
]

export default function AdminAvaliacoesPage() {
  const [avaliacoes, setAvaliacoes]   = useState<AvaliacaoAdmin[]>([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [filtro, setFiltro]           = useState<'todos' | 'aprovado' | 'reprovado'>('todos')
  const [isPending, startTransition]  = useTransition()

  const carregar = (f: typeof filtro = filtro) => {
    setLoading(true)
    listarTodasAvaliacoes({
      aprovado: f === 'todos' ? undefined : f === 'aprovado',
      por_pagina: 50,
    }).then(({ avaliacoes: data, total: t }) => {
      setAvaliacoes(data as AvaliacaoAdmin[])
      setTotal(t)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [filtro])

  const handleAprovar = (id: string) =>
    startTransition(async () => { await aprovarAvaliacao(id); carregar() })

  const handleReprovar = (id: string) =>
    startTransition(async () => { await reprovarAvaliacao(id); carregar() })

  const handleExcluir = (id: string) =>
    startTransition(async () => { await excluirAvaliacao(id); carregar() })

  const aprovadas  = avaliacoes.filter((a) => a.aprovado).length
  const reprovadas = avaliacoes.filter((a) => !a.aprovado).length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#222] flex items-center gap-2">
            <MessageSquare size={22} className="text-[#D4A63A]" /> Avaliações de Produtos
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} avaliação{total !== 1 ? 'ões' : ''} · {aprovadas} aprovadas · {reprovadas} reprovadas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filtros.map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value as typeof filtro)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
              filtro === f.value
                ? 'bg-[#003E8A] text-white border-[#003E8A]'
                : 'border-gray-200 text-gray-600 hover:border-[#003E8A] hover:text-[#003E8A] bg-white'
            }`}>
            <Filter size={12} /> {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : avaliacoes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <MessageSquare size={40} className="mx-auto mb-2 opacity-30" />
          <p className="font-medium">Nenhuma avaliação encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map((av) => (
            <div key={av.id} className={`bg-white rounded-2xl border p-5 ${av.aprovado ? 'border-gray-100' : 'border-orange-100 bg-orange-50/30'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < av.nota ? 'fill-[#D4A63A] text-[#D4A63A]' : 'fill-gray-200 text-gray-200'} />
                      ))}
                    </div>
                    {av.titulo && <span className="text-sm font-bold text-[#222]">{av.titulo}</span>}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${av.aprovado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {av.aprovado ? 'APROVADA' : 'REPROVADA'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">{av.comentario}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="font-semibold text-gray-600">{av.perfil_nome}</span>
                    <span>·</span>
                    <span className="text-[#003E8A] font-medium">{av.produto_nome}</span>
                    <span>·</span>
                    <span>{new Date(av.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!av.aprovado ? (
                    <button
                      onClick={() => handleAprovar(av.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
                      <CheckCircle size={13} /> Aprovar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReprovar(av.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-colors">
                      <XCircle size={13} /> Reprovar
                    </button>
                  )}
                  <button
                    onClick={() => handleExcluir(av.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
