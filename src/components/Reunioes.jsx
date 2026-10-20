import { useMemo, useState } from 'react'
import { dataCurta, fmt, tomAcao } from '../lib/format'

const FILTROS_INICIAIS = { busca: '', segmento: '', selo: '', acao: '' }

/** Todas as reuniões analisadas, da mais recente para a mais antiga. */
export default function Reunioes({ reunioes, onAbrir }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const [visiveis, setVisiveis] = useState(40)

  const segmentos = useMemo(() => [...new Set(reunioes.map((r) => r.segmento).filter(Boolean))].sort(), [reunioes])
  const acoes = useMemo(() => [...new Set(reunioes.map((r) => r.acao))].sort(), [reunioes])

  const lista = useMemo(() => {
    const busca = filtros.busca.trim().toUpperCase()
    return reunioes
      .filter((r) => !filtros.segmento || r.segmento === filtros.segmento)
      .filter((r) => !filtros.selo || r.selo === filtros.selo)
      .filter((r) => !filtros.acao || r.acao === filtros.acao)
      .filter((r) => !busca || `${r.id} ${r.cliente}`.toUpperCase().includes(busca))
      .sort((a, b) => b.data.localeCompare(a.data))
  }, [reunioes, filtros])

  function alterar(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor })
    setVisiveis(40)
  }

  return (
    <section>
      <header className="pagina__topo">
        <h1>Reuniões</h1>
        <p>{fmt(reunioes.length)} reuniões analisadas. Clique em uma para ver os trechos da conversa por trás de cada indicador.</p>
      </header>

      <div className="filtros">
        <input className="campo" type="search" placeholder="Número da reunião ou cliente"
               value={filtros.busca} onChange={(e) => alterar('busca', e.target.value)} />
        <select className="campo" value={filtros.segmento} onChange={(e) => alterar('segmento', e.target.value)}>
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="campo" value={filtros.acao} onChange={(e) => alterar('acao', e.target.value)}>
          <option value="">Todas as ações</option>
          {acoes.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select className="campo" value={filtros.selo} onChange={(e) => alterar('selo', e.target.value)}>
          <option value="">Qualquer confiança</option>
          <option value="Alta">Confiança alta</option>
          <option value="Média">Confiança média</option>
          <option value="Baixa">Confiança baixa</option>
        </select>
      </div>

      <p className="contagem">{fmt(lista.length)} reuniões</p>

      <div className="tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Reunião</th><th>Data</th><th>Segmento</th><th className="num">Oportunidade</th>
              <th className="num">Risco</th><th className="num">ITA</th><th>Confiança</th><th>Ação sugerida</th>
            </tr>
          </thead>
          <tbody>
            {lista.slice(0, visiveis).map((r) => (
              <tr key={r.id} onClick={() => onAbrir(r)} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onAbrir(r) }}>
                <td className="forte">{r.id}</td>
                <td>{dataCurta(r.data)}</td>
                <td>{r.segmento || 'Sem segmento'}</td>
                <td className="num">{r.oportunidade}</td>
                <td className="num">{r.risco}</td>
                <td className="num">{r.ita}</td>
                <td>{r.selo}</td>
                <td className={`tom-${tomAcao(r.acao)}`}>{r.acao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lista.length === 0 && (
        <p className="vazio">Nenhuma reunião com esses filtros. Tire um deles para ampliar a busca.</p>
      )}
      {visiveis < lista.length && (
        <button className="mais" onClick={() => setVisiveis(visiveis + 40)}>Mostrar mais reuniões</button>
      )}
    </section>
  )
}
