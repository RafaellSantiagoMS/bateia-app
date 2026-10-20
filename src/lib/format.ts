import type { Acao, FaixaPrioridade, Reuniao } from "../types";

export const fmt = (n: number) => n.toLocaleString("pt-BR");

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-03-18" -> "18 mar 2026" */
export function dataCurta(iso: string | null) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${Number(dia)} ${MESES[Number(mes) - 1]} ${ano}`;
}

/** As ações que pedem trabalho do vendedor, na ordem das regras do notebook. */
export const ACOES_DA_FILA: Acao[] = [
  "Retenção",
  "Avançar a venda",
  "Cuidar do relacionamento",
  "Oferecer expansão",
  "Qualificar",
];

/** Cada ação tem um bloco de cor e uma frase curta. */
export const ESTILO_ACAO: Record<Acao, { fundo: string; frase: string }> = {
  "Retenção": { fundo: "bg-rosa", frase: "Risco alto de perder o cliente" },
  "Avançar a venda": { fundo: "bg-manteiga", frase: "Chance alta de fechar negócio" },
  "Cuidar do relacionamento": { fundo: "bg-lilas", frase: "Sinais de atenção e tom negativo" },
  "Oferecer expansão": { fundo: "bg-menta", frase: "Cliente pedindo mais módulos" },
  "Qualificar": { fundo: "bg-ceu", frase: "Interesse que ainda precisa de prazo e orçamento" },
  "Acompanhar": { fundo: "bg-cartao-claro", frase: "Nada pede ação agora" },
};

export const COR_PRIORIDADE: Record<FaixaPrioridade, string> = {
  "Crítica": "text-critica",
  "Alta": "text-alta",
  "Média": "text-media",
  "Baixa": "text-baixa",
};

/** O trecho da conversa que melhor explica a recomendação. */
export function trechoPrincipal(r: Reuniao) {
  const sinal = r.sinais.find((s) => s.trecho);
  if (sinal) return sinal.trecho;
  const concorrente = r.concorrentes.find((c) => c.trecho);
  return concorrente ? concorrente.trecho : "";
}

/** "Retenção: acionar o gestor..." -> "Acionar o gestor..." */
export function detalheAcao(recomendacao: string) {
  const texto = recomendacao.split(": ")[1] || "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const plural = (n: number, um: string, varios: string) => `${fmt(n)} ${n === 1 ? um : varios}`;
