export type Badge = 'MAIS VENDIDO' | 'PROMOÇÃO' | 'NOVO'

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  badge?: Badge
  category: string
  categorySlug: string
  emoji: string
  shortDescription: string
  description: string
  specs: { key: string; value: string }[]
  inStock: boolean
}

export const products: Product[] = [
  {
    id: 1, name: 'Notebook Dell Inspiron 15', slug: 'notebook-dell-inspiron-15',
    price: 3499, originalPrice: 3999, rating: 5, reviews: 128, badge: 'MAIS VENDIDO',
    category: 'Notebooks', categorySlug: 'notebooks', emoji: '💻',
    shortDescription: 'Intel Core i5 12ª Gen, 8GB RAM, SSD 256GB, 15.6" Full HD',
    description: 'O Dell Inspiron 15 oferece desempenho excepcional para trabalho e entretenimento, com processador Intel Core i5 de 12ª geração, memória DDR4 e armazenamento SSD para maior agilidade.',
    specs: [
      { key: 'Processador', value: 'Intel Core i5 12ª Geração' },
      { key: 'Memória RAM', value: '8GB DDR4' },
      { key: 'Armazenamento', value: 'SSD 256GB' },
      { key: 'Tela', value: '15.6" Full HD (1920x1080)' },
      { key: 'Placa de Vídeo', value: 'Intel Iris Xe Graphics' },
      { key: 'Sistema Operacional', value: 'Windows 11 Home' },
      { key: 'Bateria', value: 'Até 8 horas' },
      { key: 'Peso', value: '1.85 kg' },
    ],
    inStock: true,
  },
  {
    id: 2, name: 'PC Gamer RGB Intel i7 16GB', slug: 'pc-gamer-rgb-intel-i7',
    price: 5799, originalPrice: 6499, rating: 5, reviews: 87, badge: 'PROMOÇÃO',
    category: 'Gamer', categorySlug: 'gamer', emoji: '🖥️',
    shortDescription: 'Intel i7 12ª Gen, RTX 3060 12GB, 16GB DDR4, SSD 512GB NVMe',
    description: 'PC Gamer montado pela equipe especializada da Ricarte Informática com os melhores componentes, testado e configurado para máxima performance em jogos e criação de conteúdo.',
    specs: [
      { key: 'Processador', value: 'Intel Core i7 12700F' },
      { key: 'Placa de Vídeo', value: 'NVIDIA RTX 3060 12GB' },
      { key: 'Memória RAM', value: '16GB DDR4 3200MHz' },
      { key: 'Armazenamento', value: 'SSD NVMe 512GB' },
      { key: 'Gabinete', value: 'Gamer com LED RGB' },
      { key: 'Fonte', value: '650W 80 Plus Bronze' },
      { key: 'Sistema Operacional', value: 'Windows 11 Home' },
      { key: 'Garantia', value: '1 ano Ricarte Informática' },
    ],
    inStock: true,
  },
  {
    id: 3, name: 'Monitor Gamer 144Hz 27"', slug: 'monitor-gamer-144hz-27',
    price: 1299, rating: 4, reviews: 54, badge: 'NOVO',
    category: 'Periféricos', categorySlug: 'perifericos', emoji: '🖥',
    shortDescription: 'Painel IPS 27" 144Hz, 1ms, Full HD, FreeSync Premium',
    description: 'Monitor gamer com painel IPS de 27 polegadas, taxa de atualização de 144Hz e tempo de resposta de 1ms. Perfeito para jogos competitivos e uso profissional.',
    specs: [
      { key: 'Tamanho', value: '27 polegadas' },
      { key: 'Resolução', value: '1920x1080 Full HD' },
      { key: 'Taxa de Atualização', value: '144Hz' },
      { key: 'Tempo de Resposta', value: '1ms (MPRT)' },
      { key: 'Painel', value: 'IPS' },
      { key: 'Conectividade', value: '2x HDMI 2.0, 1x DisplayPort 1.4' },
      { key: 'AMD FreeSync', value: 'Premium' },
    ],
    inStock: true,
  },
  {
    id: 4, name: 'Headset Gamer 7.1 Surround', slug: 'headset-gamer-71-surround',
    price: 349, originalPrice: 429, rating: 4, reviews: 213,
    category: 'Periféricos', categorySlug: 'perifericos', emoji: '🎧',
    shortDescription: 'Som 7.1 Virtual, Microfone retrátil com cancelamento de ruído, LED RGB',
    description: 'Headset gamer com som surround 7.1 virtual e drivers de 50mm para uma experiência de áudio imersiva. Microfone retrátil com cancelamento de ruído para comunicação nítida.',
    specs: [
      { key: 'Drivers', value: '50mm Neodymium' },
      { key: 'Frequência', value: '20Hz - 20kHz' },
      { key: 'Som Surround', value: '7.1 Virtual' },
      { key: 'Microfone', value: 'Retrátil com cancelamento de ruído' },
      { key: 'Conexão', value: 'USB + P2 3.5mm' },
      { key: 'Iluminação', value: 'LED RGB' },
    ],
    inStock: true,
  },
  {
    id: 5, name: 'Roteador Wi-Fi 6 AX3000', slug: 'roteador-wifi-6-ax3000',
    price: 589, rating: 5, reviews: 41, badge: 'NOVO',
    category: 'Redes', categorySlug: 'redes', emoji: '📡',
    shortDescription: 'Wi-Fi 6, Dual Band 2.4GHz+5GHz, 4 antenas, até 3000Mbps',
    description: 'Roteador Wi-Fi 6 com velocidade agregada de até 3000Mbps. Dual Band para melhor gerenciamento de dispositivos. Ideal para casas e escritórios com múltiplos dispositivos.',
    specs: [
      { key: 'Padrão', value: 'Wi-Fi 6 (802.11ax)' },
      { key: 'Velocidade', value: 'Até 3000Mbps agregado' },
      { key: 'Bandas', value: 'Dual Band 2.4GHz + 5GHz' },
      { key: 'Antenas', value: '4 antenas externas de alto ganho' },
      { key: 'Portas LAN', value: '4x Gigabit' },
      { key: 'Segurança', value: 'WPA3, Firewall integrado' },
    ],
    inStock: true,
  },
  {
    id: 6, name: 'No-break 1200VA Senoidal', slug: 'no-break-1200va-senoidal',
    price: 799, originalPrice: 949, rating: 4, reviews: 29, badge: 'PROMOÇÃO',
    category: 'Acessórios', categorySlug: 'acessorios', emoji: '🔋',
    shortDescription: 'Saída senoidal pura, 1200VA/720W, 8 tomadas NBR',
    description: 'No-break com saída senoidal pura para proteção total de equipamentos sensíveis. Ideal para servidores, estações de trabalho e equipamentos de alta precisão.',
    specs: [
      { key: 'Potência', value: '1200VA / 720W' },
      { key: 'Tipo de Saída', value: 'Senoidal Pura' },
      { key: 'Tomadas', value: '8 tomadas NBR 14136' },
      { key: 'Tensão de Entrada', value: '115V/220V selecionável' },
      { key: 'Bateria', value: 'Selada VRLA 12V 7Ah' },
      { key: 'Autonomia', value: 'Até 30 min (carga mínima)' },
    ],
    inStock: true,
  },
  {
    id: 7, name: 'Notebook Lenovo IdeaPad 3', slug: 'notebook-lenovo-ideapad-3',
    price: 2799, rating: 4, reviews: 95,
    category: 'Notebooks', categorySlug: 'notebooks', emoji: '💻',
    shortDescription: 'AMD Ryzen 5 5500U, 8GB RAM, SSD 512GB, 15.6"',
    description: 'O Lenovo IdeaPad 3 combina desempenho e custo-benefício. Com processador AMD Ryzen 5 e armazenamento SSD de 512GB, é ideal para estudantes e profissionais.',
    specs: [
      { key: 'Processador', value: 'AMD Ryzen 5 5500U' },
      { key: 'Memória RAM', value: '8GB DDR4' },
      { key: 'Armazenamento', value: 'SSD 512GB' },
      { key: 'Tela', value: '15.6" HD (1366x768)' },
      { key: 'Placa de Vídeo', value: 'AMD Radeon RX Vega 7' },
      { key: 'Sistema Operacional', value: 'Windows 11 Home' },
    ],
    inStock: true,
  },
  {
    id: 8, name: 'Teclado Mecânico Gamer RGB', slug: 'teclado-mecanico-gamer-rgb',
    price: 279, originalPrice: 349, rating: 5, reviews: 156, badge: 'MAIS VENDIDO',
    category: 'Periféricos', categorySlug: 'perifericos', emoji: '⌨️',
    shortDescription: 'Switch Red Linear, ABNT2 (PT-BR), LED RGB por tecla, Anti-ghosting',
    description: 'Teclado mecânico gamer com switches Red para acionamento leve e silencioso. Layout ABNT2 brasileiro com iluminação RGB individual por tecla.',
    specs: [
      { key: 'Switch', value: 'Red Linear (silencioso)' },
      { key: 'Layout', value: 'ABNT2 (PT-BR)' },
      { key: 'Iluminação', value: 'LED RGB por tecla' },
      { key: 'Anti-ghosting', value: 'N-Key Rollover (Full)' },
      { key: 'Conexão', value: 'USB com cabo trançado destacável' },
      { key: 'Vida útil', value: '50 milhões de acionamentos' },
    ],
    inStock: true,
  },
  {
    id: 9, name: 'Mouse Gamer 16000 DPI', slug: 'mouse-gamer-16000-dpi',
    price: 189, rating: 4, reviews: 88,
    category: 'Periféricos', categorySlug: 'perifericos', emoji: '🖱️',
    shortDescription: '16000 DPI ajustável, 7 botões programáveis, LED RGB',
    description: 'Mouse gamer ergonômico com sensor óptico de alta precisão. DPI ajustável para diferentes tipos de jogo e uso.',
    specs: [
      { key: 'DPI', value: 'Até 16.000 DPI (ajustável)' },
      { key: 'Botões', value: '7 botões programáveis' },
      { key: 'Sensor', value: 'Óptico de alta precisão' },
      { key: 'Iluminação', value: 'LED RGB' },
      { key: 'Conexão', value: 'USB (cabo trançado 1.8m)' },
      { key: 'Peso', value: '120g' },
    ],
    inStock: true,
  },
  {
    id: 10, name: 'SSD NVMe 1TB Kingston', slug: 'ssd-nvme-1tb-kingston',
    price: 449, originalPrice: 529, rating: 5, reviews: 203, badge: 'PROMOÇÃO',
    category: 'Componentes', categorySlug: 'componentes', emoji: '💾',
    shortDescription: 'M.2 PCIe 3.0, Leitura 3500MB/s, Gravação 3000MB/s, 5 anos garantia',
    description: 'SSD NVMe Kingston com velocidades ultrarrápidas de leitura e gravação. Interface M.2 para instalação direta na placa-mãe, sem cabos.',
    specs: [
      { key: 'Capacidade', value: '1TB' },
      { key: 'Interface', value: 'M.2 NVMe PCIe 3.0 x4' },
      { key: 'Leitura Sequencial', value: 'Até 3.500 MB/s' },
      { key: 'Escrita Sequencial', value: 'Até 3.000 MB/s' },
      { key: 'Garantia', value: '5 anos ou 600TBW' },
      { key: 'Compatibilidade', value: 'PS5 compatível' },
    ],
    inStock: true,
  },
  {
    id: 11, name: 'Impressora Multifuncional Epson L3250', slug: 'impressora-epson-l3250',
    price: 899, rating: 4, reviews: 67,
    category: 'Impressoras', categorySlug: 'impressoras', emoji: '🖨️',
    shortDescription: 'Imprime, copia e digitaliza, Wi-Fi, tanque de tinta',
    description: 'Impressora multifuncional com sistema de tanque de tinta Epson EcoTank. Alta capacidade de impressão com baixíssimo custo por página. Wi-Fi integrado.',
    specs: [
      { key: 'Funções', value: 'Impressão, Cópia, Digitalização' },
      { key: 'Conectividade', value: 'Wi-Fi, USB' },
      { key: 'Resolução', value: '5760 x 1440 dpi' },
      { key: 'Velocidade (preto)', value: 'Até 10 ppm' },
      { key: 'Velocidade (cor)', value: 'Até 5 ppm' },
      { key: 'Capacidade (preto)', value: 'Até 7.500 páginas' },
    ],
    inStock: true,
  },
  {
    id: 12, name: 'Placa de Vídeo RX 6600 8GB', slug: 'placa-de-video-rx-6600',
    price: 1599, originalPrice: 1899, rating: 5, reviews: 44, badge: 'PROMOÇÃO',
    category: 'Componentes', categorySlug: 'componentes', emoji: '⚡',
    shortDescription: '8GB GDDR6, PCIe 4.0, Ray Tracing, AMD FreeSync',
    description: 'Placa de vídeo AMD Radeon RX 6600 com 8GB de memória GDDR6 para jogos em 1080p com altas taxas de quadros. Ray tracing e suporte a FreeSync.',
    specs: [
      { key: 'Memória', value: '8GB GDDR6' },
      { key: 'Barramento de Memória', value: '128-bit' },
      { key: 'Interface', value: 'PCIe 4.0 x8' },
      { key: 'Saídas', value: '1x HDMI 2.1, 3x DisplayPort 1.4' },
      { key: 'Ray Tracing', value: 'Sim (DirectX 12 Ultimate)' },
      { key: 'Consumo TDP', value: '132W' },
    ],
    inStock: true,
  },
]

export const categories = [
  { name: 'Notebooks', slug: 'notebooks', emoji: '💻', count: 2 },
  { name: 'Gamer', slug: 'gamer', emoji: '🖥️', count: 1 },
  { name: 'Periféricos', slug: 'perifericos', emoji: '🎧', count: 4 },
  { name: 'Impressoras', slug: 'impressoras', emoji: '🖨️', count: 1 },
  { name: 'Redes', slug: 'redes', emoji: '📡', count: 1 },
  { name: 'Componentes', slug: 'componentes', emoji: '⚡', count: 2 },
  { name: 'Acessórios', slug: 'acessorios', emoji: '🔌', count: 1 },
]
