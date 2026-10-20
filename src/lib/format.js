// Funções pequenas de apresentação, usadas por vários componentes.

export const fmt = (n) => Number(n).toLocaleString('pt-BR')

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** "2026-03-18" -> "18 mar 2026" */
export function dataCurta(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return `${Number(dia)} ${MESES[Number(mes) - 1]} ${ano}`
}

/** Tom de cada faixa de prioridade, usado para a cor no CSS. */
export function tomPrioridade(faixa) {
  return { Crítica: 'critica', Alta: 'alta', Média: 'media', Baixa: 'baixa' }[faixa] || 'baixa'
}

/** Ação recomendada -> tom de cor. Risco em vermelho, venda em ouro, o resto neutro. */
export function tomAcao(acao) {
  if (acao === 'Retenção' || acao === 'Cuidar do relacionamento') return 'risco'
  if (acao === 'Avançar a venda' || acao === 'Oferecer expansão') return 'ouro'
  return 'neutro'
}

/**
 * O trecho da conversa que melhor explica a recomendação:
 * primeiro o sinal de risco, depois o concorrente, senão nada.
 */
export function trechoPrincipal(r) {
  const sinal = r.sinais.find((s) => s.trecho)
  if (sinal) return sinal.trecho
  const conc = r.concorrentes.find((c) => c.trecho)
  return conc ? conc.trecho : ''
}
