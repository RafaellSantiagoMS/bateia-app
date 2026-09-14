import { useEffect } from 'react'
import { itaColor, faixaPrioridade } from '../lib/format'
import LinhaReuniao from './LinhaReuniao'

/**
 * Detalhe de um cliente: os sinais consolidados e as reuniões que os geraram.
 *
 * É o caminho que o gestor faz na prática: vê a conta no topo da fila,
 * abre, e quer saber de onde veio aquele alerta.
 */
export default function DetalheConta({ conta: c, reunioes, onFechar, onAbrirReuniao }) {
  useEffect(() => {
    const aoTeclar = (e) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const faixa = faixaPrioridade(c.prio)
  const daConta = reunioes
    .filter((r) => r.codt === c.codt)
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''))

  return (
    <div className="fundo" onClick={onFechar}>
      <aside className="painel" onClick={(e) => e.stopPropagation()}>
        <header className="painel__topo">
          <div>
            <div className="codigo">Cliente {c.codt}</div>
            <h2 className="painel__titulo">{c.seg || 'Segmento não informado'}</h2>
            <p className="painel__meta">
              {[c.uni, c.uf, c.faixa].filter(Boolean).join(' · ') || 'metadados não preenchidos'}
            </p>
            <div className="painel__tags">
              <span className={`tag tag--${faixa.tom}`}>prioridade {faixa.rotulo.toLowerCase()}</span>
              <span className="tag tag--neutro">{c.n} reuniões</span>
            </div>
          </div>
          <button className="fechar" onClick={onFechar} aria-label="Fechar detalhe">✕</button>
        </header>

        <section className="secao">
          <h3 className="secao__titulo">Sinais consolidados</h3>
          <div className="placares">
            <Placar rotulo="Risco de cancelamento" valor={c.churn} cor="var(--ferro)" />
            <Placar rotulo="Chance de venda" valor={c.opp} cor="var(--agua)" />
          </div>
          <p className="observacao">
            A nota média de condução dos vendedores neste cliente é{' '}
            <strong style={{ color: itaColor(c.ita) }}>{c.ita} de 100</strong>.
          </p>
        </section>

        <section className="secao">
          <h3 className="secao__titulo">Reuniões deste cliente</h3>
          <div className="lista">
            {daConta.slice(0, 8).map((r) => (
              <LinhaReuniao key={r.id} reuniao={r} onAbrir={onAbrirReuniao} />
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}

function Placar({ rotulo, valor, cor }) {
  return (
    <div className="placar">
      <div className="placar__rotulo">{rotulo}</div>
      <div className="placar__valor" style={{ color: cor }}>{valor}</div>
      <div className="barra">
        <div className="barra__preenchida" style={{ width: `${valor}%`, background: cor }} />
      </div>
    </div>
  )
}
