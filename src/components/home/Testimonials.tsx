const testimonials = [
  {
    name: 'João Silva',
    role: 'Empresário',
    text: 'Atendimento excelente e entrega rápida. Já comprei três vezes e sempre fui muito bem atendido!',
    rating: 5,
  },
  {
    name: 'Maria Souza',
    role: 'Designer',
    text: 'Montaram meu PC exatamente como eu queria. Ficou incrível e dentro do meu orçamento.',
    rating: 5,
  },
  {
    name: 'Carlos Mendes',
    role: 'Estudante',
    text: 'Suporte técnico top. Resolveram o problema do meu notebook em poucas horas. Recomendo!',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="bg-white py-10">
      <div className="px-4 md:px-8">
        <h2 className="text-2xl font-black text-[#222] text-center mb-8">
          O que nossos clientes dizem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-[#F5F7FA] rounded-xl p-6 border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-[#D4A63A] text-base">★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#003E8A]/10 rounded-full flex items-center justify-center font-bold text-[#003E8A] text-sm flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-[#222] text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
