'use client'

import ShopLayout from '@/components/layout/ShopLayout'
import { useCart } from '@/context/CartContext'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Truck, ShieldCheck, CreditCard, Package } from 'lucide-react'
import Link from 'next/link'

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart()

  const shipping = total >= 299 ? 0 : 29.9
  const finalTotal = total + shipping

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="px-4 md:px-8 py-16 text-center">
          <ShoppingBag size={80} className="mx-auto mb-4 text-gray-200" />
          <h1 className="text-2xl font-black text-[#222] mb-2">Seu carrinho está vazio</h1>
          <p className="text-gray-500 mb-6">Adicione produtos para continuar comprando</p>
          <Link href="/produtos"
            className="inline-flex items-center gap-2 bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-3 px-6 rounded-xl transition-colors">
            <ArrowLeft size={15} /> Ver produtos
          </Link>
        </div>
      </ShopLayout>
    )
  }

  return (
    <ShopLayout>
      <div className="px-4 md:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#222]">Meu Carrinho</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count} {count === 1 ? 'item' : 'itens'}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items */}
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                  {item.imagem_url
                    ? <img src={item.imagem_url} alt={item.nome} className="w-full h-full object-cover" />
                    : <Package size={28} className="text-gray-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/produtos/${item.slug}`}>
                        <p className="font-semibold text-sm text-[#222] hover:text-[#003E8A] transition-colors line-clamp-2">{item.nome}</p>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantidade}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-black text-[#003E8A]">
                      R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/produtos" className="flex items-center gap-2 text-sm text-[#003E8A] font-semibold hover:gap-3 transition-all pt-2">
              <ArrowLeft size={14} /> Continuar comprando
            </Link>
          </div>

          {/* Resumo */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-black text-[#222] mb-4">Resumo do pedido</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({count} itens)</span>
                  <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frete estimado</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-[10px] text-green-600">Frete grátis para compras acima de R$ 299</p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between font-black text-[#222]">
                  <span>Total</span>
                  <span className="text-[#003E8A] text-lg">R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">em até 12x sem juros</p>
              </div>

              <Link href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-3.5 rounded-xl transition-colors text-sm mb-3">
                Finalizar Compra <ArrowRight size={15} />
              </Link>

              <div className="space-y-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck size={13} className="text-green-500" /> Compra 100% segura
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CreditCard size={13} className="text-[#003E8A]" /> Até 12x sem juros
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck size={13} className="text-[#003E8A]" /> Entrega para todo o Brasil
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
