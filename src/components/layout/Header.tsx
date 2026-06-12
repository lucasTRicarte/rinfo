'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, Heart, ShoppingCart, LogOut, LayoutDashboard, Package, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/db/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { logout } from '@/lib/auth/actions'
import { listarProdutos } from '@/lib/loja/produtos'
import type { ProdutoCard } from '@/lib/loja/produtos'

export default function Header() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<ProdutoCard[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { count, openCart } = useCart()
  const searchWrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Busca em tempo real com debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const termo = search.trim()
    if (termo.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      listarProdutos({ busca: termo, por_pagina: 5 }).then(({ produtos }) => {
        setSuggestions(produtos)
        setShowSuggestions(true)
      })
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const navegarBusca = () => {
    const termo = search.trim()
    if (!termo) return
    setShowSuggestions(false)
    router.push(`/produtos?busca=${encodeURIComponent(termo)}`)
  }

  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin'

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 md:px-8 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-10 h-10 bg-[#002C63] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-[#D4A63A] font-black text-xl leading-none tracking-tighter">Ri</span>
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-black text-[#002C63] text-sm tracking-widest leading-none">RICARTE</div>
            <div className="text-[#D4A63A] text-[9px] tracking-[0.25em] font-semibold mt-0.5">INFORMÁTICA</div>
          </div>
        </Link>

        {/* Search */}
        <div ref={searchWrapperRef} className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar produtos, categorias ou marcas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navegarBusca()
              if (e.key === 'Escape') setShowSuggestions(false)
            }}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
            className="w-full pl-4 pr-11 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-gray-50 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={navegarBusca}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003E8A] transition-colors"
          >
            <Search size={17} />
          </button>

          {/* Dropdown de sugestões */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              {suggestions.map((produto) => (
                <Link
                  key={produto.id}
                  href={`/produtos/${produto.slug}`}
                  onClick={() => { setShowSuggestions(false); setSearch('') }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {produto.imagem_url
                      ? <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                      : <Package size={16} className="text-gray-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#222] font-medium truncate">{produto.nome}</p>
                    <p className="text-xs text-[#003E8A] font-bold">
                      R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </Link>
              ))}
              <button
                onClick={navegarBusca}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#003E8A] font-semibold hover:bg-[#003E8A]/5 transition-colors border-t border-gray-100"
              >
                <Search size={13} />
                Ver todos os resultados para &ldquo;{search}&rdquo;
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* User menu */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 hover:text-[#003E8A] transition-colors text-gray-600 group"
            >
              <User size={21} strokeWidth={1.5} />
              <div className="text-center flex items-center gap-0.5">
                <div className="text-[10px] font-semibold leading-tight">
                  {user ? 'Minha Conta' : 'Entrar'}
                </div>
                <ChevronDown size={9} className="opacity-50 mt-0.5" />
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs font-bold text-[#222] truncate">{user.user_metadata?.nome ?? user.email}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/conta" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#003E8A] transition-colors">
                        <Package size={14} /> Meus pedidos
                      </Link>
                      <Link href="/conta" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#003E8A] transition-colors">
                        <User size={14} /> Meu perfil
                      </Link>
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-[#D4A63A] hover:bg-[#D4A63A]/10 transition-colors border-t border-gray-100 mt-1">
                        <LayoutDashboard size={14} />
                        {isAdmin ? 'Painel Admin' : 'Painel Admin (dev)'}
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <form action={logout}>
                          <button type="submit" className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={14} /> Sair da conta
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-[#003E8A] hover:bg-[#003E8A]/5 transition-colors">
                        Entrar na conta
                      </Link>
                      <Link href="/auth/cadastro" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Criar conta grátis
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile user link */}
          <Link href={user ? '/conta' : '/auth/login'} className="md:hidden flex flex-col items-center gap-0.5 px-2 py-1.5 hover:text-[#003E8A] transition-colors text-gray-600">
            <User size={21} strokeWidth={1.5} />
          </Link>

          <button type="button" className="hidden md:flex flex-col items-center gap-0.5 px-2 py-1.5 hover:text-[#003E8A] transition-colors text-gray-600">
            <Heart size={21} strokeWidth={1.5} />
            <span className="text-[10px] font-semibold">Favoritos</span>
          </button>

          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 px-2 py-1.5 hover:text-[#003E8A] transition-colors text-gray-600"
          >
            <div className="relative">
              <ShoppingCart size={21} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#003E8A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {count}
                </span>
              )}
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-[10px] font-semibold">Carrinho</div>
              <div className="text-[10px] text-gray-500">
                {count === 0 ? 'R$ 0,00' : `${count} ${count === 1 ? 'item' : 'itens'}`}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
