import { useMemo, useState } from 'react'
import { fmt, itaColor, faixaPrioridade } from '../lib/format'

/**
 * Painel do gestor: as contas da carteira ordenadas por prioridade.
 *
 * A prioridade já vem calculada do pipeline (risco × oportunidade).
 * Aqui a tela só filtra, ordena e apresenta.
 */
export default function PainelGestor({ contas, onAbrirConta }) {
  const [segmento, setSegmento] = useState('')
  const [unidade, setUnidade] = useState('')
  const [visiveis, setVisiveis] = useState(15)

  const segmentos = useMemo(
    () => [...new Set(contas.map((c) => c.seg).filter(Boolean))].sort(),
    [contas]
  )
  const unidades = useMemo(
    () => [...new Set(contas.map((c) => c.uni).filter(Boolean))].sort(),
    [contas]
  )

  const filtradas = useMemo(() => {
    return contas.filter((c) => {
      if (segmento && c.seg !== segmento) return false
      if (unidade && c.uni !== unidade) return false
      return true
    })
  }, [contas, segmento, unidade])

  function trocarFiltro(setter) {
    return (e) => { setter(e.target.value); setVisiveis(15) }
  }

  return (
    <>
      <p className="seccao__intro">
        Cada cliente da base, ordenado por quem precisa de atenção primeiro. A posição combina
        o risco de cancelamento com a chance de venda detectados nas conversas.
      </p>

      <div className="filtros">
        <select className="campo" value={segmento} onChange={trocarFiltro(setSegmento)}>
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="campo" value={unidade} onChange={trocarFiltro(setUnidade)}>
          <option value="">Todas as unidades</option>
          {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>

        <span className="contagem">{fmt(filtradas.length)} clientes</span>
      </div>

      {filtradas.length === 0 ? (
        <p className="vazio">Nenhum cliente com esses filtros. Remova um deles para ampliar a busca.</p>
      ) : (
        <>
          <div className="lista">
            {filtradas.slice(0, visiveis).map((c, i) => (
              <LinhaConta key={c.codt} conta={c} posicao={i + 1} onAbrir={onAbrirConta} />
            ))}
          </div>

          {visiveis < filtradas.length && (
            <button className="mais" onClick={() => setVisiveis(visiveis + 15)}>
              Mostrar mais clientes
            </button>
          )}
        </>
      )}
    </>
  )
}

function LinhaConta({ conta: c, posicao, onAbrir }) {
  const faixa = faixaPrioridade(c.prio)

  return (
    <button className="linha" onClick={() => onAbrir(c)}>
      <span className="posicao">{posicao}</span>

      <div className="linha__info">
        <div className="linha__titulo">
          <span className="codigo">{c.codt}</span>
          <span className="linha__segmento">{c.seg || 'segmento não informado'}</span>
          {c.n > 1 && <span className="tag tag--neutro">{c.n} reuniões</span>}
        </div>
        <div className="linha__meta">
          <span>{c.uni || 'unidade não informada'}</span>
          {c.uf && <span>{c.uf}</span>}
          <span>última em {c.ultima}</span>
        </div>
      </div>

      <div className="linha__sinais">
        {c.churn >= 50 && <span className="tag tag--negativo">risco {c.churn}</span>}
        {c.opp >= 45 && <span className="tag tag--positivo">venda {c.opp}</span>}
        {c.churn < 50 && c.opp < 45 && <span className="tag tag--neutro">estável</span>}
      </div>

      <div className="linha__nota">
        <span style={{ color: itaColor(c.ita) }}>{c.ita}</span>
        <small>condução</small>
      </div>

      <div className="linha__prioridade">
        <span className={`tag tag--${faixa.tom}`}>{faixa.rotulo}</span>
        <div className="barra">
          <div className="barra__preenchida"
               style={{ width: `${c.prio}%`, background: faixa.cor }} />
        </div>
      </div>
    </button>
  )
}
