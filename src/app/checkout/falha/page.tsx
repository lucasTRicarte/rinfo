'use client'

import ShopLayout from '@/components/layout/ShopLayout'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutFalhaPage() {
  return (
    <ShopLayout>
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle size={40} className="text-red-500" />
          </div>

          <h1 className="text-2xl font-black text-[#222] mb-2">Pagamento não aprovado</h1>
          <p className="text-gray-500 text-sm mb-2">
            Não foi possível processar o seu pagamento.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Verifique os dados do cartão ou tente outro método de pagamento. O pedido foi salvo como pendente em sua conta.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/carrinho"
              className="flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors">
              <RefreshCw size={15} /> Tentar novamente
            </Link>
            <Link href="/conta"
              className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-semibold py-3 px-6 rounded-xl text-sm hover:border-[#003E8A] transition-colors">
              <ArrowLeft size={14} /> Meus pedidos
            </Link>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
