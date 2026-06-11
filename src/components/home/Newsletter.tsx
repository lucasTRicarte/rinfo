'use client'

import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setDone(true)
  }

  return (
    <section className="bg-[#003E8A] py-14 px-4">
      <div className="max-w-xl mx-auto text-center">
        <Mail size={38} className="text-[#D4A63A] mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-white mb-2">Receba promoções exclusivas</h2>
        <p className="text-white/60 text-sm mb-7">
          Cadastre seu e-mail e fique por dentro das melhores ofertas antes de todo mundo.
        </p>

        {done ? (
          <div className="flex items-center justify-center gap-2 text-[#D4A63A] font-semibold">
            <span>✓</span> Obrigado! Em breve você receberá nossas novidades.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A63A] bg-white text-[#222] placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#D4A63A] hover:bg-[#c49530] text-[#002C63] font-bold px-5 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Quero Receber
              <ArrowRight size={13} />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
