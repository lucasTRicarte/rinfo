'use client'

import Link from 'next/link'
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={closeCart} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#002C63]">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart size={18} />
            <span className="font-bold text-sm">Carrinho ({count})</span>
          </div>
          <button onClick={closeCart} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingCart size={48} className="text-gray-200" />
              <p className="text-gray-500 text-sm font-medium">Seu carrinho está vazio</p>
              <button onClick={closeCart} className="text-[#003E8A] text-sm font-semibold hover:underline">
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                    {item.imagem_url
                      ? <img src={item.imagem_url} alt={item.nome} className="w-full h-full object-cover" />
                      : <Package size={22} className="text-gray-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#222] leading-tight line-clamp-2 mb-1">{item.nome}</p>
                    <p className="text-sm font-black text-[#003E8A]">
                      R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                        <Minus size={10} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantidade}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                        <Plus size={10} />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal ({count} {count === 1 ? 'item' : 'itens'})</span>
              <span className="font-black text-[#003E8A] text-lg">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Frete calculado no checkout</p>
            <Link href="/checkout" onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full bg-[#003E8A] hover:bg-[#002C63] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
              Finalizar Compra <ArrowRight size={15} />
            </Link>
            <Link href="/carrinho" onClick={closeCart}
              className="flex items-center justify-center w-full border border-gray-200 hover:border-[#003E8A] text-gray-600 hover:text-[#003E8A] font-semibold py-2.5 rounded-xl transition-colors text-sm">
              Ver carrinho completo
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
