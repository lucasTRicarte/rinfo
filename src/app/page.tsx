import ShopLayout from '@/components/layout/ShopLayout'
import HeroBanner from '@/components/home/HeroBanner'
import BenefitsStrip from '@/components/home/BenefitsStrip'
import CategoryCards from '@/components/home/CategoryCards'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import InstitutionalBanner from '@/components/home/InstitutionalBanner'
import ServicesSection from '@/components/home/ServicesSection'
import Testimonials from '@/components/home/Testimonials'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <ShopLayout>
      <HeroBanner />
      <BenefitsStrip />
      <CategoryCards />
      <FeaturedProducts />
      <InstitutionalBanner />
      <ServicesSection />
      <Testimonials />
      <Newsletter />
    </ShopLayout>
  )
}
