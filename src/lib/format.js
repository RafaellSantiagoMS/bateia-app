// Funções pequenas de apresentação, isoladas dos componentes.
// Ficam aqui porque são usadas em vários lugares e são fáceis de testar.

export const fmt = (n) => Number(n).toLocaleString('pt-BR')

/** Cor da nota de condução (ITA) por faixa: bom / mediano / precisa de atenção. */
export function itaColor(score) {
  if (score >= 75) return 'var(--ouro)'
  if (score >= 60) return 'var(--agua)'
  return 'var(--ferro)'
}

/** Classe do selo de confiança da transcrição. */
export function seloClasse(nivel) {
  if (nivel === 'Alta') return 'selo selo--alta'
  if (nivel === 'Média') return 'selo selo--media'
  return 'selo selo--baixa'
}

export function sentimentoClasse(rotulo) {
  if (rotulo === 'Positivo') return 'tag tag--positivo'
  if (rotulo === 'Negativo') return 'tag tag--negativo'
  return 'tag tag--neutro'
}

/**
 * Traduz o score de prioridade (0-100) em uma faixa legível.
 * O gestor não precisa do número; precisa saber se corre ou não.
 */
export function faixaPrioridade(prio) {
  if (prio >= 75) return { rotulo: 'Crítica', tom: 'negativo', cor: 'var(--ferro)' }
  if (prio >= 55) return { rotulo: 'Alta', tom: 'ouro', cor: 'var(--ouro)' }
  if (prio >= 35) return { rotulo: 'Média', tom: 'positivo', cor: 'var(--agua)' }
  return { rotulo: 'Baixa', tom: 'neutro', cor: 'var(--areia-fraca)' }
}
