import Link from 'next/link'
import { Truck, Plus } from 'lucide-react'

export default function FornecedoresPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#222]">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie seus fornecedores e distribuidores</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-2.5 px-4 rounded-xl text-sm">
          <Plus size={15} /> Novo fornecedor
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Truck size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="font-bold text-gray-400 mb-1">Módulo em construção</p>
        <p className="text-sm text-gray-400 mb-5">Cadastro de fornecedores será disponibilizado em breve.</p>
        <Link href="/admin" className="text-sm text-[#003E8A] font-semibold hover:underline">← Voltar ao dashboard</Link>
      </div>
    </div>
  )
}
