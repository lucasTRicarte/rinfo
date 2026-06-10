export type Role = 'cliente' | 'admin'

export type StatusPedido =
  | 'aguardando_pagamento'
  | 'pagamento_aprovado'
  | 'em_separacao'
  | 'enviado'
  | 'entregue'
  | 'cancelado'
  | 'reembolsado'

export type TipoEntrega =
  | 'entrega_cidade'
  | 'correios'
  | 'jadlog'
  | 'retirada_loja'

export interface Perfil {
  id: string
  nome: string | null
  telefone: string | null
  cpf: string | null
  role: Role
  criado_em: string
  atualizado_em: string
}

export interface Endereco {
  id: string
  perfil_id: string
  apelido: string | null
  cep: string
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  cidade: string
  estado: string
  principal: boolean
  criado_em: string
}

export interface Categoria {
  id: string
  nome: string
  slug: string
  descricao: string | null
  imagem_url: string | null
  pai_id: string | null
  ativo: boolean
  ordem: number
}

export interface Fornecedor {
  id: string
  nome: string
  cnpj: string | null
  contato: string | null
  email: string | null
  telefone: string | null
  site: string | null
  ativo: boolean
  criado_em: string
}

export interface Produto {
  id: string
  nome: string
  slug: string
  descricao: string | null
  descricao_curta: string | null
  preco: number
  preco_original: number | null
  sku: string | null
  categoria_id: string | null
  fornecedor_id: string | null
  estoque_fisico: number
  dropshipping: boolean
  ativo: boolean
  destaque: boolean
  peso_kg: number | null
  altura_cm: number | null
  largura_cm: number | null
  comprimento_cm: number | null
  criado_em: string
  atualizado_em: string
  // relações opcionais (quando buscado com joins)
  categoria?: Categoria
  imagens?: ProdutoImagem[]
  specs?: ProdutoSpec[]
}

export interface ProdutoImagem {
  id: string
  produto_id: string
  url: string
  alt: string | null
  principal: boolean
  ordem: number
}

export interface ProdutoSpec {
  id: string
  produto_id: string
  chave: string
  valor: string
  ordem: number
}

export interface Pedido {
  id: string
  numero: number
  perfil_id: string | null
  status: StatusPedido
  tipo_entrega: TipoEntrega | null
  endereco_entrega: Endereco | null
  subtotal: number
  frete: number
  desconto: number
  total: number
  observacao: string | null
  codigo_rastreio: string | null
  pagamento_id: string | null
  pagamento_metodo: string | null
  criado_em: string
  atualizado_em: string
  // relações opcionais
  itens?: PedidoItem[]
  perfil?: Perfil
}

export interface PedidoItem {
  id: string
  pedido_id: string
  produto_id: string | null
  nome_produto: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}
