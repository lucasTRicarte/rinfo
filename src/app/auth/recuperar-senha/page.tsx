'use client'

import { useActionState } from 'react'
import { recuperarSenha } from '@/lib/auth/actions'
import Link from 'next/link'

export default function RecuperarSenhaPage() {
  const [state, action, pending] = useActionState(recuperarSenha, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
              {state.success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail cadastrado
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {pending ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
