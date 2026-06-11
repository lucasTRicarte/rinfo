'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Tag, ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: 'Tecnologia que acompanha',
    highlight: 'seu ritmo.',
    subtitle: 'Computadores, notebooks, periféricos e assistência especializada com a confiança da Ricarte Informática.',
    cta1: { label: 'Comprar Agora', href: '/produtos' },
    cta2: { label: 'Ver Promoções', href: '/produtos?badge=promocao' },
    accent: 'from-[#001020] via-[#001d3d] to-[#002C63]',
    glow: '#003E8A',
  },
  {
    id: 2,
    title: 'Notebooks com',
    highlight: 'alta performance.',
    subtitle: 'Mobilidade e potência para trabalho, estudos e entretenimento. As melhores marcas com garantia.',
    cta1: { label: 'Ver Notebooks', href: '/produtos?categoria=notebooks' },
    cta2: { label: 'Ver Promoções', href: '/produtos?badge=promocao' },
    accent: 'from-[#001833] via-[#002a50] to-[#003d70]',
    glow: '#004A9E',
  },
  {
    id: 3,
    title: 'Monte seu PC',
    highlight: 'dos sonhos.',
    subtitle: 'Componentes de alta qualidade selecionados por nossos especialistas. Garantia e suporte.',
    cta1: { label: 'Ver Componentes', href: '/produtos?categoria=componentes' },
    cta2: { label: 'Falar com Especialista', href: '/produtos' },
    accent: 'from-[#0a0015] via-[#1a0030] to-[#2d0050]',
    glow: '#6d28d9',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])

  const slide = slides[current]

  return (
    <div className="relative overflow-hidden select-none">
      <div className={`bg-gradient-to-r ${slide.accent} transition-all duration-700 min-h-[420px] flex items-center`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl transition-all duration-700"
            style={{ background: `radial-gradient(circle, ${slide.glow}, transparent 70%)` }}
          />
          <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end pr-16 opacity-5">
            <span className="text-[220px] font-black text-white leading-none">Ri</span>
          </div>
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="px-6 md:px-10 w-full py-16 md:py-24 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#D4A63A] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-[#D4A63A]/20">
              <span className="w-1.5 h-1.5 bg-[#D4A63A] rounded-full animate-pulse" />
              Ricarte Informática — Tecnologia Premium
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 transition-all duration-300">
              {slide.title}{' '}
              <span className="text-[#D4A63A]">{slide.highlight}</span>
            </h1>

            <p className="text-white/65 text-base md:text-lg mb-8 leading-relaxed max-w-md">
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={slide.cta1.href}
                className="inline-flex items-center gap-2 bg-[#003E8A] hover:bg-[#004fa8] text-white font-bold px-6 py-3.5 rounded-lg transition-all text-sm shadow-lg shadow-[#003E8A]/30 hover:shadow-[#003E8A]/50 hover:-translate-y-px"
              >
                {slide.cta1.label}
                <ArrowRight size={15} />
              </Link>
              <Link
                href={slide.cta2.href}
                className="inline-flex items-center gap-2 bg-[#D4A63A] hover:bg-[#c49530] text-[#002C63] font-bold px-6 py-3.5 rounded-lg transition-all text-sm hover:-translate-y-px"
              >
                {slide.cta2.label}
                <Tag size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => setCurrent((p) => (p - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => setCurrent((p) => (p + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-[#D4A63A] w-7' : 'bg-white/30 w-2 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
