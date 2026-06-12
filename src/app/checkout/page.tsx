'use client'

import { useState, useTransition, useEffect } from 'react'
import ShopLayout from '@/components/layout/ShopLayout'
import { useCart } from '@/context/CartContext'
import { iniciarCheckout } from '@/lib/loja/pedidos'
import { createClient } from '@/lib/db/supabase/client'
import { validarCupom } from '@/lib/loja/cupons'
import type { Cupom } from '@/lib/loja/cupons'
import { buscarCep, calcularFrete, calcularFreteLocal, isEntregaLocal } from '@/lib/loja/frete'
import type { OpcaoFrete } from '@/lib/loja/frete'
import { listarEnderecos } from '@/lib/loja/enderecos'
import type { Endereco } from '@/lib/loja/enderecos'
import {
  ArrowLeft, ArrowRight, MapPin, CreditCard, CheckCircle, Truck,
  ShieldCheck, Lock, Package, Loader2, ExternalLink, Tag, X, Home, Star,
} from 'lucide-react'
import Link from 'next/link'

type Step = 'endereco' | 'pagamento'

const steps: { id: Step; label: string }[] = [
  { id: 'endereco', label: 'Endereço' },
  { id: 'pagamento', label: 'Pagamento' },
]

export default function CheckoutPage() {
  const { items, total } = useCart()
  const [step, setStep] = useState<Step>('endereco')
  const [address, setAddress] = useState({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  })
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  // Frete
  const [freteOpcoes, setFreteOpcoes]           = useState<OpcaoFrete[]>([])
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null)
  const [freteLoading, setFreteLoading]         = useState(false)
  const [freteErro, setFreteErro]               = useState('')

  // Endereços salvos
  const [enderecosSalvos, setEnderecosSalvos] = useState<Endereco[]>([])
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<string | null>(null)

  useEffect(() => {
    listarEnderecos().then(setEnderecosSalvos)
  }, [])

  // Cupom
  const [cupomInput, setCupomInput]           = useState('')
  const [cupomAplicado, setCupomAplicado]     = useState<Cupom | null>(null)
  const [cupomDesconto, setCupomDesconto]     = useState(0)
  const [cupomBase, setCupomBase]             = useState(0)
  const [cupomCategorias, setCupomCategorias] = useState<string[]>([])
  const [cupomErro, setCupomErro]             = useState('')
  const [cupomLoading, setCupomLoading]       = useState(false)

  const shipping   = freteSelecionado?.preco ?? 0
  const finalTotal = Math.max(0, total + shipping - cupomDesconto)
  const stepIndex  = steps.findIndex((s) => s.id === step)

  const usarEnderecSalvo = (end: Endereco) => {
    setEnderecoSelecionadoId(end.id)
    setAddress({ cep: end.cep, rua: end.logradouro, numero: end.numero, complemento: end.complemento || '', bairro: end.bairro, cidade: end.cidade, estado: end.estado })
    setFreteSelecionado(null)
    setFreteErro('')
    const pesoTotal = items.reduce((s, i) => s + 0.5 * i.quantidade, 0)
    const dadosCep = { logradouro: end.logradouro, bairro: end.bairro, localidade: end.cidade, uf: end.estado }
    const opcoes: OpcaoFrete[] = []
    if (isEntregaLocal(dadosCep)) opcoes.push(calcularFreteLocal(pesoTotal))
    opcoes.push(...calcularFrete(end.estado, pesoTotal))
    setFreteOpcoes(opcoes)
  }

  const handleCepChange = async (raw: string) => {
    const digits    = raw.replace(/\D/g, '').slice(0, 8)
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
    setAddress((prev) => ({ ...prev, cep: formatted }))
    setEnderecoSelecionadoId(null)
    setFreteSelecionado(null)
    setFreteOpcoes([])
    setFreteErro('')

    if (digits.length === 8) {
      setFreteLoading(true)
      const dados = await buscarCep(digits)
      if (!dados) {
        setFreteErro('CEP não encontrado. Verifique e tente novamente.')
        setFreteLoading(false)
        return
      }
      setAddress((prev) => ({
        ...prev,
        cep: formatted,
        rua: dados.logradouro || prev.rua,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.localidade,
        estado: dados.uf,
      }))
      const pesoTotal = items.reduce((s, i) => s + 0.5 * i.quantidade, 0)
      const opcoes: OpcaoFrete[] = []
      if (isEntregaLocal(dados)) opcoes.push(calcularFreteLocal(pesoTotal))
      opcoes.push(...calcularFrete(dados.uf, pesoTotal))
      setFreteOpcoes(opcoes)
      setFreteLoading(false)
    }
  }

  const handleAplicarCupom = async () => {
    if (!cupomInput.trim()) return
    setCupomLoading(true)
    setCupomErro('')
    const res = await validarCupom(
      cupomInput,
      items.map((i) => ({ produto_id: i.id, preco: i.preco, quantidade: i.quantidade }))
    )
    if (res.valido) {
      setCupomAplicado(res.cupom)
      setCupomDesconto(res.desconto)
      setCupomBase(res.base)
      setCupomCategorias(res.categoriasAplicadas)
    } else {
      setCupomErro(res.erro)
      setCupomAplicado(null)
      setCupomDesconto(0)
      setCupomBase(0)
      setCupomCategorias([])
    }
    setCupomLoading(false)
  }

  const handleRemoverCupom = () => {
    setCupomInput('')
    setCupomAplicado(null)
    setCupomDesconto(0)
    setCupomBase(0)
    setCupomCategorias([])
    setCupomErro('')
  }

  const handleCheckout = () => {
    setErro('')
    startTransition(async () => {
      try {
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
          tipo_entrega: freteSelecionado?.tipo === 'local' ? 'entrega_cidade' : 'correios',
          frete_servico: freteSelecionado?.nome,
          subtotal: total,
          frete: shipping,
          desconto: cupomDesconto,
          total: finalTotal,
          cupom_id: cupomAplicado?.id,
          cupom_codigo: cupomAplicado?.codigo,
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
      } catch (err: unknown) {
        setErro(err instanceof Error ? err.message : 'Erro inesperado ao processar pagamento')
      }
    })
  }

  const canProceed =
    !!address.cep && !!address.rua && !!address.numero &&
    !!address.bairro && !!address.cidade && !!address.estado &&
    freteSelecionado !== null

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
            {/* STEP 1: Endereço + Frete */}
            {step === 'endereco' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={18} className="text-[#003E8A]" />
                  <h2 className="font-black text-[#222]">Endereço de entrega</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Endereços salvos */}
                  {enderecosSalvos.length > 0 && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Endereços salvos</label>
                      <div className="space-y-2">
                        {enderecosSalvos.map((end) => (
                          <button
                            key={end.id}
                            type="button"
                            onClick={() => usarEnderecSalvo(end)}
                            className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                              enderecoSelecionadoId === end.id
                                ? 'border-[#003E8A] bg-[#003E8A]/5'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                              enderecoSelecionadoId === end.id ? 'border-[#003E8A]' : 'border-gray-300'
                            }`}>
                              {enderecoSelecionadoId === end.id && <div className="w-2 h-2 rounded-full bg-[#003E8A]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${end.principal ? 'bg-[#003E8A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                  <Home size={11} />
                                </div>
                                {end.apelido && <span className="text-sm font-bold text-[#222]">{end.apelido}</span>}
                                {end.principal && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#003E8A] bg-[#003E8A]/10 px-1.5 py-0.5 rounded-full">
                                    <Star size={8} fill="currentColor" /> Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">{end.logradouro}, {end.numero}{end.complemento ? `, ${end.complemento}` : ''}</p>
                              <p className="text-[10px] text-gray-400">{end.bairro} · {end.cidade}/{end.estado} · CEP {end.cep}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">ou informe um novo endereço</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    </div>
                  )}

                  {/* CEP com auto-preenchimento */}
                  <div className="sm:col-span-2 sm:w-1/2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">CEP *</label>
                    <div className="relative">
                      <input
                        value={address.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50 pr-8"
                      />
                      {freteLoading && (
                        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                      )}
                    </div>
                    {freteErro && <p className="text-[10px] text-red-500 mt-1">{freteErro}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rua / Logradouro *</label>
                    <input
                      value={address.rua}
                      onChange={(e) => setAddress({ ...address, rua: e.target.value })}
                      placeholder="Nome da rua"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Número *</label>
                    <input
                      value={address.numero}
                      onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                      placeholder="123"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Complemento</label>
                    <input
                      value={address.complemento}
                      onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                      placeholder="Apto, casa..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bairro *</label>
                    <input
                      value={address.bairro}
                      onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                      placeholder="Seu bairro"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cidade *</label>
                    <input
                      value={address.cidade}
                      onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                      placeholder="Sua cidade"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Estado *</label>
                    <select
                      value={address.estado}
                      onChange={(e) => setAddress({ ...address, estado: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#003E8A] bg-gray-50"
                    >
                      <option value="">Selecione</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  {/* Seleção de frete */}
                  {freteOpcoes.length > 0 && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        <Truck size={11} className="inline mr-1 text-[#003E8A]" />
                        Opção de frete *
                      </label>
                      <div className="space-y-2">
                        {freteOpcoes.map((op) => (
                          <button
                            key={op.tipo}
                            type="button"
                            onClick={() => setFreteSelecionado(op)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                              freteSelecionado?.tipo === op.tipo
                                ? 'border-[#003E8A] bg-[#003E8A]/5'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                freteSelecionado?.tipo === op.tipo ? 'border-[#003E8A]' : 'border-gray-300'
                              }`}>
                                {freteSelecionado?.tipo === op.tipo && (
                                  <div className="w-2 h-2 rounded-full bg-[#003E8A]" />
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-bold text-[#222]">{op.nome}</span>
                                <span className="text-xs text-gray-400 ml-1.5">· {op.descricao}</span>
                                <p className="text-xs text-gray-400">{op.prazo}</p>
                              </div>
                            </div>
                            <span className="text-base font-black text-[#003E8A]">
                              R$ {op.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </button>
                        ))}
                      </div>
                      {!freteSelecionado && (
                        <p className="text-[10px] text-gray-400 mt-1.5">Selecione uma opção de entrega para continuar</p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setStep('pagamento')}
                  disabled={!canProceed}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  Continuar para Pagamento <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* STEP 2: Pagamento */}
            {step === 'pagamento' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard size={18} className="text-[#003E8A]" />
                  <h2 className="font-black text-[#222]">Pagamento</h2>
                </div>

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
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">Endereço de entrega</p>
                  <p className="text-sm text-[#222]">{address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ''}</p>
                  <p className="text-sm text-gray-500">{address.bairro} — {address.cidade}/{address.estado} · CEP {address.cep}</p>
                  {freteSelecionado && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[#003E8A] font-semibold">
                      <Truck size={11} />
                      {freteSelecionado.nome} · {freteSelecionado.prazo} ·{' '}
                      R$ {freteSelecionado.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('endereco')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003E8A] transition-colors px-4">
                    <ArrowLeft size={14} /> Voltar
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
                  >
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

              {/* Cupom */}
              <div className="border-t border-gray-100 pt-3 mb-3">
                {cupomAplicado ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-green-700">{cupomAplicado.codigo}</p>
                          <p className="text-[10px] text-green-600">
                            {cupomAplicado.desconto_tipo === 'percentual'
                              ? `${cupomAplicado.desconto_valor}% de desconto`
                              : `R$ ${cupomAplicado.desconto_valor.toFixed(2)} de desconto`}
                            {cupomCategorias.length > 0 && ` em ${cupomCategorias.join(', ')}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={handleRemoverCupom} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                    {cupomCategorias.length > 0 && cupomBase < total && (
                      <p className="text-[10px] text-green-600 mt-1 pl-5">
                        Aplicado sobre R$ {cupomBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {cupomCategorias.join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cupomInput}
                        onChange={(e) => { setCupomInput(e.target.value.toUpperCase()); setCupomErro('') }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAplicarCupom()}
                        placeholder="Código do cupom"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#003E8A] bg-gray-50"
                      />
                      <button
                        onClick={handleAplicarCupom}
                        disabled={cupomLoading || !cupomInput.trim()}
                        className="bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-50 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        {cupomLoading ? <Loader2 size={10} className="animate-spin" /> : <Tag size={10} />}
                        Aplicar
                      </button>
                    </div>
                    {cupomErro && <p className="text-[10px] text-red-500 mt-1">{cupomErro}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>
                    Frete
                    {freteSelecionado && <span className="text-[10px] text-gray-400 ml-1">({freteSelecionado.nome})</span>}
                  </span>
                  <span>
                    {freteLoading
                      ? <Loader2 size={10} className="animate-spin inline" />
                      : freteSelecionado
                      ? `R$ ${shipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '—'
                    }
                  </span>
                </div>
                {cupomDesconto > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex-1 mr-2">
                      Cupom {cupomAplicado?.codigo}
                      {cupomCategorias.length > 0 && (
                        <span className="text-[10px] text-green-500 font-normal ml-1">({cupomCategorias.join(', ')})</span>
                      )}
                    </span>
                    <span>-R$ {cupomDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-[#222] text-sm pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#003E8A]">
                    {freteSelecionado
                      ? `R$ ${finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '—'
                    }
                  </span>
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
