import { useMemo, useState } from "react";
import type { Reuniao } from "../types";
import { dataCurta, fmt } from "../lib/format";
import { AcaoTag, Cabecalho, MostrarMais, Vazio } from "./ui";

const POR_PAGINA = 30;
const FILTROS_INICIAIS = { busca: "", segmento: "", acao: "", selo: "" };

interface ReunioesProps {
  reunioes: Reuniao[];
  onAbrir: (reuniao: Reuniao) => void;
}

/** Todas as reuniões analisadas, da mais recente para a mais antiga. */
export default function Reunioes({ reunioes, onAbrir }: ReunioesProps) {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [visiveis, setVisiveis] = useState(POR_PAGINA);

  const segmentos = useMemo(
    () => [...new Set(reunioes.map((r) => r.segmento).filter(Boolean))].sort() as string[],
    [reunioes]
  );
  const acoes = useMemo(() => [...new Set(reunioes.map((r) => r.acao))].sort(), [reunioes]);

  const lista = useMemo(() => {
    const busca = filtros.busca.trim().toUpperCase();
    return reunioes
      .filter((r) => !filtros.segmento || r.segmento === filtros.segmento)
      .filter((r) => !filtros.acao || r.acao === filtros.acao)
      .filter((r) => !filtros.selo || r.selo === filtros.selo)
      .filter((r) => !busca || `${r.id} ${r.cliente ?? ""}`.toUpperCase().includes(busca))
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [reunioes, filtros]);

  const alterar = (campo: keyof typeof FILTROS_INICIAIS, valor: string) => {
    setFiltros({ ...filtros, [campo]: valor });
    setVisiveis(POR_PAGINA);
  };

  return (
    <section className="space-y-8">
      <Cabecalho titulo="Reuniões">
        {fmt(reunioes.length)} reuniões analisadas. Clique em uma para ver os trechos da conversa por trás
        de cada nota.
      </Cabecalho>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          className="campo"
          placeholder="Número da reunião ou cliente"
          aria-label="Buscar reunião"
          value={filtros.busca}
          onChange={(e) => alterar("busca", e.target.value)}
        />
        <select className="campo" aria-label="Segmento" value={filtros.segmento} onChange={(e) => alterar("segmento", e.target.value)}>
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="campo" aria-label="Ação" value={filtros.acao} onChange={(e) => alterar("acao", e.target.value)}>
          <option value="">Todas as ações</option>
          {acoes.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select className="campo" aria-label="Confiança" value={filtros.selo} onChange={(e) => alterar("selo", e.target.value)}>
          <option value="">Qualquer confiança</option>
          <option value="Alta">Confiança alta</option>
          <option value="Média">Confiança média</option>
          <option value="Baixa">Confiança baixa</option>
        </select>
      </div>

      <p className="text-sm text-suave">{fmt(lista.length)} reuniões encontradas</p>

      {lista.length === 0 ? (
        <Vazio texto="Nenhuma reunião com esses filtros. Tire um deles para ampliar a busca." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-linha bg-cartao">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-linha text-xs text-suave">
              <tr>
                <th className="px-5 py-4 font-medium">Reunião</th>
                <th className="px-5 py-4 font-medium">Data</th>
                <th className="px-5 py-4 font-medium">Segmento</th>
                <th className="px-5 py-4 text-right font-medium">Oportunidade</th>
                <th className="px-5 py-4 text-right font-medium">Risco</th>
                <th className="px-5 py-4 text-right font-medium">ITA</th>
                <th className="px-5 py-4 font-medium">Confiança</th>
                <th className="px-5 py-4 font-medium">Ação sugerida</th>
              </tr>
            </thead>
            <tbody>
              {lista.slice(0, visiveis).map((r) => (
                <tr
                  key={r.id}
                  tabIndex={0}
                  onClick={() => onAbrir(r)}
                  onKeyDown={(e) => e.key === "Enter" && onAbrir(r)}
                  className="cursor-pointer border-b border-linha/60 last:border-none hover:bg-cartao-claro"
                >
                  <td className="px-5 py-3.5 font-semibold">{r.id}</td>
                  <td className="px-5 py-3.5 text-suave">{dataCurta(r.data)}</td>
                  <td className="px-5 py-3.5 text-suave">{r.segmento || "Sem segmento"}</td>
                  <td className="px-5 py-3.5 text-right">{r.oportunidade}</td>
                  <td className="px-5 py-3.5 text-right">{r.risco}</td>
                  <td className="px-5 py-3.5 text-right">{r.ita}</td>
                  <td className="px-5 py-3.5 text-suave">{r.selo}</td>
                  <td className="px-5 py-3.5">
                    <AcaoTag acao={r.acao} />
                  </td>
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
