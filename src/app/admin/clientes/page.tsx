'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/db/supabase/client'

type Perfil = {
  id: string; nome: string | null; telefone: string | null
  role: string; criado_em: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('perfis')
      .select('id, nome, telefone, role, criado_em')
      .eq('role', 'cliente')
      .order('criado_em', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error) setClientes((data ?? []) as Perfil[])
        setLoading(false)
      })
  }, [])

  const filtrados = clientes.filter((c) => {
    if (!busca) return true
    const q = busca.toLowerCase()
    return (c.nome ?? '').toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#222]">Clientes</h1>
        <p className="text-sm text-gray-500 mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">{busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 hidden sm:table-cell">Telefone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 hidden md:table-cell">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#003E8A]/10 rounded-full flex items-center justify-center text-[#003E8A] font-black text-sm flex-shrink-0">
                        {(c.nome ?? '?')[0].toUpperCase()}
                      </div>
                      <p className="font-semibold text-[#222] text-sm">{c.nome ?? '(sem nome)'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-gray-500">{c.telefone ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">{new Date(c.criado_em).toLocaleDateString('pt-BR')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
