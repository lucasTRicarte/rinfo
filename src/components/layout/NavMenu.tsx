'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { Menu, ChevronDown, X, Grid3X3 } from 'lucide-react'

const navItems = [
  {
    label: 'Notebooks',
    categorySlug: 'notebooks',
    subs: [
      { label: 'Notebooks Gaming', slug: 'notebooks' },
      { label: 'Trabalho e Estudo', slug: 'notebooks' },
      { label: 'Ultrabooks', slug: 'notebooks' },
      { label: 'Todos os Notebooks', slug: 'notebooks' },
    ],
  },
  {
    label: 'Computadores',
    categorySlug: 'computadores',
    subs: [
      { label: 'PCs Gamer', slug: 'computadores' },
      { label: 'Desktop Trabalho', slug: 'computadores' },
      { label: 'All-in-One', slug: 'computadores' },
      { label: 'Todos os Computadores', slug: 'computadores' },
    ],
  },
  {
    label: 'Periféricos',
    categorySlug: 'perifericos',
    subs: [
      { label: 'Teclados', slug: 'perifericos' },
      { label: 'Mouses', slug: 'perifericos' },
      { label: 'Headsets', slug: 'perifericos' },
      { label: 'Monitores', slug: 'perifericos' },
      { label: 'Webcams', slug: 'perifericos' },
      { label: 'Todos os Periféricos', slug: 'perifericos' },
    ],
  },
  {
    label: 'Componentes',
    categorySlug: 'componentes',
    subs: [
      { label: 'Processadores', slug: 'componentes' },
      { label: 'Memória RAM', slug: 'componentes' },
      { label: 'SSD e HD', slug: 'componentes' },
      { label: 'Placas de Vídeo', slug: 'componentes' },
      { label: 'Fontes e Gabinetes', slug: 'componentes' },
      { label: 'Todos os Componentes', slug: 'componentes' },
    ],
  },
  {
    label: 'Redes',
    categorySlug: 'redes',
    subs: [
      { label: 'Roteadores', slug: 'redes' },
      { label: 'Switches', slug: 'redes' },
      { label: 'Access Points', slug: 'redes' },
      { label: 'Cabos e Conectores', slug: 'redes' },
      { label: 'Todos os Produtos de Rede', slug: 'redes' },
    ],
  },
  {
    label: 'Impressoras',
    categorySlug: 'impressoras',
    subs: [
      { label: 'Jato de Tinta', slug: 'impressoras' },
      { label: 'Laser', slug: 'impressoras' },
      { label: 'Multifuncional', slug: 'impressoras' },
      { label: 'Todas as Impressoras', slug: 'impressoras' },
    ],
  },
  {
    label: 'Serviços',
    categorySlug: 'servicos',
    subs: [
      { label: 'Manutenção e Reparo', slug: 'servicos' },
      { label: 'Formatação', slug: 'servicos' },
      { label: 'Montagem de PC', slug: 'servicos' },
      { label: 'Configuração de Rede', slug: 'servicos' },
      { label: 'Todos os Serviços', slug: 'servicos' },
    ],
  },
]

export default function NavMenu() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [megaOpen, setMegaOpen] = useState(false)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = (i: number) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setActiveIndex(i)
    setMegaOpen(false)
  }

  const scheduleClose = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveIndex(null)
    }, 120)
  }

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
  }

  const toggleMobile = (i: number) => {
    setActiveIndex((prev) => (prev === i ? null : i))
    setMegaOpen(false)
  }

  return (
    <nav className="bg-[#002C63] text-white border-t border-white/5 relative z-30">
      <div className="px-4 md:px-8 flex items-center">
        {/* Todas as Categorias */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setMegaOpen((v) => !v); setActiveIndex(null) }}
            onMouseEnter={() => { if (window.innerWidth >= 768) { setMegaOpen(true); setActiveIndex(null) } }}
            onMouseLeave={() => { if (window.innerWidth >= 768) setMegaOpen(false) }}
            className="flex items-center gap-2 bg-[#D4A63A] hover:bg-[#c49530] text-[#002C63] font-bold text-sm px-4 py-3.5 transition-colors whitespace-nowrap flex-shrink-0"
          >
            {megaOpen ? <X size={15} /> : <Menu size={15} />}
            <span className="hidden sm:inline">Todas as Categorias</span>
            <span className="sm:hidden">Categorias</span>
            <ChevronDown size={13} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
          </button>

          {megaOpen && (
            <div
              className="absolute left-0 top-full bg-white rounded-b-xl rounded-tr-xl shadow-2xl border border-gray-100 py-3 min-w-[220px] z-50"
              onMouseEnter={() => { if (window.innerWidth >= 768) { setMegaOpen(true) } }}
              onMouseLeave={() => { if (window.innerWidth >= 768) setMegaOpen(false) }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.categorySlug}
                  href={`/produtos?categoria=${item.categorySlug}`}
                  onClick={() => setMegaOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#222] hover:bg-[#003E8A]/5 hover:text-[#003E8A] transition-colors"
                >
                  <Grid3X3 size={13} className="text-[#D4A63A]" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link
                  href="/produtos"
                  onClick={() => setMegaOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-[#003E8A] hover:bg-[#003E8A]/5 transition-colors"
                >
                  Ver todos os produtos →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Category nav items */}
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {navItems.map((item, i) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => { if (typeof window !== 'undefined' && window.innerWidth >= 768) openMenu(i) }}
              onMouseLeave={() => { if (typeof window !== 'undefined' && window.innerWidth >= 768) scheduleClose() }}
            >
              <button
                type="button"
                onClick={() => toggleMobile(i)}
                className={`flex items-center gap-1 px-3.5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeIndex === i
                    ? 'text-white bg-white/10'
                    : 'text-white/85 hover:text-white hover:bg-white/8'
                }`}
              >
                {item.label}
                <ChevronDown
                  size={11}
                  className={`opacity-50 mt-0.5 transition-transform ${activeIndex === i ? 'rotate-180 opacity-80' : ''}`}
                />
              </button>

              {activeIndex === i && (
                <div
                  className="absolute left-0 top-full bg-white rounded-b-xl rounded-br-xl shadow-2xl border border-gray-100 py-2 min-w-[200px] z-50"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  {item.subs.map((sub) => (
                    <Link
                      key={sub.label}
                      href={`/produtos?categoria=${sub.slug}`}
                      onClick={() => setActiveIndex(null)}
                      className="block px-4 py-2.5 text-sm text-[#222] hover:bg-[#003E8A]/5 hover:text-[#003E8A] transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/produtos?badge=promocao"
            className="px-3.5 py-3.5 text-sm font-bold text-[#D4A63A] hover:text-[#D4A63A]/80 transition-colors whitespace-nowrap"
          >
            Promoções
          </Link>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          onClick={() => setActiveIndex(null)}
        />
      )}
    </nav>
  )
}
