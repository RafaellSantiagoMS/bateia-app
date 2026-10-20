import { useMemo, useState } from 'react'
import { dataCurta, fmt, tomAcao, trechoPrincipal } from '../lib/format'
import { Prioridade, Trecho } from './ui'

const ORDEM_ACOES = ['Retenção', 'Avançar a venda', 'Cuidar do relacionamento', 'Oferecer expansão', 'Qualificar']

/** A fila do vendedor: reuniões que pedem uma ação, da maior para a menor prioridade. */
export default function FilaHoje({ reunioes, acoes, onAbrir }) {
  const [acao, setAcao] = useState('')
  const [visiveis, setVisiveis] = useState(25)

  const fila = useMemo(() => reunioes
    .filter((r) => r.acao !== 'Acompanhar' && (!acao || r.acao === acao))
    .sort((a, b) => b.prioridade - a.prioridade || b.risco - a.risco),
  [reunioes, acao])

  const totalComAcao = ORDEM_ACOES.reduce((soma, a) => soma + (acoes[a] || 0), 0)

  function escolher(a) {
    setAcao(a)
    setVisiveis(25)
  }

  return (
    <section>
      <header className="pagina__topo">
        <h1>Fila de hoje</h1>
        <p>
          {fmt(totalComAcao)} reuniões pedem uma ação. A lista começa pelas de maior prioridade,
          que soma o risco de perder o cliente e a chance de venda.
        </p>
      </header>

      <div className="filtro-acoes" role="group" aria-label="Filtrar por ação">
        <button className={!acao ? 'ativo' : ''} onClick={() => escolher('')}>
          Todas <span>{fmt(totalComAcao)}</span>
        </button>
        {ORDEM_ACOES.map((a) => (
          <button key={a} className={`${acao === a ? 'ativo' : ''} tom-${tomAcao(a)}`} onClick={() => escolher(a)}>
            {a} <span>{fmt(acoes[a] || 0)}</span>
          </button>
        ))}
      </div>

      <ol className="fila">
        {fila.slice(0, visiveis).map((r) => (
          <li key={r.id}>
            <button className="fila__item" onClick={() => onAbrir(r)}>
              <Prioridade valor={r.prioridade} faixa={r.faixa_prioridade} />
              <div className="fila__corpo">
                <p className="fila__acao">
                  <strong className={`tom-${tomAcao(r.acao)}`}>{r.acao}</strong>
                  <span>{r.cliente ? `Cliente ${r.cliente}` : `Reunião ${r.id}`}, {r.segmento || 'sem segmento'}, {dataCurta(r.data)}</span>
                </p>
                <p className="fila__resumo">{r.resumo}</p>
                <Trecho texto={trechoPrincipal(r)} />
              </div>
            </button>
          </li>
        ))}
      </ol>

      {visiveis < fila.length && (
        <button className="mais" onClick={() => setVisiveis(visiveis + 25)}>
          Mostrar mais {Math.min(25, fila.length - visiveis)} de {fmt(fila.length - visiveis)} restantes
        </button>
      )}
    </section>
  )
}
