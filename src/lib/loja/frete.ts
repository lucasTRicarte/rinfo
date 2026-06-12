// Ponto de origem: Ricarte Informática — Campina Grande/PB
const UF_LOJA = 'PB'

const regiaoUF: Record<string, number> = {
  SP: 1,
  RJ: 2, MG: 2, ES: 2, PR: 2,
  SC: 3, RS: 3, GO: 3, DF: 3, MS: 3, BA: 3,
  MT: 4, TO: 4, SE: 4, AL: 4, PE: 4, PB: 4, RN: 4, CE: 4, PI: 4, MA: 4, RO: 4,
  PA: 5, AM: 5, RR: 5, AC: 5, AP: 5,
}

export type OpcaoFrete = {
  tipo: 'pac' | 'sedex' | 'local'
  nome: string
  descricao: string
  preco: number
  prazo: string
}

export type DadosCep = {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

export function isEntregaLocal(dados: DadosCep): boolean {
  return dados.uf === 'PB' && dados.localidade.toLowerCase().trim() === 'campina grande'
}

export function calcularFreteLocal(pesoKg: number): OpcaoFrete {
  const peso = Math.max(pesoKg || 0.5, 0.1)
  // R$15 até 5 kg; acima: +R$2/kg
  const preco = peso <= 5 ? 15 : Math.round((15 + (peso - 5) * 2) * 100) / 100
  return { tipo: 'local', nome: 'Entrega Local', descricao: 'Campina Grande/PB', preco, prazo: '1 a 2 dias úteis' }
}

export async function buscarCep(cep: string): Promise<DadosCep | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return { logradouro: data.logradouro ?? '', bairro: data.bairro ?? '', localidade: data.localidade, uf: data.uf }
  } catch {
    return null
  }
}

export function calcularFrete(ufDestino: string, pesoKg: number): OpcaoFrete[] {
  const zona = Math.abs((regiaoUF[UF_LOJA] ?? 4) - (regiaoUF[ufDestino] ?? 3))
  const peso = Math.max(pesoKg || 0.5, 0.3)

  const tiers = [
    { pac: { base: 15, kg: 3,  prazo: '4 a 8 dias úteis'   }, sedex: { base: 25, kg: 6,  prazo: '1 a 2 dias úteis' } },
    { pac: { base: 20, kg: 4,  prazo: '6 a 12 dias úteis'  }, sedex: { base: 35, kg: 8,  prazo: '2 a 3 dias úteis' } },
    { pac: { base: 28, kg: 5,  prazo: '10 a 15 dias úteis' }, sedex: { base: 50, kg: 10, prazo: '3 a 5 dias úteis' } },
    { pac: { base: 38, kg: 6,  prazo: '12 a 20 dias úteis' }, sedex: { base: 70, kg: 13, prazo: '5 a 7 dias úteis' } },
  ]

  const t = tiers[Math.min(zona, tiers.length - 1)]
  return [
    { tipo: 'pac',   nome: 'PAC',   descricao: 'Econômico', preco: Math.round((t.pac.base   + peso * t.pac.kg)   * 100) / 100, prazo: t.pac.prazo   },
    { tipo: 'sedex', nome: 'SEDEX', descricao: 'Expresso',  preco: Math.round((t.sedex.base + peso * t.sedex.kg) * 100) / 100, prazo: t.sedex.prazo },
  ]
}
