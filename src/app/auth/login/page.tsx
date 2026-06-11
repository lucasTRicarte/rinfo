'use client'

import { useActionState } from 'react'
import { login } from '@/lib/auth/actions'
import Link from 'next/link'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <div className="min-h-screen bg-[#002C63] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-white/10 border border-[#D4A63A]/30 rounded-lg flex items-center justify-center">
          <span className="text-[#D4A63A] font-black text-2xl leading-none">Ri</span>
        </div>
        <div>
          <div className="font-black text-white text-base tracking-widest leading-none">RICARTE</div>
          <div className="text-[#D4A63A] text-[10px] tracking-[0.25em] font-semibold mt-0.5">INFORMÁTICA</div>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-black text-[#002C63]">Entrar na conta</h1>
          <p className="text-gray-500 text-sm mt-1">Acesse sua conta Ricarte Informática</p>
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="email" type="email" required autoComplete="email"
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="password" type="password" required autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#003E8A] focus:ring-2 focus:ring-[#003E8A]/10 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/auth/recuperar-senha" className="text-sm text-[#003E8A] hover:underline font-medium">
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit" disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-[#003E8A] hover:bg-[#002C63] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {pending ? 'Entrando...' : 'Entrar'}
            {!pending && <ArrowRight size={15} />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Não tem conta?{' '}
            <Link href="/auth/cadastro" className="text-[#003E8A] hover:underline font-bold">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>

      <p className="text-white/30 text-xs mt-6">
        © 2025 Ricarte Informática. Todos os direitos reservados.
      </p>
    </div>
  )
}
