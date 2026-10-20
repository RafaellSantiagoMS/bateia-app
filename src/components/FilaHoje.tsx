import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Acao, Contagem, Reuniao } from "../types";
import { ACOES_DA_FILA, ESTILO_ACAO, dataCurta, fmt, trechoPrincipal } from "../lib/format";
import { AcaoTag, Cabecalho, MostrarMais, Prioridade, Trecho } from "./ui";

const POR_PAGINA = 20;

interface FilaHojeProps {
  reunioes: Reuniao[];
  acoes: Contagem;
  onAbrir: (reuniao: Reuniao) => void;
}

/** A fila do vendedor: reuniões que pedem uma ação, da maior para a menor prioridade. */
export default function FilaHoje({ reunioes, acoes, onAbrir }: FilaHojeProps) {
  const [acao, setAcao] = useState<Acao | null>(null);
  const [visiveis, setVisiveis] = useState(POR_PAGINA);

  const fila = useMemo(
    () =>
      reunioes
        .filter((r) => r.acao !== "Acompanhar" && (!acao || r.acao === acao))
        .sort((a, b) => b.prioridade - a.prioridade || b.risco - a.risco),
    [reunioes, acao]
  );

  const total = ACOES_DA_FILA.reduce((soma, a) => soma + (acoes[a] || 0), 0);

  const escolher = (nova: Acao | null) => {
    setAcao(nova === acao ? null : nova);
    setVisiveis(POR_PAGINA);
  };

  return (
    <section className="space-y-10">
      <Cabecalho titulo="Fila de hoje">
        {fmt(total)} reuniões pedem uma ação. A lista começa pelas de maior prioridade, que junta o
        risco de perder o cliente com a chance de venda.
      </Cabecalho>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3" role="group" aria-label="Filtrar por ação">
        <button
          onClick={() => escolher(null)}
          aria-pressed={!acao}
          className={`flex flex-col items-start rounded-3xl border p-5 text-left transition ${
            !acao ? "border-ouro bg-cartao" : "border-linha bg-cartao opacity-70 hover:opacity-100"
          }`}
        >
          <span className="titulo-largo block text-3xl sm:text-4xl text-ouro">{fmt(total)}</span>
          <span className="mt-3 block font-semibold">Todas as ações</span>
          <span className="mt-1 block text-xs text-suave">Tudo o que pede contato</span>
        </button>

        {ACOES_DA_FILA.map((a) => (
          <button
            key={a}
            onClick={() => escolher(a)}
            aria-pressed={acao === a}
            className={`flex flex-col items-start rounded-3xl p-5 text-left text-tinta transition ${ESTILO_ACAO[a].fundo} ${
              acao === a ? "ring-4 ring-ouro ring-offset-4 ring-offset-fundo" : acao ? "opacity-50 hover:opacity-90" : ""
            }`}
          >
            <span className="titulo-largo block text-3xl sm:text-4xl">{fmt(acoes[a] || 0)}</span>
            <span className="mt-3 block font-semibold">{a}</span>
            <span className="mt-1 block text-xs text-tinta/70">{ESTILO_ACAO[a].frase}</span>
          </button>
        ))}
      </div>

      <ol className="space-y-3">
        {fila.slice(0, visiveis).map((r) => (
          <li key={r.id}>
            <button
              onClick={() => onAbrir(r)}
              className="flex w-full items-start gap-4 rounded-2xl bg-cartao p-5 text-left transition-colors hover:bg-cartao-claro sm:gap-6"
            >
              <Prioridade valor={r.prioridade} faixa={r.faixa_prioridade} />

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <AcaoTag acao={r.acao} />
                  <span className="text-sm text-suave">
                    {r.cliente ? `Cliente ${r.cliente}` : `Reunião ${r.id}`}, {r.segmento || "sem segmento"},{" "}
                    {dataCurta(r.data)}
                  </span>
                </div>
                <p className="text-[15px]">{r.resumo}</p>
                <Trecho texto={trechoPrincipal(r)} />
              </div>

              <ChevronRight className="mt-1 hidden shrink-0 text-suave sm:block" size={20} aria-hidden />
            </button>
          </li>
        ))}
      </ol>

      <MostrarMais restantes={fila.length - visiveis} onClick={() => setVisiveis(visiveis + POR_PAGINA)} />
    </section>
  );
}
