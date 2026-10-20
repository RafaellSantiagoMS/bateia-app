// Formato dos dados gerados pelo pipeline de Data Science (public/data/bateia_data.json).
// A API Java devolve o mesmo formato.

export type Acao =
  | "Retenção"
  | "Avançar a venda"
  | "Cuidar do relacionamento"
  | "Oferecer expansão"
  | "Qualificar"
  | "Acompanhar";

export type FaixaPrioridade = "Crítica" | "Alta" | "Média" | "Baixa";
export type Selo = "Alta" | "Média" | "Baixa";

export interface Sinal {
  termo: string;
  vezes: number;
  trecho: string;
}

export interface Concorrente {
  nome: string;
  trecho: string;
}

export interface Reuniao {
  id: number;
  cliente: string | null;
  tipo_cliente: string | null;
  data: string;
  duracao: number | null;
  segmento: string | null;
  uf: string | null;
  resumo: string;
  produtos: string[];
  concorrentes: Concorrente[];
  valores: string[];
  sentimento: string;
  risco: number;
  nivel_risco: string;
  sinais: Sinal[];
  oportunidade: number;
  faixa_oportunidade: string;
  prioridade: number;
  faixa_prioridade: FaixaPrioridade;
  ita: number;
  criterios: Record<string, number>;
  conducao: string;
  selo: Selo;
  locutores: number;
  termos: string[];
  acao: Acao;
  recomendacao: string;
  avisos: string[];
}

export interface Conta {
  cliente: string;
  reunioes: number[];
  segmento: string | null;
  uf: string | null;
  ultima: string;
  prioridade: number;
  faixa_prioridade: FaixaPrioridade;
  acao: Acao;
  reuniao_prioritaria: number;
  risco_alto: number;
  oportunidade_max: number;
  ita_medio: number;
}

export type Contagem = Record<string, number>;

export interface Resumo {
  reunioes: number;
  reunioes_arquivo: number;
  clientes: number;
  acoes: Contagem;
  faixa_prioridade: Contagem;
  faixa_oportunidade: Contagem;
  nivel_risco: Contagem;
  sentimento: Contagem;
  selo: Contagem;
  segmentos: Contagem;
  produtos: Contagem;
  concorrentes: Contagem;
  ita_medio: number;
  sem_segmento: number;
}

export interface Painel {
  resumo: Resumo;
  contas: Conta[];
  reunioes: Reuniao[];
}
