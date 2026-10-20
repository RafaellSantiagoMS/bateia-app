import type { Reuniao, Resumo } from "../types";
import { dataCurta, fmt, trechoPrincipal } from "../lib/format";
import type { Pagina } from "./Topo";
import Peneira from "./Peneira";
import { AcaoTag, Prioridade } from "./ui";

// O fluxo pedido pelo Challenge, com o que o Bateia faz em cada etapa.
const ETAPAS = [
  { nome: "Transcrição", texto: "A reunião gravada chega como texto, com as falas marcadas por locutor." },
  { nome: "Processamento", texto: "Limpeza do texto e busca de produtos, concorrentes e sinais de cancelamento." },
  { nome: "Modelo", texto: "A Regressão Logística dá a chance de a conversa virar venda." },
  { nome: "Indicadores", texto: "Risco de churn, oportunidade, sentimento, condução e prioridade, de 0 a 100." },
  { nome: "Recomendação", texto: "A ação para o vendedor, com o trecho da fala que explica o alerta." },
];

interface InicioProps {
  resumo: Resumo;
  reunioes: Reuniao[];
  onTrocar: (pagina: Pagina) => void;
  onAbrir: (reuniao: Reuniao) => void;
}

export default function Inicio({ resumo, reunioes, onTrocar, onAbrir }: InicioProps) {
  const comAcao = resumo.reunioes - (resumo.acoes["Acompanhar"] || 0);
  const maisUrgente = reunioes.reduce((a, b) => (b.prioridade > a.prioridade ? b : a));

  return (
    <div className="space-y-24 lg:space-y-32">
      <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-8">
          <p className="text-sm text-suave">Challenge 2026 FIAP e TOTVS</p>
          <h1 className="titulo-largo text-5xl sm:text-6xl xl:text-7xl">O que importa fica no fundo da bateia.</h1>
          <p className="max-w-lg text-lg leading-relaxed text-suave">
            O garimpeiro balança a bateia até o cascalho sair e o ouro assentar. O Bateia faz o mesmo com
            as reuniões comerciais da TOTVS: lê cada transcrição e mostra quais clientes precisam de
            contato hoje, e por quê.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onTrocar("fila")} className="rounded-full bg-ouro px-6 py-3 font-semibold text-tinta hover:bg-manteiga">
              Abrir a fila de hoje
            </button>
            <button onClick={() => onTrocar("carteira")} className="rounded-full border border-linha px-6 py-3 font-semibold hover:border-ouro">
              Ver a carteira
            </button>
          </div>
        </div>

        <Peneira reunioes={reunioes} onAbrir={onAbrir} />
      </section>

      <section className="border-y border-linha py-14">
        <p className="titulo-largo max-w-5xl text-3xl sm:text-4xl lg:text-5xl">
          Das {fmt(resumo.reunioes)} reuniões, {fmt(comAcao)} pedem uma ação. {fmt(resumo.acoes["Retenção"] || 0)} são
          clientes com risco alto de cancelar e {fmt(resumo.acoes["Avançar a venda"] || 0)} estão prontas para avançar a venda.
        </p>
      </section>

      <section className="space-y-10">
        <h2 className="titulo-largo text-3xl sm:text-4xl">Do que foi dito à próxima ação</h2>
        <ol className="grid gap-8 md:grid-cols-5 md:gap-5">
          {ETAPAS.map((etapa, i) => (
            <li key={etapa.nome} className="space-y-3 border-t-2 border-ouro pt-5">
              <p className="text-sm text-ouro">{i + 1}</p>
              <h3 className="font-semibold">{etapa.nome}</h3>
              <p className="text-sm leading-relaxed text-suave">{etapa.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col justify-between gap-10 rounded-[2rem] bg-manteiga p-8 text-tinta sm:p-10">
          <div className="space-y-4">
            <p className="text-sm font-medium opacity-70">Para o vendedor</p>
            <h2 className="titulo-largo text-4xl">Fila de hoje</h2>
            <p className="max-w-sm leading-relaxed">
              As reuniões que pedem contato, da mais urgente para a menos urgente, cada uma com a ação e o
              trecho da conversa que a justifica.
            </p>
          </div>
          <button onClick={() => onTrocar("fila")} className="self-start rounded-full bg-tinta px-6 py-3 font-semibold text-texto">
            Abrir a fila
          </button>
        </article>

        <article className="flex flex-col justify-between gap-10 rounded-[2rem] bg-lilas p-8 text-tinta sm:p-10">
          <div className="space-y-4">
            <p className="text-sm font-medium opacity-70">Para o gestor</p>
            <h2 className="titulo-largo text-4xl">Carteira</h2>
            <p className="max-w-sm leading-relaxed">
              Os {fmt(resumo.clientes)} clientes ordenados pela reunião mais urgente de cada um, com os que
              repetiram o alerta de risco em destaque.
            </p>
          </div>
          <button onClick={() => onTrocar("carteira")} className="self-start rounded-full bg-tinta px-6 py-3 font-semibold text-texto">
            Ver a carteira
          </button>
        </article>
      </section>

      <section className="space-y-8">
        <h2 className="titulo-largo text-3xl sm:text-4xl">A reunião mais urgente agora</h2>
        <button
          onClick={() => onAbrir(maisUrgente)}
          className="grid w-full gap-8 rounded-[2rem] border border-linha p-8 text-left transition-colors hover:border-ouro sm:p-10 lg:grid-cols-[auto_1fr]"
        >
          <Prioridade valor={maisUrgente.prioridade} faixa={maisUrgente.faixa_prioridade} />
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <AcaoTag acao={maisUrgente.acao} />
              <span className="text-sm text-suave">
                Cliente {maisUrgente.cliente}, {dataCurta(maisUrgente.data)}
              </span>
            </div>
            <blockquote className="max-w-3xl text-xl leading-relaxed italic sm:text-2xl">“{trechoPrincipal(maisUrgente)}”</blockquote>
            <p className="text-suave">{maisUrgente.recomendacao}</p>
          </div>
        </button>
      </section>
    </div>
  );
}
