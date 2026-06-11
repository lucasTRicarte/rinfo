const services = [
  {
    emoji: '🖥️',
    title: 'Montagem de PCs',
    description: 'PCs montados sob medida com os melhores componentes do mercado, testados e com garantia.',
  },
  {
    emoji: '🔧',
    title: 'Assistência Técnica',
    description: 'Diagnóstico e reparo rápido para notebooks, desktops e periféricos. Orçamento sem compromisso.',
  },
  {
    emoji: '🌐',
    title: 'Redes e Infraestrutura',
    description: 'Instalação e configuração de redes cabeadas, Wi-Fi corporativo e residencial.',
  },
  {
    emoji: '📊',
    title: 'Soluções para Empresas',
    description: 'Equipamentos, suporte técnico e gestão de TI corporativa com contrato de manutenção.',
  },
]

export default function ServicesSection() {
  return (
    <section className="px-4 md:px-8 py-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-[#222]">Nossos Serviços</h2>
        <p className="text-gray-500 text-sm mt-1.5">
          Muito além de uma loja — somos seu parceiro completo em tecnologia.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-md hover:border-[#003E8A]/20 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="text-4xl mb-4">{service.emoji}</div>
            <h3 className="font-bold text-[#002C63] mb-2 text-sm">{service.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
