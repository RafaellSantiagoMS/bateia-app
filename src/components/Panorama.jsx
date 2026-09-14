import { fmt } from '../lib/format'

/**
 * Panorama da base: os números gerais e a distribuição das reuniões.
 *
 * Os gráficos são feitos com divs e CSS, sem biblioteca externa —
 * para barras horizontais isso basta, e evita 50 kB de dependência.
 */
export default function Panorama({ agg }) {
  const segmentos = Object.entries(agg.seg_dist).slice(0, 7)
  const concorrentes = Object.entries(agg.conc_dist)
  const produtos = Object.entries(agg.prod_dist).slice(0, 6)

  return (
    <>
      <p className="seccao__intro">
        Toda a base de transcrições da TOTVS processada de ponta a ponta:{' '}
        {fmt(agg.total)} reuniões de {fmt(agg.contas)} clientes diferentes.
      </p>

      <div className="graficos">
        <Cartao
          titulo="Reuniões por segmento"
          nota={`${fmt(agg.sem_metadados)} reuniões não têm segmento preenchido na base`}
        >
          <Barras itens={segmentos} cor="var(--ouro)" />
        </Cartao>

        <Cartao
          titulo="Confiança na transcrição"
          nota="Baseada em quantos locutores o sistema separou em cada reunião"
        >
          <Barras
            itens={[
              ['Alta', agg.conf_dist.Alta || 0],
              ['Média', agg.conf_dist['Média'] || 0],
              ['Baixa', agg.conf_dist.Baixa || 0],
            ]}
            cores={['var(--agua)', 'var(--ouro)', 'var(--ferro)']}
            total={agg.total}
          />
        </Cartao>

        <Cartao titulo="Como o cliente reagiu" nota="Tom geral detectado em cada conversa">
          <Barras
            itens={[
              ['Positivo', agg.sent_dist.Positivo || 0],
              ['Misto', agg.sent_dist.Misto || 0],
              ['Negativo', agg.sent_dist.Negativo || 0],
            ]}
            cores={['var(--agua)', 'var(--areia-fraca)', 'var(--ferro)']}
            total={agg.total}
          />
        </Cartao>

        <Cartao titulo="Concorrentes citados" nota="Menções encontradas no texto das reuniões">
          {concorrentes.length > 0
            ? <Barras itens={concorrentes} cor="var(--ferro)" />
            : <p className="observacao">Nenhum concorrente identificado na base.</p>}
        </Cartao>

        <Cartao titulo="Assuntos mais recorrentes" nota="Produtos e áreas citados nas conversas">
          <Barras itens={produtos} cor="var(--agua)" />
        </Cartao>

        <Cartao titulo="Uma correção que mudou o resultado">
          <p className="observacao">
            Uma busca simples encontra “sap” em 636 reuniões e sugere que a SAP seria a maior
            concorrente. Quase todas, porém, são a palavra <strong>whatsapp</strong>. Passando a
            buscar a palavra inteira, o número cai para zero e os concorrentes reais aparecem:{' '}
            {concorrentes.map(([nome]) => nome).join(', ') || '—'}.
          </p>
        </Cartao>
      </div>
    </>
  )
}

function Cartao({ titulo, nota, children }) {
  return (
    <div className="cartao">
      <h3 className="cartao__titulo">{titulo}</h3>
      {nota && <p className="cartao__nota">{nota}</p>}
      {children}
    </div>
  )
}

/**
 * Barras horizontais proporcionais ao maior valor da lista.
 * Se "total" for passado, mostra porcentagem em vez do número absoluto.
 */
function Barras({ itens, cor, cores, total }) {
  const maior = Math.max(...itens.map(([, v]) => v), 1)

  return (
    <div className="barras">
      {itens.map(([rotulo, valor], i) => (
        <div key={rotulo} className="barras__linha">
          <span className="barras__rotulo" title={rotulo}>{rotulo}</span>
          <div className="barra">
            <div
              className="barra__preenchida"
              style={{ width: `${(valor / maior) * 100}%`, background: cores ? cores[i] : cor }}
            />
          </div>
          <span className="barras__valor">
            {total ? `${Math.round((valor / total) * 100)}%` : fmt(valor)}
          </span>
        </div>
      ))}
    </div>
  )
}
