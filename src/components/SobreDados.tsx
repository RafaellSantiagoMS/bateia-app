import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Contagem, Resumo } from "../types";
import { fmt } from "../lib/format";
import { Cabecalho } from "./ui";

interface GraficoProps {
  titulo: string;
  nota?: string;
  dados: Contagem;
  cor: string;
}

/** Barras horizontais com a contagem de cada categoria. */
const Grafico = ({ titulo, nota, dados, cor }: GraficoProps) => {
  const linhas = Object.entries(dados).map(([nome, valor]) => ({ nome, valor }));

  return (
    <section className="rounded-3xl bg-cartao p-6">
      <h3 className="font-semibold">{titulo}</h3>
      {nota && <p className="mt-1 text-xs text-suave">{nota}</p>}
      <ResponsiveContainer width="100%" height={linhas.length * 34 + 16}>
        <BarChart data={linhas} layout="vertical" margin={{ top: 16, right: 40, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="nome"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#97a3ba", fontSize: 12 }}
          />
          <Bar dataKey="valor" fill={cor} radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false}>
            <LabelList dataKey="valor" position="right" fill="#eef1f6" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

/** De onde vêm os números e até onde dá para confiar neles. */
export default function SobreDados({ resumo }: { resumo: Resumo }) {
  return (
    <section className="space-y-10">
      <Cabecalho titulo="Sobre os dados">
        {fmt(resumo.reunioes)} reuniões reais da TOTVS, anonimizadas, depois de tirar repetidas e
        transcrições vazias ({fmt(resumo.reunioes_arquivo)} no arquivo original).
      </Cabecalho>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <article className="space-y-4 leading-relaxed text-texto/90">
          <h2 className="titulo-largo text-2xl">Como cada reunião é analisada</h2>
          <p>
            A transcrição passa pela limpeza de texto, pela busca de produtos, concorrentes e sinais de
            cancelamento, e por um modelo de Regressão Logística treinado com o cadastro do CRM (lead ou
            cliente da base). O modelo dá a nota de oportunidade; as outras notas são regras que usam a
            própria base como referência.
          </p>
          <p>
            A prioridade soma 62% do risco de churn e 38% da oportunidade, porque perder um cliente custa
            mais que adiar uma venda. A ação sugerida vem dessas notas, nessa ordem: retenção, avançar a
            venda, cuidar do relacionamento, oferecer expansão, qualificar ou acompanhar.
          </p>

          <h2 className="titulo-largo pt-4 text-2xl">Até onde confiar</h2>
          <p>
            No teste, 62% das reuniões com oportunidade alta eram prospecções de verdade, contra 29% nas de
            oportunidade baixa. O alerta de churn é feito por palavras e não reconheceu os trechos de risco
            que o grupo marcou à mão: ele mostra quais reuniões ler, e não que o cliente vai cancelar. O
            índice de condução (ITA) ainda não foi comparado com resultado de venda.
          </p>
          <p className="text-sm text-suave">
            O mesmo cálculo está no notebook da Sprint 4 de Data Science e no protótipo em Streamlit; os
            números desta página são os mesmos de lá.
          </p>
        </article>

        <div className="grid content-start gap-4 md:grid-cols-2">
          <Grafico titulo="Ação sugerida" dados={resumo.acoes} cor="#e2b851" />
          <Grafico titulo="Produtos TOTVS citados" nota="Reuniões em que cada produto aparece" dados={resumo.produtos} cor="#ffe8ba" />
          <Grafico titulo="Segmento do cliente" nota={`${fmt(resumo.sem_segmento)} reuniões sem segmento no cadastro`} dados={resumo.segmentos} cor="#d5e5f7" />
          <Grafico titulo="Concorrentes citados" nota="Busca por palavra inteira" dados={resumo.concorrentes} cor="#f7cfc8" />
          <Grafico titulo="Sentimento" nota="Comparado com o padrão das outras reuniões" dados={resumo.sentimento} cor="#e6d8f9" />
          <Grafico titulo="Confiança da transcrição" dados={resumo.selo} cor="#cfebda" />
        </div>
      </div>
    </section>
  );
}
