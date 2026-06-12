'use client'

import { useState, useTransition } from 'react'
import ShopLayout from '@/components/layout/ShopLayout'
import { useCart } from '@/context/CartContext'
import { iniciarCheckout } from '@/lib/loja/pedidos'
import { createClient } from '@/lib/db/supabase/client'
import { ArrowLeft, ArrowRight, MapPin, CreditCard, CheckCircle, Truck, ShieldCheck, Lock, Package, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type Step = 'endereco' | 'pagamento'

const steps: { id: Step; label: string }[] = [
  { id: 'endereco', label: 'Endereço' },
  { id: 'pagamento', label: 'Pagamento' },
]

export default function CheckoutPage() {
  const { items, total } = useCart()
  const [step, setStep] = useState<Step>('endereco')
  const [address, setAddress] = useState({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' })
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  const shipping = total >= 299 ? 0 : 29.9
  const finalTotal = total + shipping

  const stepIndex = steps.findIndex((s) => s.id === step)

  const handleCheckout = () => {
    setErro('')
    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setErro('Você precisa estar logado para finalizar a compra.')
        return
      }

      const result = await iniciarCheckout({
        itens: items.map((item) => ({
          produto_id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
        })),
        endereco: {
          cep: address.cep,
          logradouro: address.rua,
          numero: address.numero,
          complemento: address.complemento,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
        },
        tipo_entrega: 'correios',
        subtotal: total,
        frete: shipping,
        total: finalTotal,
        payer: {
          email: user.email,
          name: user.user_metadata?.nome ?? undefined,
        },
      })

      if ('error' in result) {
        setErro(result.error)
        return
      }

      window.location.href = result.init_point
    })
  }

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="px-4 md:px-8 py-16 text-center">
          <h1 className="text-xl font-black text-[#222] mb-3">Carrinho vazio</h1>
          <Link href="/produtos" className="inline-flex items-center gap-2 bg-[#003E8A] text-white font-bold py-3 px-6 rounded-xl text-sm">
            <ArrowLeft size={14} /> Ver produtos
          </Link>
        </div>
      </ShopLayout>
    )
  }

  return (
    <ShopLayout>
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-3">
        <p className="text-xs text-gray-400">
          <Link href="/" className="hover:text-[#003E8A]">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/carrinho" className="hover:text-[#003E8A]">Carrinho</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#003E8A] font-medium">Checkout</span>
        </p>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8 max-w-md mx-auto">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-[#003E8A]' : 'text-gray-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                  i < stepIndex ? 'bg-[#003E8A] border-[#003E8A] text-white'
                  : i === stepIndex ? 'border-[#003E8A] text-[#003E8A]'
                  : 'border-gray-200 text-gray-300'
                }`}>
                  {i < stepIndex ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < stepIndex ? 'bg-[#003E8A]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {erro && (
          <div className="max-w-2xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* STEP 1: Endereço */}
            {step === 'endereco' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={18} className="text-[#003E8A]" />
                  <h2 className="font-black text-[#222]">Endereço de entrega</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 sm:w-1/2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">CEP *</label>
                    <input value={address.cep} onChange={(e) => setAddress({ ...address, cep: e.target.value })}
                      placeholder="00000-000" maxLength={9}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rua / Logradouro *</label>
                    <input value={address.rua} onChange={(e) => setAddress({ ...address, rua: e.target.value })}
                      placeholder="Nome da rua"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Número *</label>
                    <input value={address.numero} onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                      placeholder="123"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Complemento</label>
                    <input value={address.complemento} onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                      placeholder="Apto, casa..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bairro *</label>
                    <input value={address.bairro} onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                      placeholder="Seu bairro"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cidade *</label>
                    <input value={address.cidade} onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                      placeholder="Sua cidade"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Estado *</label>
                    <select value={address.estado} onChange={(e) => setAddress({ ...address, estado: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50">
                      <option value="">Selecione</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={() => setStep('pagamento')}
                  disabled={!address.cep || !address.rua || !address.numero || !address.bairro || !address.cidade || !address.estado}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  Continuar para Pagamento <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* STEP 2: Pagamento via Mercado Pago */}
            {step === 'pagamento' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard size={18} className="text-[#003E8A]" />
                  <h2 className="font-black text-[#222]">Pagamento</h2>
                </div>

                {/* Métodos disponíveis — apenas informativo */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: '💳', label: 'Cartão', sub: 'até 12x sem juros' },
                    { icon: '⚡', label: 'PIX', sub: 'aprovação imediata' },
                    { icon: '📄', label: 'Boleto', sub: '3 dias úteis' },
                  ].map((m) => (
                    <div key={m.label} className="border border-gray-100 rounded-xl p-3 text-center bg-gray-50">
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-xs font-bold text-[#222]">{m.label}</p>
                      <p className="text-[10px] text-gray-400">{m.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#003E8A]/5 border border-[#003E8A]/10 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <ExternalLink size={16} className="text-[#003E8A] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#003E8A] mb-0.5">Pagamento via Mercado Pago</p>
                    <p className="text-xs text-gray-600">Ao confirmar, você será redirecionado para o ambiente seguro do Mercado Pago para escolher PIX, cartão de crédito ou boleto bancário.</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Endereço de entrega</p>
                  <p className="text-sm text-[#222]">{address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ''}</p>
                  <p className="text-sm text-gray-500">{address.bairro} — {address.cidade}/{address.estado} · CEP {address.cep}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('endereco')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003E8A] transition-colors px-4">
                    <ArrowLeft size={14} /> Voltar
                  </button>
                  <button onClick={handleCheckout} disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                    {isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Aguarde...</>
                      : <><Lock size={13} /> Confirmar e Ir para Pagamento</>
                    }
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400"><ShieldCheck size={12} className="text-green-500" /> Ambiente seguro</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400"><Truck size={12} className="text-[#003E8A]" /> Entrega garantida</div>
                </div>
              </div>
            )}
          </div>

          {/* Resumo lateral */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-black text-[#222] mb-4 text-sm">Resumo do pedido</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                      {item.imagem_url
                        ? <img src={item.imagem_url} alt={item.nome} className="w-full h-full object-cover" />
                        : <Package size={16} className="text-gray-300" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#222] font-medium line-clamp-1">{item.nome}</p>
                      <p className="text-xs text-gray-400">x{item.quantidade}</p>
                    </div>
                    <p className="text-xs font-bold text-[#003E8A]">
                      R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Frete</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="flex justify-between font-black text-[#222] text-sm pt-1">
                  <span>Total</span>
                  <span className="text-[#003E8A]">R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck size={14} className="text-green-500" /> Compra 100% segura</div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Truck size={14} className="text-[#003E8A]" /> Entrega para todo o Brasil</div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
