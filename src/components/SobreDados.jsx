import { fmt } from '../lib/format'
import { Distribuicao } from './ui'

/** De onde vêm os números e até onde dá para confiar neles. */
export default function SobreDados({ resumo }) {
  return (
    <section>
      <header className="pagina__topo">
        <h1>Sobre os dados</h1>
        <p>
          {fmt(resumo.reunioes)} reuniões reais da TOTVS, anonimizadas, depois de tirar repetidas e
          transcrições vazias ({fmt(resumo.reunioes_arquivo)} no arquivo original).
        </p>
      </header>

      <div className="sobre">
        <article className="sobre__texto">
          <h2>Como cada reunião é analisada</h2>
          <p>
            A transcrição passa pela limpeza de texto, pela busca de produtos, concorrentes e sinais
            de cancelamento, e por um modelo de Regressão Logística treinado com o cadastro do CRM
            (lead ou cliente da base). O modelo dá a nota de oportunidade; as outras notas são regras
            que usam a própria base como referência.
          </p>
          <p>
            A prioridade soma 62% do risco de churn e 38% da oportunidade, porque perder um cliente
            custa mais que adiar uma venda. A ação sugerida vem dessas notas, nessa ordem: retenção,
            avançar a venda, cuidar do relacionamento, oferecer expansão, qualificar ou acompanhar.
          </p>

          <h2>Até onde confiar</h2>
          <p>
            No teste, 62% das reuniões com oportunidade alta eram prospecções de verdade, contra 29%
            nas de oportunidade baixa. O alerta de churn é feito por palavras e não reconheceu os
            trechos de risco que o grupo marcou à mão: use-o para saber quais reuniões ler, e não
            como certeza de cancelamento. O índice de condução (ITA) ainda não foi comparado com
            resultado de venda.
          </p>
          <p>
            O mesmo cálculo está no notebook da Sprint 4 de Data Science e no protótipo em Streamlit;
            os números desta página são os mesmos de lá.
          </p>
        </article>

        <div className="sobre__graficos">
          <Distribuicao titulo="Ação sugerida" dados={resumo.acoes} tom="tinta" />
          <Distribuicao titulo="Produtos TOTVS citados" nota="Reuniões em que cada produto aparece" dados={resumo.produtos} tom="ouro" />
          <Distribuicao titulo="Concorrentes citados" nota="Busca por palavra inteira: 'whatsapp' não conta mais como SAP" dados={resumo.concorrentes} tom="risco" />
          <Distribuicao titulo="Segmento do cliente" nota={`${fmt(resumo.sem_segmento)} reuniões sem segmento no cadastro`} dados={resumo.segmentos} tom="agua" />
          <Distribuicao titulo="Confiança da transcrição" dados={resumo.selo} tom="agua" />
          <Distribuicao titulo="Sentimento" nota="Comparado com o padrão das outras reuniões" dados={resumo.sentimento} tom="agua" />
        </div>
      </div>
    </section>
  )
}
