import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import type { Reuniao, Selo } from "../types";
import { COR_PRIORIDADE, ESTILO_ACAO, dataCurta, detalheAcao, plural } from "../lib/format";
import { Barra, Trecho } from "./ui";

const EXPLICA_SELO: Record<Selo, string> = {
  Alta: "A transcrição separou bem quem falou, então as notas são confiáveis.",
  Média: "A fala foi dividida em mais locutores que o normal. Confirme os pontos principais.",
  Baixa: "A transcrição quebrou a fala em locutores demais (ou não marcou nenhum). Trate as notas como hipótese.",
};

const Bloco = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <section className="space-y-3 border-t border-linha pt-6">
    <h3 className="font-semibold">{titulo}</h3>
    {children}
  </section>
);

const Numero = ({ rotulo, valor, faixa, cor = "" }: { rotulo: string; valor: ReactNode; faixa?: string; cor?: string }) => (
  <div className="rounded-2xl bg-cartao p-4">
    <p className="text-xs text-suave">{rotulo}</p>
    <p className={`titulo-largo mt-2 text-2xl ${cor}`}>{valor}</p>
    {faixa && <p className="mt-1 text-xs text-suave">{faixa}</p>}
  </div>
);

/** Tudo o que o pipeline encontrou em uma reunião. */
export default function AnaliseReuniao({ r }: { r: Reuniao }) {
  const meta = [
    r.cliente && `Cliente ${r.cliente}`,
    r.segmento,
    r.uf,
    dataCurta(r.data),
    r.duracao && `${r.duracao} min`,
  ]
    .filter(Boolean)
    .join(", ");

  const corAcao = r.acao === "Acompanhar" ? "bg-cartao text-texto" : `${ESTILO_ACAO[r.acao].fundo} text-tinta`;

  return (
    <div className="space-y-6">
      <header className="pr-10">
        {r.id && <h2 className="titulo-largo text-3xl">Reunião {r.id}</h2>}
        {meta && <p className="mt-2 text-sm text-suave">{meta}</p>}
        {r.tipo_cliente && <p className="text-sm text-suave">No CRM: {r.tipo_cliente.toLowerCase()}</p>}
      </header>

      <section className={`rounded-3xl p-6 ${corAcao}`}>
        <p className="text-xs font-medium opacity-70">Ação recomendada</p>
        <h3 className="titulo-largo mt-1 text-2xl">{r.acao}</h3>
        <p className="mt-2">{detalheAcao(r.recomendacao)}</p>
        {r.avisos.map((aviso) => (
          <p key={aviso} className="mt-3 flex gap-2 text-sm font-medium">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            {aviso}
          </p>
        ))}
      </section>

      <p>{r.resumo}</p>

      <div className="grid grid-cols-2 gap-3">
        <Numero rotulo="Prioridade" valor={r.prioridade} faixa={r.faixa_prioridade} cor={COR_PRIORIDADE[r.faixa_prioridade]} />
        <Numero rotulo="Oportunidade" valor={r.oportunidade} faixa={r.faixa_oportunidade} />
        <Numero rotulo="Risco de churn" valor={r.risco} faixa={r.nivel_risco} />
        <Numero rotulo="Sentimento" valor={r.sentimento} />
      </div>

      {(r.sinais.length > 0 || r.concorrentes.length > 0) && (
        <Bloco titulo="O que acendeu os alertas">
          <div className="space-y-4">
            {r.sinais.map((s) => (
              <Trecho key={s.termo} texto={s.trecho} origem={`Sinal de churn "${s.termo}", ${plural(s.vezes, "vez", "vezes")} na reunião`} />
            ))}
            {r.concorrentes.map((c) => (
              <Trecho key={c.nome} texto={c.trecho} origem={`Concorrente citado: ${c.nome}`} />
            ))}
          </div>
        </Bloco>
      )}

      <Bloco titulo={`Condução da reunião: ITA ${r.ita} de 100`}>
        <dl className="space-y-3">
          {Object.entries(r.criterios).map(([nome, nota]) => (
            <div key={nome} className="grid grid-cols-[minmax(0,12rem)_1fr_2rem] items-center gap-3 text-sm">
              <dt className="text-suave">{nome}</dt>
              <dd className="contents">
                <Barra valor={nota} cor={nota < 50 ? "bg-critica" : "bg-ouro"} />
                <span className="text-right">{nota}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-suave">{r.conducao}</p>
      </Bloco>

      <div className="grid gap-6 border-t border-linha pt-6 sm:grid-cols-2">
        <div>
          <h3 className="font-semibold">Produtos citados</h3>
          <p className="mt-2 text-sm text-suave">{r.produtos.length ? r.produtos.join(", ") : "Nenhum produto TOTVS citado."}</p>
        </div>
        <div>
          <h3 className="font-semibold">Valores falados</h3>
          <p className="mt-2 text-sm text-suave">{r.valores.length ? r.valores.join(", ") : "Nenhum valor em reais."}</p>
        </div>
      </div>

      <Bloco titulo="Assuntos da conversa">
        <ul className="flex flex-wrap gap-2">
          {r.termos.map((t) => (
            <li key={t} className="rounded-full border border-linha px-3 py-1 text-sm">
              {t}
            </li>
          ))}
        </ul>
      </Bloco>

      <Bloco titulo={`Qualidade da transcrição: confiança ${r.selo.toLowerCase()}`}>
        <p className="text-sm text-suave">
          {plural(r.locutores, "locutor", "locutores diferentes")}. {EXPLICA_SELO[r.selo]}
        </p>
      </Bloco>
    </div>
  );
}
