import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function InstitutionalBanner() {
  return (
    <section className="bg-[#002C63] py-16 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#003E8A]/40 blur-3xl" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#D4A63A]/10 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <p className="text-[#D4A63A] text-xs font-bold tracking-[0.3em] uppercase mb-3">
          Nossa história
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          Mais que uma loja.
        </h2>
        <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Somos especialistas em tecnologia e suporte para empresas, estudantes e gamers.
          Há mais de 10 anos levando inovação com atendimento humanizado e confiança.
        </p>
        <Link
          href="/sobre"
          className="inline-flex items-center gap-2 bg-[#D4A63A] hover:bg-[#c49530] text-[#002C63] font-bold px-7 py-3.5 rounded-lg transition-all text-sm hover:-translate-y-px"
        >
          Conheça nossa história
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
