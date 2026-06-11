'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings,
  Menu, LogOut, ChevronRight, Layers, Warehouse, Truck,
} from 'lucide-react'
import { logout } from '@/lib/auth/actions'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} />, exact: true },
  { href: '/admin/categorias', label: 'Categorias', icon: <Layers size={16} /> },
  { href: '/admin/produtos', label: 'Produtos', icon: <Package size={16} /> },
  { href: '/admin/estoque', label: 'Estoque', icon: <Warehouse size={16} /> },
  { href: '/admin/pedidos', label: 'Pedidos', icon: <ShoppingBag size={16} /> },
  { href: '/admin/clientes', label: 'Clientes', icon: <Users size={16} /> },
  { href: '/admin/fornecedores', label: 'Fornecedores', icon: <Truck size={16} /> },
  { href: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={16} /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {open && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed left-0 top-0 h-full w-60 bg-[#002C63] z-30 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#D4A63A]/20 border border-[#D4A63A]/40 rounded-lg flex items-center justify-center">
              <span className="text-[#D4A63A] font-black text-base leading-none">Ri</span>
            </div>
            <div>
              <p className="font-black text-white text-xs tracking-widest leading-none">RICARTE</p>
              <p className="text-[#D4A63A] text-[8px] tracking-widest font-semibold mt-0.5">PAINEL ADMIN</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-[#D4A63A] text-[#002C63] font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
                {active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-2 text-xs text-white/50 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            ← Ver loja
          </Link>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-2 text-xs text-white/50 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              <LogOut size={13} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center gap-4 sticky top-0 z-10">
          <button type="button" onClick={() => setOpen(true)} className="md:hidden text-gray-500">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003E8A] rounded-full flex items-center justify-center text-white font-black text-sm">A</div>
            <p className="text-sm font-semibold text-[#222] hidden sm:block">Administrador</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
