'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CheckoutSucessoPage() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()

  const externalReference = searchParams.get('external_reference')
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <ShopLayout>
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>

          <h1 className="text-2xl font-black text-[#222] mb-2">Pagamento confirmado!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Seu pedido foi recebido e o pagamento aprovado. Em breve você receberá atualizações por e-mail.
          </p>

          {paymentId && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
              {externalReference && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pedido ID</span>
                  <span className="font-mono text-xs text-[#003E8A] font-semibold">{externalReference.slice(0, 8)}...</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ID do pagamento</span>
                <span className="font-mono text-xs font-semibold">{paymentId}</span>
              </div>
              {status && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-semibold capitalize">{status}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/conta"
              className="flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors">
              <Package size={15} /> Meus pedidos
            </Link>
            <Link href="/produtos"
              className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-semibold py-3 px-6 rounded-xl text-sm hover:border-[#003E8A] transition-colors">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
