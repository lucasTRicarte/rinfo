'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2, Save, Package } from 'lucide-react'
import { criarProduto } from '@/lib/admin/produtos'
import { listarCategoriasComFilhos } from '@/lib/admin/categorias'
import { ImageUploader, type ImageItem } from '@/components/admin/ImageUploader'
import { uploadImagem } from '@/lib/db/supabase/storage'
import type { Categoria } from '@/types/database'

type CategoriaComFilhos = Categoria & { filhos: Categoria[] }
type Spec = { chave: string; valor: string }

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-gray-50"
const sectionCls = "bg-white rounded-2xl border border-gray-100 p-6"

export default function NovoProdutoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState('')
  const [categorias, setCategorias] = useState<CategoriaComFilhos[]>([])

  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [descricaoCurta, setDescricaoCurta] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [precoOriginal, setPrecoOriginal] = useState('')
  const [badge, setBadge] = useState('')
  const [sku, setSku] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [estoque, setEstoque] = useState('0')
  const [dropshipping, setDropshipping] = useState(false)
  const [ativo, setAtivo] = useState(true)
  const [destaque, setDestaque] = useState(false)
  const [imagens, setImagens] = useState<ImageItem[]>([])
  const [pesoKg, setPesoKg] = useState('')
  const [alturaCm, setAlturaCm] = useState('')
  const [larguraCm, setLarguraCm] = useState('')
  const [comprimentoCm, setComprimentoCm] = useState('')
  const [specs, setSpecs] = useState<Spec[]>([{ chave: '', valor: '' }])

  useEffect(() => {
    listarCategoriasComFilhos().then((d) => setCategorias(d as CategoriaComFilhos[]))
  }, [])

  const handleNome = (v: string) => { setNome(v); if (!slug) setSlug(slugify(v)) }

  const addSpec = () => setSpecs((p) => [...p, { chave: '', valor: '' }])
  const removeSpec = (i: number) => setSpecs((p) => p.filter((_, idx) => idx !== i))
  const updateSpec = (i: number, field: 'chave' | 'valor', value: string) =>
    setSpecs((p) => p.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    startTransition(async () => {
      try {
        const imagensUpload = await Promise.all(
          imagens.map(async (img, i) => ({
            url: img.file ? await uploadImagem(img.file, 'produtos') : img.url,
            principal: img.principal,
            ordem: i,
          }))
        )
        const fd = new FormData()
        fd.set('nome', nome)
        fd.set('slug', slug)
        fd.set('descricao', descricao)
        fd.set('descricao_curta', descricaoCurta)
        fd.set('preco', preco)
        fd.set('preco_original', precoOriginal)
        fd.set('badge', badge)
        fd.set('sku', sku)
        fd.set('categoria_id', categoriaId)
        fd.set('estoque_fisico', estoque)
        fd.set('dropshipping', String(dropshipping))
        fd.set('ativo', String(ativo))
        fd.set('destaque', String(destaque))
        fd.set('imagens_json', JSON.stringify(imagensUpload))
        fd.set('peso_kg', pesoKg)
        fd.set('altura_cm', alturaCm)
        fd.set('largura_cm', larguraCm)
        fd.set('comprimento_cm', comprimentoCm)
        fd.set('specs', JSON.stringify(specs.filter((s) => s.chave && s.valor)))
        const result = await criarProduto(fd)
        if (result?.error) { setErro(result.error); return }
        router.push('/admin/produtos')
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro inesperado ao salvar produto')
      }
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/produtos" className="text-gray-400 hover:text-[#003E8A] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#222]">Novo produto</h1>
          <p className="text-sm text-gray-500">Preencha os dados do produto</p>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{erro}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Informações básicas */}
        <div className={sectionCls}>
          <h2 className="font-black text-[#222] mb-4 flex items-center gap-2"><Package size={16} className="text-[#D4A63A]" /> Informações básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Nome do produto" required>
                <input value={nome} onChange={(e) => handleNome(e.target.value)} required placeholder="Ex: Notebook Dell Inspiron 15" className={inputCls} />
              </Field>
            </div>
            <Field label="Slug (URL)" required>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="notebook-dell-inspiron-15" className={`${inputCls} font-mono text-xs`} />
            </Field>
            <Field label="SKU / Código">
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-001" className={inputCls} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Descrição curta">
                <textarea value={descricaoCurta} onChange={(e) => setDescricaoCurta(e.target.value)} rows={2} placeholder="Resumo em 1-2 frases para exibir nos cards" className={`${inputCls} resize-none`} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Descrição completa">
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Descrição detalhada do produto..." className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </div>

        {/* Preços e badge */}
        <div className={sectionCls}>
          <h2 className="font-black text-[#222] mb-4">Preços e destaque</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Preço atual (R$)" required>
              <input type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} required placeholder="0,00" className={inputCls} />
            </Field>
            <Field label="Preço original (R$)">
              <input type="number" step="0.01" min="0" value={precoOriginal} onChange={(e) => setPrecoOriginal(e.target.value)} placeholder="0,00" className={inputCls} />
            </Field>
            <div className="col-span-2">
              <Field label="Badge de destaque">
                <select value={badge} onChange={(e) => setBadge(e.target.value)} className={inputCls}>
                  <option value="">Sem badge</option>
                  <option value="MAIS VENDIDO">MAIS VENDIDO</option>
                  <option value="PROMOÇÃO">PROMOÇÃO</option>
                  <option value="NOVO">NOVO</option>
                </select>
              </Field>
            </div>
          </div>
          {precoOriginal && preco && Number(precoOriginal) > Number(preco) && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Desconto de {Math.round((1 - Number(preco) / Number(precoOriginal)) * 100)}% em relação ao preço original
            </p>
          )}
        </div>

        {/* Categoria e estoque */}
        <div className={sectionCls}>
          <h2 className="font-black text-[#222] mb-4">Categoria e estoque</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Field label="Categoria">
                <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputCls}>
                  <option value="">Sem categoria</option>
                  {categorias.map((cat) => (
                    <React.Fragment key={cat.id}>
                      <option value={cat.id}>{cat.nome}</option>
                      {cat.filhos.map((sub) => (
                        <option key={sub.id} value={sub.id}>　↳ {sub.nome}</option>
                      ))}
                    </React.Fragment>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Estoque físico">
              <input type="number" min="0" value={estoque} onChange={(e) => setEstoque(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={dropshipping} onChange={(e) => setDropshipping(e.target.checked)} className="w-4 h-4 accent-[#003E8A]" />
              <span className="text-sm text-gray-600">Produto dropshipping (sem estoque físico)</span>
            </label>
          </div>
        </div>

        {/* Especificações técnicas */}
        <div className={sectionCls}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[#222]">Especificações técnicas</h2>
            <button type="button" onClick={addSpec} className="text-sm text-[#003E8A] font-semibold flex items-center gap-1 hover:underline">
              <Plus size={13} /> Adicionar linha
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input value={spec.chave} onChange={(e) => updateSpec(i, 'chave', e.target.value)} placeholder="Chave (ex: Processador)" className={`${inputCls} flex-1`} />
                <input value={spec.valor} onChange={(e) => updateSpec(i, 'valor', e.target.value)} placeholder="Valor (ex: Intel Core i7-1255U)" className={`${inputCls} flex-1`} />
                <button type="button" onClick={() => removeSpec(i)} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Imagem e dimensões */}
        <div className={sectionCls}>
          <h2 className="font-black text-[#222] mb-4">Imagens e dimensões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Imagens do produto">
                <ImageUploader value={imagens} onChange={setImagens} />
              </Field>
            </div>
            <Field label="Peso (kg)">
              <input type="number" step="0.001" min="0" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} placeholder="0.000" className={inputCls} />
            </Field>
            <Field label="Altura (cm)">
              <input type="number" step="0.1" min="0" value={alturaCm} onChange={(e) => setAlturaCm(e.target.value)} placeholder="0.0" className={inputCls} />
            </Field>
            <Field label="Largura (cm)">
              <input type="number" step="0.1" min="0" value={larguraCm} onChange={(e) => setLarguraCm(e.target.value)} placeholder="0.0" className={inputCls} />
            </Field>
            <Field label="Comprimento (cm)">
              <input type="number" step="0.1" min="0" value={comprimentoCm} onChange={(e) => setComprimentoCm(e.target.value)} placeholder="0.0" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Visibilidade */}
        <div className={sectionCls}>
          <h2 className="font-black text-[#222] mb-4">Visibilidade</h2>
          <div className="flex flex-col gap-3">
            {[
              { state: ativo, set: setAtivo, label: 'Produto ativo', sub: 'Visível na loja para clientes' },
              { state: destaque, set: setDestaque, label: 'Produto em destaque', sub: 'Exibido na seção de destaques da home' },
            ].map(({ state, set, label, sub }) => (
              <label key={label} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-[#222]">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" checked={state} onChange={(e) => set(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 peer-checked:bg-[#003E8A] rounded-full transition-colors peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform" />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 sticky bottom-4">
          <Link href="/admin/produtos" className="flex-1 flex items-center justify-center border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 bg-white">
            Cancelar
          </Link>
          <button type="submit" disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-lg"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isPending ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
