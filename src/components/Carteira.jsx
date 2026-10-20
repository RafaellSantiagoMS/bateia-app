import { useMemo, useState } from 'react'
import { dataCurta, fmt, tomAcao } from '../lib/format'
import { Prioridade } from './ui'

/** Clientes ordenados pela reunião de maior prioridade de cada um. */
export default function Carteira({ contas, onAbrir }) {
  const [busca, setBusca] = useState('')
  const [visiveis, setVisiveis] = useState(40)

  const lista = useMemo(() => {
    const termo = busca.trim().toUpperCase()
    return termo ? contas.filter((c) => c.cliente.includes(termo)) : contas
  }, [contas, busca])

  const criticas = contas.filter((c) => c.faixa_prioridade === 'Crítica').length

  return (
    <section>
      <header className="pagina__topo">
        <h1>Carteira de clientes</h1>
        <p>
          {fmt(contas.length)} clientes. {fmt(criticas)} estão na faixa crítica: risco alto de
          cancelamento, muitas vezes junto com uma negociação em andamento.
        </p>
      </header>

      <input className="campo" type="search" placeholder="Buscar pelo código do cliente"
             value={busca} onChange={(e) => { setBusca(e.target.value); setVisiveis(40) }} />

      <div className="tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Prioridade</th><th>Cliente</th><th>Segmento</th><th>Ação sugerida</th>
              <th className="num">Reuniões</th><th className="num">Com risco alto</th><th>Última reunião</th>
            </tr>
          </thead>
          <tbody>
            {lista.slice(0, visiveis).map((c) => (
              <tr key={c.cliente} onClick={() => onAbrir(c)} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onAbrir(c) }}>
                <td><Prioridade valor={c.prioridade} faixa={c.faixa_prioridade} /></td>
                <td className="forte">{c.cliente}</td>
                <td>{c.segmento || 'Sem segmento'}{c.uf ? `, ${c.uf}` : ''}</td>
                <td className={`tom-${tomAcao(c.acao)}`}>{c.acao}</td>
                <td className="num">{c.reunioes.length}</td>
                <td className="num">{c.risco_alto || '–'}</td>
                <td>{dataCurta(c.ultima)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lista.length === 0 && <p className="vazio">Nenhum cliente com esse código. Confira o texto da busca.</p>}
      {visiveis < lista.length && (
        <button className="mais" onClick={() => setVisiveis(visiveis + 40)}>Mostrar mais clientes</button>
      )}
    </section>
  )
}
