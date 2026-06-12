'use client'

import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Menu, ChevronDown, X, Grid3X3 } from 'lucide-react'
import { listarCategoriasComSubs, type CategoriaComSubs } from '@/lib/loja/categorias'

export default function NavMenu() {
  const [categorias, setCategorias] = useState<CategoriaComSubs[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [megaOpen, setMegaOpen] = useState(false)
  const [dropLeft, setDropLeft] = useState(0)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    listarCategoriasComSubs().then(setCategorias)
  }, [])

  const openMenu = useCallback((i: number, el: HTMLElement | null) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const btnRect = el.getBoundingClientRect()
      setDropLeft(btnRect.left - navRect.left)
    }
    setActiveIndex(i)
    setMegaOpen(false)
  }, [])

  const scheduleClose = () => {
    closeTimeout.current = setTimeout(() => setActiveIndex(null), 120)
  }

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
  }

  const toggleMobile = (i: number, el: HTMLElement | null) => {
    if (activeIndex === i) {
      setActiveIndex(null)
    } else {
      openMenu(i, el)
    }
    setMegaOpen(false)
  }

  const activeItem = activeIndex !== null ? categorias[activeIndex] : null

  return (
    <nav ref={navRef} className="bg-[#002C63] text-white border-t border-white/5 relative z-30">
      <div className="px-4 md:px-8 flex items-center">
        {/* Todas as Categorias */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => { setMegaOpen((v) => !v); setActiveIndex(null) }}
            onMouseEnter={() => { if (window.innerWidth >= 768) { setMegaOpen(true); setActiveIndex(null) } }}
            onMouseLeave={() => { if (window.innerWidth >= 768) setMegaOpen(false) }}
            className="flex items-center gap-2 bg-[#D4A63A] hover:bg-[#c49530] text-[#002C63] font-bold text-sm px-4 py-3.5 transition-colors whitespace-nowrap"
          >
            {megaOpen ? <X size={15} /> : <Menu size={15} />}
            <span className="hidden sm:inline">Todas as Categorias</span>
            <span className="sm:hidden">Categorias</span>
            <ChevronDown size={13} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
          </button>

          {megaOpen && (
            <div
              className="absolute left-0 top-full bg-white rounded-b-xl rounded-tr-xl shadow-2xl border border-gray-100 py-3 min-w-[220px] z-50"
              onMouseEnter={() => { if (window.innerWidth >= 768) setMegaOpen(true) }}
              onMouseLeave={() => { if (window.innerWidth >= 768) setMegaOpen(false) }}
            >
              {categorias.map((item) => (
                <Link
                  key={item.slug}
                  href={`/produtos?categoria=${item.slug}`}
                  onClick={() => setMegaOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#222] hover:bg-[#003E8A]/5 hover:text-[#003E8A] transition-colors"
                >
                  <Grid3X3 size={13} className="text-[#D4A63A]" />
                  {item.nome}
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

        {/* Nav items — scrollable, dropdowns renderizados fora deste container */}
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {categorias.map((item, i) => (
            <div
              key={item.slug}
              onMouseEnter={(e) => {
                if (window.innerWidth >= 768) openMenu(i, e.currentTarget)
              }}
              onMouseLeave={() => {
                if (window.innerWidth >= 768) scheduleClose()
              }}
            >
              <button
                type="button"
                onClick={(e) => toggleMobile(i, e.currentTarget.parentElement)}
                className={`flex items-center gap-1 px-3.5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeIndex === i
                    ? 'text-white bg-white/10'
                    : 'text-white/85 hover:text-white hover:bg-white/8'
                }`}
              >
                {item.nome}
                {item.subcategorias.length > 0 && (
                  <ChevronDown
                    size={11}
                    className={`opacity-50 mt-0.5 transition-transform ${activeIndex === i ? 'rotate-180 opacity-80' : ''}`}
                  />
                )}
              </button>
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

      {/* Dropdown renderizado fora do overflow container para não ser cortado */}
      {activeItem && activeItem.subcategorias.length > 0 && (
        <div
          className="absolute top-full bg-white rounded-b-xl shadow-2xl border border-gray-100 py-2 min-w-[200px] z-50"
          style={{ left: dropLeft }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <Link
            href={`/produtos?categoria=${activeItem.slug}`}
            onClick={() => setActiveIndex(null)}
            className="block px-4 py-2.5 text-sm font-semibold text-[#003E8A] hover:bg-[#003E8A]/5 transition-colors border-b border-gray-100 mb-1"
          >
            Todos: {activeItem.nome}
          </Link>
          {activeItem.subcategorias.map((sub) => (
            <Link
              key={sub.slug}
              href={`/produtos?categoria=${sub.slug}`}
              onClick={() => setActiveIndex(null)}
              className="block px-4 py-2.5 text-sm text-[#222] hover:bg-[#003E8A]/5 hover:text-[#003E8A] transition-colors"
            >
              {sub.nome}
            </Link>
          ))}
        </div>
      )}

      {/* Backdrop mobile */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          onClick={() => setActiveIndex(null)}
        />
      )}
    </nav>
  )
}
