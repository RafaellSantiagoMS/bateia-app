import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Conta } from "../types";
import { dataCurta, fmt } from "../lib/format";
import { AcaoTag, Cabecalho, MostrarMais, Prioridade, Vazio } from "./ui";

const POR_PAGINA = 30;

interface CarteiraProps {
  contas: Conta[];
  onAbrir: (conta: Conta) => void;
}

/** Clientes ordenados pela reunião de maior prioridade de cada um. */
export default function Carteira({ contas, onAbrir }: CarteiraProps) {
  const [busca, setBusca] = useState("");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);

  const lista = useMemo(() => {
    const termo = busca.trim().toUpperCase();
    return termo ? contas.filter((c) => c.cliente.includes(termo)) : contas;
  }, [contas, busca]);

  const criticas = contas.filter((c) => c.faixa_prioridade === "Crítica").length;
  const repetidas = contas.filter((c) => c.risco_alto > 1).length;

  return (
    <section className="space-y-8">
      <Cabecalho titulo="Carteira">
        {fmt(contas.length)} clientes. {fmt(criticas)} estão na faixa crítica e {fmt(repetidas)} tiveram o
        alerta de risco alto em mais de uma reunião.
      </Cabecalho>

      <label className="relative block max-w-sm">
        <span className="sr-only">Buscar cliente</span>
        <Search size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-suave" aria-hidden />
        <input
          type="search"
          className="campo w-full pl-11"
          placeholder="Buscar pelo código do cliente"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setVisiveis(POR_PAGINA);
          }}
        />
      </label>

      {lista.length === 0 ? (
        <Vazio texto="Nenhum cliente com esse código. Confira o texto da busca." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-linha bg-cartao">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-linha text-xs text-suave">
              <tr>
                <th className="px-5 py-4 font-medium">Prioridade</th>
                <th className="px-5 py-4 font-medium">Cliente</th>
                <th className="px-5 py-4 font-medium">Segmento</th>
                <th className="px-5 py-4 font-medium">Ação sugerida</th>
                <th className="px-5 py-4 text-right font-medium">Reuniões</th>
                <th className="px-5 py-4 text-right font-medium">Risco alto</th>
                <th className="px-5 py-4 font-medium">Última reunião</th>
              </tr>
            </thead>
            <tbody>
              {lista.slice(0, visiveis).map((c) => (
                <tr
                  key={c.cliente}
                  tabIndex={0}
                  onClick={() => onAbrir(c)}
                  onKeyDown={(e) => e.key === "Enter" && onAbrir(c)}
                  className="cursor-pointer border-b border-linha/60 last:border-none hover:bg-cartao-claro"
                >
                  <td className="px-5 py-3">
                    <Prioridade valor={c.prioridade} faixa={c.faixa_prioridade} />
                  </td>
                  <td className="px-5 py-3 font-semibold">{c.cliente}</td>
                  <td className="px-5 py-3 text-suave">
                    {c.segmento || "Sem segmento"}
                    {c.uf ? `, ${c.uf}` : ""}
                  </td>
                  <td className="px-5 py-3">
                    <AcaoTag acao={c.acao} />
                  </td>
                  <td className="px-5 py-3 text-right">{c.reunioes.length}</td>
                  <td className="px-5 py-3 text-right">{c.risco_alto || "–"}</td>
                  <td className="px-5 py-3 text-suave">{dataCurta(c.ultima)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MostrarMais restantes={lista.length - visiveis} onClick={() => setVisiveis(visiveis + POR_PAGINA)} />
    </section>
  );
}
