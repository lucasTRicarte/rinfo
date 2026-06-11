import { Truck, ShieldCheck, CreditCard, Wrench } from 'lucide-react'

const benefits = [
  { Icon: Truck, title: 'Entrega Rápida', subtitle: 'Para todo o Brasil' },
  { Icon: ShieldCheck, title: 'Compra Segura', subtitle: 'Seus dados protegidos' },
  { Icon: CreditCard, title: 'Parcelamento em até 12x', subtitle: 'Sem juros no cartão' },
  { Icon: Wrench, title: 'Assistência Técnica', subtitle: 'Especializada' },
]

export default function BenefitsStrip() {
  return (
    <div className="bg-[#001d4a]">
      <div className="px-4 md:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-xl overflow-hidden">
          {benefits.map(({ Icon, title, subtitle }) => (
            <div key={title} className="bg-[#001d4a] flex items-center gap-3 text-white px-5 py-4">
              <Icon size={26} className="text-[#D4A63A] flex-shrink-0" strokeWidth={1.5} />
              <div>
                <div className="font-semibold text-sm leading-tight">{title}</div>
                <div className="text-white/50 text-xs mt-0.5">{subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
