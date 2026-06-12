'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Tag, Plus, Trash2, Loader2, CheckCircle, XCircle, Edit2, X, Save,
  Calendar, TrendingDown, Users, Layers,
} from 'lucide-react'
import {
  listarCupons, criarCupom, atualizarCupom, excluirCupom,
} from '@/lib/loja/cupons'
import type { Cupom } from '@/lib/loja/cupons'
import { listarCategoriasPublicas } from '@/lib/loja/categorias'
import type { CategoriaPublica } from '@/lib/loja/categorias'

type FormCupom = {
  codigo: string
  desconto_tipo: 'percentual' | 'fixo'
  desconto_valor: string
  valido_ate: string
  uso_maximo: string
  valor_minimo: string
  ativo: boolean
  categoria_ids: string[]
  uso_por_perfil: boolean
}

const FORM_VAZIO: FormCupom = {
  codigo: '', desconto_tipo: 'percentual', desconto_valor: '',
  valido_ate: '', uso_maximo: '', valor_minimo: '', ativo: true,
  categoria_ids: [], uso_por_perfil: false,
}

function CupomForm({
  initial, categorias, onSave, onCancel, loading,
}: {
  initial?: FormCupom
  categorias: CategoriaPublica[]
  onSave: (f: FormCupom) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<FormCupom>(initial ?? FORM_VAZIO)
  const f = (k: keyof FormCupom, v: string | boolean | string[]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const toggleCat = (id: string) =>
    setForm((p) => ({
      ...p,
      categoria_ids: p.categoria_ids.includes(id)
        ? p.categoria_ids.filter((c) => c !== id)
        : [...p.categoria_ids, id],
    }))

  return (
    <div className="bg-white rounded-2xl border border-[#003E8A]/20 p-5 mb-5 shadow-sm">
      <h3 className="font-bold text-[#222] mb-4">{initial ? 'Editar cupom' : 'Novo cupom'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Código *</label>
          <input value={form.codigo} onChange={(e) => f('codigo', e.target.value.toUpperCase())}
            placeholder="PROMO10"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-[#003E8A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de desconto *</label>
          <select value={form.desconto_tipo} onChange={(e) => f('desconto_tipo', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A] bg-white">
            <option value="percentual">Percentual (%)</option>
            <option value="fixo">Valor fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {form.desconto_tipo === 'percentual' ? 'Desconto (%)' : 'Desconto (R$)'} *
          </label>
          <input type="number" value={form.desconto_valor}
            onChange={(e) => f('desconto_valor', e.target.value)}
            placeholder={form.desconto_tipo === 'percentual' ? '10' : '50.00'}
            min={0} step={form.desconto_tipo === 'percentual' ? 1 : 0.01}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Válido até</label>
          <input type="date" value={form.valido_ate} onChange={(e) => f('valido_ate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Usos máximos (total)</label>
          <input type="number" value={form.uso_maximo} onChange={(e) => f('uso_maximo', e.target.value)}
            placeholder="Ilimitado" min={1} step={1}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Valor mínimo (R$)</label>
          <input type="number" value={form.valor_minimo} onChange={(e) => f('valor_minimo', e.target.value)}
            placeholder="Sem mínimo" min={0} step={0.01}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003E8A]" />
        </div>
      </div>

      {/* Restrição de categorias */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={14} className="text-[#D4A63A]" />
          <label className="text-xs font-semibold text-gray-700">
            Restringir a categorias
          </label>
          <span className="text-[10px] text-gray-400 ml-1">
            {form.categoria_ids.length === 0 ? '(sem restrição — vale para todas)' : `${form.categoria_ids.length} selecionada${form.categoria_ids.length > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
          {categorias.map((cat) => (
            <label key={cat.slug} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${
              form.categoria_ids.includes(cat.id)
                ? 'border-[#003E8A] bg-[#003E8A]/5 text-[#003E8A] font-semibold'
                : 'border-gray-100 text-gray-600 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                className="accent-[#003E8A] flex-shrink-0"
                checked={form.categoria_ids.includes(cat.id)}
                onChange={() => toggleCat(cat.id)}
              />
              {cat.nome}
            </label>
          ))}
        </div>
        {form.categoria_ids.length > 0 && (
          <button onClick={() => f('categoria_ids', [])}
            className="mt-2 text-[11px] text-red-400 hover:text-red-600 flex items-center gap-1">
            <X size={10} /> Remover restrição de categoria
          </button>
        )}
      </div>

      {/* Controles extras */}
      <div className="mt-4 border-t border-gray-100 pt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.uso_por_perfil}
            onChange={(e) => f('uso_por_perfil', e.target.checked)}
            className="accent-[#003E8A] w-4 h-4" />
          <div>
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Users size={12} className="text-[#003E8A]" /> 1 uso por conta
            </p>
            <p className="text-[10px] text-gray-400">Cada cliente usa apenas uma vez</p>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.ativo}
            onChange={(e) => f('ativo', e.target.checked)}
            className="accent-[#003E8A] w-4 h-4" />
          <div>
            <p className="text-xs font-semibold text-gray-700">Ativo</p>
            <p className="text-[10px] text-gray-400">Disponível para uso</p>
          </div>
        </label>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={() => onSave(form)} disabled={loading || !form.codigo || !form.desconto_valor}
          className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {initial ? 'Salvar alterações' : 'Criar cupom'}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

export default function AdminCuponsPage() {
  const [cupons, setCupons]           = useState<Cupom[]>([])
  const [categorias, setCategorias]   = useState<CategoriaPublica[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editando, setEditando]       = useState<Cupom | null>(null)
  const [formErro, setFormErro]       = useState('')
  const [isPending, startTransition]  = useTransition()

  const carregar = () => {
    setLoading(true)
    listarCupons().then((data) => { setCupons(data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => {
    carregar()
    listarCategoriasPublicas().then(setCategorias)
  }, [])

  // Mapa id → nome para exibição
  const catNome: Record<string, string> = {}
  for (const c of categorias) if (c.id) catNome[c.id] = c.nome

  const handleCriar = (form: FormCupom) => {
    setFormErro('')
    startTransition(async () => {
      const res = await criarCupom({
        codigo: form.codigo,
        desconto_tipo: form.desconto_tipo,
        desconto_valor: parseFloat(form.desconto_valor),
        valido_ate: form.valido_ate || null,
        uso_maximo: form.uso_maximo ? parseInt(form.uso_maximo) : null,
        valor_minimo: form.valor_minimo ? parseFloat(form.valor_minimo) : null,
        categoria_ids: form.categoria_ids.length ? form.categoria_ids : null,
        uso_por_perfil: form.uso_por_perfil,
      })
      if (res.error) { setFormErro(res.error); return }
      setShowForm(false)
      carregar()
    })
  }

  const handleEditar = (form: FormCupom) => {
    if (!editando) return
    setFormErro('')
    startTransition(async () => {
      const res = await atualizarCupom(editando.id, {
        codigo: form.codigo,
        desconto_tipo: form.desconto_tipo,
        desconto_valor: parseFloat(form.desconto_valor),
        valido_ate: form.valido_ate || null,
        uso_maximo: form.uso_maximo ? parseInt(form.uso_maximo) : null,
        valor_minimo: form.valor_minimo ? parseFloat(form.valor_minimo) : null,
        categoria_ids: form.categoria_ids.length ? form.categoria_ids : null,
        uso_por_perfil: form.uso_por_perfil,
        ativo: form.ativo,
      })
      if (res.error) { setFormErro(res.error); return }
      setEditando(null)
      carregar()
    })
  }

  const handleExcluir = (id: string) =>
    startTransition(async () => { await excluirCupom(id); carregar() })

  const handleToggleAtivo = (cupom: Cupom) =>
    startTransition(async () => { await atualizarCupom(cupom.id, { ativo: !cupom.ativo }); carregar() })

  const agora = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#222] flex items-center gap-2">
            <Tag size={22} className="text-[#D4A63A]" /> Cupons de Desconto
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cupons.length} {cupons.length !== 1 ? 'cupons' : 'cupom'} cadastrado{cupons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditando(null); setFormErro('') }}
          className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus size={15} /> Novo Cupom
        </button>
      </div>

      {(showForm && !editando) && (
        <CupomForm
          categorias={categorias}
          onSave={handleCriar}
          onCancel={() => { setShowForm(false); setFormErro('') }}
          loading={isPending}
        />
      )}

      {formErro && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {formErro}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : cupons.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Tag size={40} className="mx-auto mb-2 opacity-30" />
          <p className="font-medium">Nenhum cupom cadastrado ainda</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-[#003E8A] hover:underline font-semibold">
            Criar primeiro cupom
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cupons.map((cupom) => {
            const expirado = cupom.valido_ate ? cupom.valido_ate < agora : false
            const esgotado = cupom.uso_maximo !== null && cupom.uso_atual >= cupom.uso_maximo

            return editando?.id === cupom.id ? (
              <CupomForm
                key={cupom.id}
                categorias={categorias}
                initial={{
                  codigo: cupom.codigo,
                  desconto_tipo: cupom.desconto_tipo,
                  desconto_valor: String(cupom.desconto_valor),
                  valido_ate: cupom.valido_ate ?? '',
                  uso_maximo: cupom.uso_maximo !== null ? String(cupom.uso_maximo) : '',
                  valor_minimo: cupom.valor_minimo !== null ? String(cupom.valor_minimo) : '',
                  ativo: cupom.ativo,
                  categoria_ids: cupom.categoria_ids ?? [],
                  uso_por_perfil: cupom.uso_por_perfil,
                }}
                onSave={handleEditar}
                onCancel={() => { setEditando(null); setFormErro('') }}
                loading={isPending}
              />
            ) : (
              <div key={cupom.id}
                className={`bg-white rounded-2xl border p-5 ${!cupom.ativo || expirado || esgotado ? 'opacity-70' : ''} border-gray-100`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono font-black text-lg text-[#003E8A] tracking-widest">{cupom.codigo}</span>
                      <span className="bg-[#D4A63A]/10 text-[#D4A63A] border border-[#D4A63A]/20 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingDown size={10} />
                        {cupom.desconto_tipo === 'percentual'
                          ? `${cupom.desconto_valor}% OFF`
                          : `R$ ${cupom.desconto_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} OFF`}
                      </span>
                      {!cupom.ativo
                        ? <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">INATIVO</span>
                        : expirado
                          ? <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">EXPIRADO</span>
                          : esgotado
                            ? <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">ESGOTADO</span>
                            : <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">ATIVO</span>}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mb-1.5">
                      <span>Usos: <strong className="text-gray-600">{cupom.uso_atual}{cupom.uso_maximo !== null ? ` / ${cupom.uso_maximo}` : ''}</strong></span>
                      {cupom.valor_minimo !== null && (
                        <span>Mín: <strong className="text-gray-600">R$ {cupom.valor_minimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                      )}
                      {cupom.valido_ate && (
                        <span className={`flex items-center gap-1 ${expirado ? 'text-red-400' : ''}`}>
                          <Calendar size={10} />
                          Até {new Date(cupom.valido_ate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {/* Badges de restrições */}
                    <div className="flex flex-wrap gap-1.5">
                      {cupom.uso_por_perfil && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                          <Users size={9} /> 1 uso/conta
                        </span>
                      )}
                      {cupom.categoria_ids && cupom.categoria_ids.length > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">
                          <Layers size={9} />
                          {cupom.categoria_ids.map((id) => catNome[id] ?? id).join(', ')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Todas as categorias</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggleAtivo(cupom)} disabled={isPending}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        cupom.ativo
                          ? 'text-orange-700 bg-orange-50 hover:bg-orange-100'
                          : 'text-green-700 bg-green-50 hover:bg-green-100'
                      }`}>
                      {cupom.ativo ? <><XCircle size={13} /> Desativar</> : <><CheckCircle size={13} /> Ativar</>}
                    </button>
                    <button
                      onClick={() => { setEditando(cupom); setShowForm(false); setFormErro('') }}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#003E8A] bg-[#003E8A]/5 hover:bg-[#003E8A]/10 px-3 py-1.5 rounded-lg transition-colors">
                      <Edit2 size={13} /> Editar
                    </button>
                    <button onClick={() => handleExcluir(cupom.id)} disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Trash2 size={13} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
