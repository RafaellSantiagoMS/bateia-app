import type { Conta, Reuniao } from "../types";
import { ESTILO_ACAO, dataCurta, plural } from "../lib/format";
import { AcaoTag, Prioridade } from "./ui";

interface DetalheContaProps {
  conta: Conta;
  reunioes: Reuniao[];
  onAbrirReuniao: (reuniao: Reuniao) => void;
}

/** Painel de um cliente: suas reuniões, da mais recente para a mais antiga. */
export default function DetalheConta({ conta, reunioes, onAbrirReuniao }: DetalheContaProps) {
  const daConta = reunioes
    .filter((r) => conta.reunioes.includes(r.id))
    .sort((a, b) => b.data.localeCompare(a.data));

  const corAcao = conta.acao === "Acompanhar" ? "bg-cartao text-texto" : `${ESTILO_ACAO[conta.acao].fundo} text-tinta`;

  return (
    <div className="space-y-6">
      <header className="pr-10">
        <h2 className="titulo-largo text-3xl">Cliente {conta.cliente}</h2>
        <p className="mt-2 text-sm text-suave">
          {[conta.segmento || "Sem segmento", conta.uf, plural(daConta.length, "reunião", "reuniões")]
            .filter(Boolean)
            .join(", ")}
        </p>
      </header>

      <section className={`rounded-3xl p-6 ${corAcao}`}>
        <p className="text-xs font-medium opacity-70">Ação para este cliente</p>
        <h3 className="titulo-largo mt-1 text-2xl">{conta.acao}</h3>
        <p className="mt-2">
          Vem da reunião de maior prioridade.
          {conta.risco_alto > 1 && ` O alerta de risco alto se repetiu em ${conta.risco_alto} reuniões.`}
        </p>
      </section>

      <ul className="space-y-3">
        {daConta.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => onAbrirReuniao(r)}
              className="flex w-full items-start gap-4 rounded-2xl bg-cartao p-4 text-left hover:bg-cartao-claro"
            >
              <Prioridade valor={r.prioridade} faixa={r.faixa_prioridade} />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <strong className="text-sm">{dataCurta(r.data)}</strong>
                  <AcaoTag acao={r.acao} />
                </div>
                <p className="text-sm text-suave">{r.resumo}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
