import Link from 'next/link'

const produtos = ['Notebooks', 'Computadores', 'Periféricos', 'Componentes', 'Redes', 'Impressoras']
const servicos = ['Montagem de PCs', 'Assistência Técnica', 'Redes e Infraestrutura', 'Soluções Empresariais', 'Suporte']

export default function Footer() {
  return (
    <footer className="bg-[#001830] text-white mt-auto">
      <div className="px-4 md:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-[#002C63] border border-[#D4A63A]/30 rounded flex items-center justify-center">
                <span className="text-[#D4A63A] font-black text-xl leading-none">Ri</span>
              </div>
              <div>
                <div className="font-black text-white text-sm tracking-widest leading-none">RICARTE</div>
                <div className="text-[#D4A63A] text-[9px] tracking-[0.25em] mt-0.5">INFORMÁTICA</div>
              </div>
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-5">
              Tecnologia, desempenho e confiança para quem exige mais.
            </p>
            <div className="flex gap-2">
              {['f', 'in', 'ig'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 bg-white/10 hover:bg-[#D4A63A] hover:text-[#002C63] rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Produtos */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white/90">Produtos</h4>
            <ul className="space-y-2">
              {produtos.map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-white/45 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white/90">Serviços</h4>
            <ul className="space-y-2">
              {servicos.map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-white/45 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white/90">Contato</h4>
            <ul className="space-y-3 text-sm text-white/45">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Rua da Tecnologia, 123<br />São Paulo - SP</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>(11) 98765-4321</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>contato@ricarteinformatica.com.br</span>
              </li>
              <li className="pt-1">
                <span className="text-white/25 text-xs block mb-0.5">Horário de Atendimento</span>
                <span>Seg–Sex: 8h às 18h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/25">
            © 2025 Ricarte Informática. Todos os direitos reservados.
          </span>
          <div className="flex gap-5">
            <Link href="#" className="text-xs text-white/25 hover:text-white/60 transition-colors">
              Política de Privacidade
            </Link>
            <Link href="#" className="text-xs text-white/25 hover:text-white/60 transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
