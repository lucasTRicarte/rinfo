import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Notebooks',
    description: 'Desempenho e mobilidade',
    href: '/produtos?categoria=notebooks',
    emoji: '💻',
    bg: 'from-blue-950 to-blue-700',
  },
  {
    name: 'Gamer',
    description: 'Os melhores setups para vencer',
    href: '/produtos?categoria=computadores',
    emoji: '🖥️',
    bg: 'from-purple-950 to-blue-800',
  },
  {
    name: 'Periféricos',
    description: 'Conforto e precisão para o dia a dia',
    href: '/produtos?categoria=perifericos',
    emoji: '🎧',
    bg: 'from-slate-800 to-slate-600',
  },
  {
    name: 'Impressoras',
    description: 'Imprima com qualidade e economia',
    href: '/produtos?categoria=impressoras',
    emoji: '🖨️',
    bg: 'from-gray-800 to-gray-600',
  },
  {
    name: 'Redes',
    description: 'Conectividade sem limites',
    href: '/produtos?categoria=redes',
    emoji: '📡',
    bg: 'from-sky-900 to-sky-700',
  },
  {
    name: 'Peças',
    description: 'Componentes de alta performance',
    href: '/produtos?categoria=componentes',
    emoji: '⚡',
    bg: 'from-emerald-900 to-emerald-700',
  },
]

export default function CategoryCards() {
  return (
    <section className="px-4 md:px-8 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-md hover:border-[#003E8A]/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-2xl shadow-sm`}
            >
              {cat.emoji}
            </div>
            <div>
              <div className="font-bold text-[#222] text-sm leading-tight">{cat.name}</div>
              <div className="text-gray-400 text-xs mt-0.5 leading-snug">{cat.description}</div>
            </div>
            <div className="flex items-center gap-1 text-[#003E8A] text-xs font-semibold mt-auto group-hover:gap-2 transition-all duration-150">
              Ver produtos <ArrowRight size={11} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
