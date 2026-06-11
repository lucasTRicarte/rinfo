'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Plus, Edit2, Trash2, ChevronRight, Layers,
  Eye, EyeOff, Check, X, Loader2,
} from 'lucide-react'
import {
  listarCategoriasComFilhos,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
  toggleCategoriaAtivo,
} from '@/lib/admin/categorias'
import { ImageUploader, type ImageItem } from '@/components/admin/ImageUploader'
import { uploadImagem } from '@/lib/db/supabase/storage'
import type { Categoria } from '@/types/database'

type CategoriaComFilhos = Categoria & { filhos: Categoria[] }

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function ModalCategoria({
  item,
  categoriasRaiz,
  onClose,
  onSave,
}: {
  item: Categoria | null
  categoriasRaiz: Categoria[]
  onClose: () => void
  onSave: (formData: FormData) => Promise<void>
}) {
  const [nome, setNome] = useState(item?.nome ?? '')
  const [slug, setSlug] = useState(item?.slug ?? '')
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [imagens, setImagens] = useState<ImageItem[]>(
    item?.imagem_url
      ? [{ id: 'existing', url: item.imagem_url, preview: item.imagem_url, principal: true }]
      : []
  )
  const [paiId, setPaiId] = useState(item?.pai_id ?? '')
  const [ativo, setAtivo] = useState(item?.ativo ?? true)
  const [ordem, setOrdem] = useState(item?.ordem ?? 0)
  const [isPending, startTransition] = useTransition()

  const handleNomeChange = (v: string) => {
    setNome(v)
    if (!item) setSlug(slugify(v))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      let imagemUrl = imagens[0]?.url ?? ''
      if (imagens[0]?.file) {
        imagemUrl = await uploadImagem(imagens[0].file, 'categorias')
      }
      const fd = new FormData()
      fd.set('nome', nome)
      fd.set('slug', slug)
      fd.set('descricao', descricao)
      fd.set('imagem_url', imagemUrl)
      fd.set('pai_id', paiId)
      fd.set('ativo', String(ativo))
      fd.set('ordem', String(ordem))
      await onSave(fd)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-[#222]">{item ? 'Editar categoria' : 'Nova categoria'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nome *</label>
              <input value={nome} onChange={(e) => handleNomeChange(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
                placeholder="Ex: Notebooks Gaming"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Slug *</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#003E8A] bg-gray-50"
                placeholder="notebooks-gaming"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50 resize-none"
                placeholder="Descrição opcional"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria pai</label>
              <select value={paiId} onChange={(e) => setPaiId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
              >
                <option value="">Nenhuma (categoria raiz)</option>
                {categoriasRaiz.filter((c) => c.id !== item?.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ordem</label>
              <input type="number" value={ordem} onChange={(e) => setOrdem(Number(e.target.value))} min={0}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Imagem</label>
              <ImageUploader value={imagens} onChange={setImagens} single />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-checked:bg-[#003E8A] rounded-full transition-colors peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform" />
              </label>
              <span className="text-sm text-gray-600">Categoria ativa (visível na loja)</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {item ? 'Salvar alterações' : 'Criar categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategoriasPage() {
  const [arvore, setArvore] = useState<CategoriaComFilhos[]>([])
  const [loading, setLoading] = useState(true)
  const [modalItem, setModalItem] = useState<Categoria | null | undefined>(undefined)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const carregar = () => {
    setLoading(true)
    listarCategoriasComFilhos().then((d) => { setArvore(d as CategoriaComFilhos[]); setLoading(false) })
  }

  useEffect(() => { carregar() }, [])

  const raizes = arvore.map((c) => ({ id: c.id, nome: c.nome, slug: c.slug, descricao: c.descricao, imagem_url: c.imagem_url, pai_id: c.pai_id, ativo: c.ativo, ordem: c.ordem }))

  const handleToggle = (id: string) => setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleToggleAtivo = (id: string, ativo: boolean) => {
    startTransition(async () => { await toggleCategoriaAtivo(id, ativo); carregar() })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Excluir esta categoria permanentemente? Produtos vinculados ficarão sem categoria.')) return
    startTransition(async () => { await excluirCategoria(id); carregar() })
  }

  const handleSave = async (formData: FormData) => {
    if (modalItem?.id) {
      await atualizarCategoria(modalItem.id, formData)
    } else {
      await criarCategoria(formData)
    }
    carregar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#222]">Categorias</h1>
          <p className="text-sm text-gray-500 mt-0.5">{arvore.length} categorias raiz · {arvore.reduce((s, c) => s + c.filhos.length, 0)} subcategorias</p>
        </div>
        <button
          type="button"
          onClick={() => setModalItem(null)}
          className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-2.5 px-4 rounded-xl text-sm"
        >
          <Plus size={15} /> Nova categoria
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={32} className="animate-spin text-gray-300" /></div>
      ) : (
        <div className="space-y-3">
          {arvore.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Categoria raiz */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <button type="button" onClick={() => handleToggle(cat.id)} className="text-gray-400 hover:text-[#003E8A]">
                  <ChevronRight size={16} className={`transition-transform ${expanded.has(cat.id) ? 'rotate-90' : ''}`} />
                </button>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <Layers size={15} className="text-[#D4A63A] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#222]">{cat.nome}</p>
                      <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                      {cat.filhos.length > 0 && (
                        <span className="text-[10px] bg-[#003E8A]/10 text-[#003E8A] px-1.5 py-0.5 rounded-full font-semibold">
                          {cat.filhos.length} subcats
                        </span>
                      )}
                    </div>
                    {cat.descricao && <p className="text-xs text-gray-400 truncate mt-0.5">{cat.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => handleToggleAtivo(cat.id, !cat.ativo)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${cat.ativo ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-50'}`}
                    title={cat.ativo ? 'Ativa — clique para desativar' : 'Inativa — clique para ativar'}
                  >
                    {cat.ativo ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button type="button" onClick={() => setModalItem(cat)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#003E8A]">
                    <Edit2 size={13} />
                  </button>
                  <button type="button" onClick={() => handleDelete(cat.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Subcategorias */}
              {expanded.has(cat.id) && cat.filhos.length > 0 && (
                <div className="border-t border-gray-50">
                  {cat.filhos.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 px-4 py-3 bg-gray-50/60 border-b border-gray-50 last:border-0">
                      <div className="w-4" />
                      <div className="w-3 h-3 border-l-2 border-b-2 border-gray-200 flex-shrink-0" />
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <p className="text-sm text-[#222]">{sub.nome}</p>
                        <span className="text-xs text-gray-400 font-mono">{sub.slug}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleToggleAtivo(sub.id, !sub.ativo)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${sub.ativo ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-50'}`}
                        >
                          {sub.ativo ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button type="button" onClick={() => setModalItem(sub)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#003E8A]">
                          <Edit2 size={12} />
                        </button>
                        <button type="button" onClick={() => handleDelete(sub.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 bg-gray-50/60">
                    <button type="button" onClick={() => setModalItem(null)}
                      className="text-xs text-[#003E8A] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus size={11} /> Adicionar subcategoria em &quot;{cat.nome}&quot;
                    </button>
                  </div>
                </div>
              )}

              {expanded.has(cat.id) && cat.filhos.length === 0 && (
                <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/60 text-center">
                  <button type="button" onClick={() => setModalItem(null)}
                    className="text-xs text-[#003E8A] font-semibold hover:underline flex items-center gap-1 mx-auto"
                  >
                    <Plus size={11} /> Adicionar subcategoria
                  </button>
                </div>
              )}
            </div>
          ))}

          {arvore.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Layers size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 mb-3">Nenhuma categoria cadastrada</p>
              <button type="button" onClick={() => setModalItem(null)} className="text-sm text-[#003E8A] font-bold hover:underline">
                Criar primeira categoria
              </button>
            </div>
          )}
        </div>
      )}

      {modalItem !== undefined && (
        <ModalCategoria
          item={modalItem}
          categoriasRaiz={raizes}
          onClose={() => setModalItem(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
