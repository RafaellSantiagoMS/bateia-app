import { itaColor, seloClasse, sentimentoClasse } from '../lib/format'

/**
 * Uma reunião na lista.
 *
 * É um <button> e não uma <div> de propósito: a linha inteira é clicável,
 * então precisa ser alcançável pelo teclado e anunciada como ação
 * por leitores de tela. Trocar por div quebraria as duas coisas.
 */
export default function LinhaReuniao({ reuniao, onAbrir }) {
  const r = reuniao

  return (
    <button className="linha" onClick={() => onAbrir(r)}>
      <div className="linha__info">
        <div className="linha__titulo">
          <span className="codigo">#{r.id}</span>
          <span className="linha__segmento">{r.seg || 'segmento não informado'}</span>

          {r.churn.risco && <span className="tag tag--negativo">risco de cancelamento</span>}
          {r.opp.existe && <span className="tag tag--positivo">oportunidade</span>}
        </div>

        <div className="linha__meta">
          <span>{r.data}</span>
          <span>{r.dur} min</span>
          <span>{r.formato}</span>
          <span className={seloClasse(r.conf)}>confiança {r.conf.toLowerCase()}</span>
        </div>
      </div>

      <div className="linha__direita">
        <span className={sentimentoClasse(r.sent)}>{r.sent}</span>
        <div className="ita">
          <div className="ita__valor" style={{ color: itaColor(r.ita) }}>{r.ita}</div>
          <div className="ita__rotulo">ITA</div>
        </div>
      </div>
    </button>
  )
}
