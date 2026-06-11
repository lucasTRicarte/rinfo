'use client'

import { useRef } from 'react'
import { Plus, Trash2, Star } from 'lucide-react'

export type ImageItem = {
  id: string
  file?: File
  url: string
  preview: string
  principal: boolean
}

export function ImageUploader({
  value,
  onChange,
  single = false,
}: {
  value: ImageItem[]
  onChange: (items: ImageItem[]) => void
  single?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const novos: ImageItem[] = Array.from(files).map((file, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      file,
      url: '',
      preview: URL.createObjectURL(file),
      principal: false,
    }))
    if (single) {
      value.forEach((v) => { if (v.file) URL.revokeObjectURL(v.preview) })
      onChange([{ ...novos[0], principal: true }])
    } else {
      const merged = [...value, ...novos]
      if (!merged.some((v) => v.principal)) merged[0].principal = true
      onChange(merged)
    }
  }

  const remove = (id: string) => {
    const item = value.find((v) => v.id === id)
    if (item?.file) URL.revokeObjectURL(item.preview)
    const remaining = value.filter((v) => v.id !== id)
    if (remaining.length > 0 && !remaining.some((v) => v.principal)) remaining[0].principal = true
    onChange(remaining)
  }

  const setPrincipal = (id: string) => {
    onChange(value.map((v) => ({ ...v, principal: v.id === id })))
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((item) => (
            <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50">
              <img src={item.preview || item.url} alt="" className="w-full h-full object-cover" />
              {item.principal && (
                <span className="absolute top-1 left-1 bg-[#D4A63A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={8} className="fill-white" /> CAPA
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!item.principal && !single && (
                  <button type="button" onClick={() => setPrincipal(item.id)} title="Definir como capa"
                    className="w-7 h-7 bg-[#D4A63A] rounded-full flex items-center justify-center text-white">
                    <Star size={12} />
                  </button>
                )}
                <button type="button" onClick={() => remove(item.id)}
                  className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-5 text-sm text-gray-400 hover:border-[#003E8A] hover:text-[#003E8A] transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        {single
          ? value.length > 0 ? 'Trocar imagem' : 'Selecionar imagem'
          : 'Adicionar imagens'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple={!single} className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />
    </div>
  )
}
