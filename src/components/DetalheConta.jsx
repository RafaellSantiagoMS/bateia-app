import { dataCurta, tomAcao } from '../lib/format'
import { Prioridade } from './ui'

/** Painel de um cliente: suas reuniões, da mais recente para a mais antiga. */
export default function DetalheConta({ conta, reunioes, onAbrirReuniao }) {
  const daConta = reunioes
    .filter((r) => conta.reunioes.includes(r.id))
    .sort((a, b) => b.data.localeCompare(a.data))

  return (
    <div className="analise">
      <header className="analise__topo">
        <h2>Cliente {conta.cliente}</h2>
        <p className="analise__meta">
          {[conta.segmento || 'Sem segmento', conta.uf, `${daConta.length} ${daConta.length === 1 ? 'reunião' : 'reuniões'}`].filter(Boolean).join(', ')}
        </p>
      </header>

      <section className={`acao acao--${tomAcao(conta.acao)}`}>
        <h3>{conta.acao}</h3>
        <p>
          Ação da reunião de maior prioridade deste cliente.
          {conta.risco_alto > 1 && ` O alerta de risco alto se repetiu em ${conta.risco_alto} reuniões.`}
        </p>
      </section>

      <section className="bloco">
        <h3>Reuniões</h3>
        <ul className="lista-reunioes">
          {daConta.map((r) => (
            <li key={r.id}>
              <button onClick={() => onAbrirReuniao(r)}>
                <Prioridade valor={r.prioridade} faixa={r.faixa_prioridade} />
                <span>
                  <strong>{dataCurta(r.data)}</strong>
                  <span className={`tom-${tomAcao(r.acao)}`}>{r.acao}</span>
                  <span className="nota">{r.resumo}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
