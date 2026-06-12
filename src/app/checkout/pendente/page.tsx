'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { Clock, Package } from 'lucide-react'
import Link from 'next/link'

function PendenteContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')

  return (
    <div className="px-4 md:px-8 py-16">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={40} className="text-yellow-500" />
        </div>

        <h1 className="text-2xl font-black text-[#222] mb-2">Pagamento pendente</h1>
        <p className="text-gray-500 text-sm mb-2">
          Seu pedido foi criado! O pagamento ainda está sendo processado.
        </p>
        <p className="text-gray-400 text-xs mb-6">
          Se você escolheu boleto, pague até a data de vencimento. Para PIX, aguarde a confirmação automática.
        </p>

        {paymentId && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
            <p className="text-xs text-yellow-700 font-semibold">ID do pagamento: {paymentId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/conta"
            className="flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors">
            <Package size={15} /> Meus pedidos
          </Link>
          <Link href="/"
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-semibold py-3 px-6 rounded-xl text-sm hover:border-[#003E8A] transition-colors">
            Ir ao início
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPendentePage() {
  return (
    <ShopLayout>
      <Suspense fallback={<div className="py-16 text-center text-gray-400">Carregando...</div>}>
        <PendenteContent />
      </Suspense>
    </ShopLayout>
  )
}
