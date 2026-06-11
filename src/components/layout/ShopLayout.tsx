import TopBar from './TopBar'
import Header from './Header'
import NavMenu from './NavMenu'
import Footer from './Footer'
import WhatsAppButton from '../ui/WhatsAppButton'
import CartDrawer from '../carrinho/CartDrawer'
import { ReactNode } from 'react'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <NavMenu />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </>
  )
}
