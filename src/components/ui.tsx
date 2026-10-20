// Peças pequenas usadas por várias telas.
import type { ReactNode } from "react";
import type { Acao, FaixaPrioridade } from "../types";
import { COR_PRIORIDADE, ESTILO_ACAO } from "../lib/format";

interface CabecalhoProps {
  titulo: string;
  children?: ReactNode;
}

/** Título grande da página com o texto de apoio ao lado. */
export const Cabecalho = ({ titulo, children }: CabecalhoProps) => (
  <header className="grid gap-4 border-b border-linha pb-8 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-end">
    <h1 className="titulo-largo text-4xl sm:text-5xl lg:text-6xl">{titulo}</h1>
    {children && <div className="text-sm leading-relaxed text-suave">{children}</div>}
  </header>
);

interface PrioridadeProps {
  valor: number;
  faixa: FaixaPrioridade;
}

/** Nota de prioridade (0 a 100) com a faixa embaixo. */
export const Prioridade = ({ valor, faixa }: PrioridadeProps) => (
  <div className={`flex w-14 shrink-0 flex-col items-center ${COR_PRIORIDADE[faixa]}`}>
    <span className="titulo-largo text-2xl">{valor}</span>
    <span className="text-[11px] font-medium">{faixa}</span>
  </div>
);

/** Etiqueta da ação recomendada, com a cor do bloco da ação. */
export const AcaoTag = ({ acao }: { acao: Acao }) => (
  <span
    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
      acao === "Acompanhar" ? "bg-cartao-claro text-suave" : `${ESTILO_ACAO[acao].fundo} text-tinta`
    }`}
  >
    {acao}
  </span>
);

interface TrechoProps {
  texto: string;
  origem?: string;
}

/** Trecho real da conversa: a evidência por trás de um alerta. */
export const Trecho = ({ texto, origem }: TrechoProps) => {
  if (!texto) return null;

  return (
    <figure className="border-l-2 border-ouro pl-4">
      <blockquote className="text-sm italic leading-relaxed text-texto/90">“{texto}”</blockquote>
      {origem && <figcaption className="mt-1 text-xs text-suave">{origem}</figcaption>}
    </figure>
  );
};

interface BarraProps {
  valor: number;
  maximo?: number;
  cor?: string;
}

/** Barra horizontal de 0 até o máximo. */
export const Barra = ({ valor, maximo = 100, cor = "bg-ouro" }: BarraProps) => (
  <div className="h-2 flex-1 overflow-hidden rounded-full bg-linha">
    <div className={`h-full rounded-full ${cor}`} style={{ width: `${Math.max(2, (100 * valor) / maximo)}%` }} />
  </div>
);

interface MostrarMaisProps {
  restantes: number;
  onClick: () => void;
}

export const MostrarMais = ({ restantes, onClick }: MostrarMaisProps) => {
  if (restantes <= 0) return null;

  return (
    <button
      onClick={onClick}
      className="mx-auto mt-6 block rounded-full border border-linha px-6 py-3 text-sm font-medium hover:border-ouro hover:text-ouro"
    >
      Mostrar mais ({restantes.toLocaleString("pt-BR")} restantes)
    </button>
  );
};

export const Vazio = ({ texto }: { texto: string }) => (
  <p className="rounded-2xl border border-dashed border-linha p-8 text-center text-sm text-suave">{texto}</p>
);
