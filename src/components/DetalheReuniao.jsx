import { useEffect } from 'react'
import { itaColor, seloClasse, sentimentoClasse } from '../lib/format'

/**
 * Painel lateral com tudo que o Bateia extraiu de uma reunião.
 *
 * Recebe a reunião e uma função para fechar. Quando não há reunião
 * selecionada, o App simplesmente não renderiza este componente.
 */
export default function DetalheReuniao({ reuniao: r, onFechar }) {
  // Fechar com Esc é o comportamento esperado de qualquer painel sobreposto.
  // O return remove o listener quando o painel some — sem isso, cada
  // abertura deixaria um listener órfão preso na memória.
  useEffect(() => {
    const aoTeclar = (e) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const metadados = [r.data, `${r.dur} min`, r.formato, r.uni, r.uf].filter(Boolean)

  return (
    // Clicar no fundo escuro fecha. O stopPropagation abaixo impede que um
    // clique dentro do painel borbulhe até o fundo e feche sem querer.
    <div className="fundo" onClick={onFechar}>
      <aside className="painel" onClick={(e) => e.stopPropagation()}>
        <header className="painel__topo">
          <div>
            <div className="codigo">
              Reunião #{r.id}{r.codt ? ` · cliente ${r.codt}` : ''}
            </div>
            <h2 className="painel__titulo">{r.seg || 'Segmento não informado'}</h2>
            <p className="painel__meta">{metadados.join(' · ')}</p>
            <div className="painel__tags">
              <span className={seloClasse(r.conf)}>confiança {r.conf.toLowerCase()}</span>
              <span className={sentimentoClasse(r.sent)}>cliente {r.sent.toLowerCase()}</span>
            </div>
          </div>
          <button className="fechar" onClick={onFechar} aria-label="Fechar detalhe">✕</button>
        </header>

        <Secao titulo="Resumo da conversa">
          <p className="observacao">{resumir(r)}</p>
        </Secao>

        <Secao titulo="Como o vendedor conduziu">
          <div className="nota">
            <Medidor score={r.ita} />
            <div className="nota__criterios">
              {r.brk.map((c) => (
                <div key={c.label} className="criterio">
                  <div className="criterio__topo">
                    <span>{c.label}</span>
                    <span style={{ color: itaColor(c.v) }}>{c.v}</span>
                  </div>
                  <div className="barra">
                    <div className="barra__preenchida"
                         style={{ width: `${c.v}%`, background: itaColor(c.v) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="recomendacao">{r.rec}</p>
        </Secao>

        {r.prod.length > 0 && (
          <Secao titulo="Produtos citados na conversa">
            <div className="fichas">
              {r.prod.map((p) => <span key={p} className="ficha">{p}</span>)}
            </div>
          </Secao>
        )}

        {r.conc.length > 0 && (
          <Secao titulo="Concorrentes mencionados">
            {r.conc.map((c) => (
              <div key={c.nome} className="bloco">
                <span className="tag tag--negativo">{c.nome}</span>
                {c.trecho && <blockquote className="citacao citacao--risco">{c.trecho}</blockquote>}
              </div>
            ))}
          </Secao>
        )}

        {r.churn.risco && (
          <Secao titulo={`Sinais de risco de cancelamento · ${r.churn.score} de 100`}>
            {r.churn.sinais.length > 0 ? (
              r.churn.sinais.map((s, i) => (
                <div key={i} className="bloco">
                  <strong className="sinal">{s.tipo}</strong>
                  {s.trecho && (
                    <blockquote className="citacao citacao--risco">{s.trecho}</blockquote>
                  )}
                </div>
              ))
            ) : (
              <p className="observacao">
                Os sinais apareceram de forma difusa na conversa, sem um trecho isolável.
              </p>
            )}
          </Secao>
        )}

        {r.opp.existe && (
          <Secao titulo={`Chance de venda · ${r.opp.score} de 100`}>
            {r.opp.prod.length > 0 && (
              <div className="fichas">
                {r.opp.prod.map((p) => (
                  <span key={p} className="ficha ficha--ganho">{p}</span>
                ))}
              </div>
            )}
            {r.opp.trecho && <blockquote className="citacao citacao--ganho">{r.opp.trecho}</blockquote>}
          </Secao>
        )}

        {r.orc.length > 0 && (
          <Secao titulo="Valores discutidos">
            <div className="fichas">
              {r.orc.map((o, i) => (
                <span key={i} className="ficha ficha--valor">{o.valor}</span>
              ))}
            </div>
          </Secao>
        )}

        <Secao titulo="Qualidade da transcrição">
          <p className="observacao">{explicarConfianca(r)}</p>
        </Secao>
      </aside>
    </div>
  )
}

function Secao({ titulo, children }) {
  return (
    <section className="secao">
      <h3 className="secao__titulo">{titulo}</h3>
      {children}
    </section>
  )
}

/** Medidor circular da nota, desenhado em SVG puro (sem biblioteca). */
function Medidor({ score, tamanho = 108 }) {
  const raio = tamanho / 2 - 9
  const volta = 2 * Math.PI * raio
  // O quanto falta para fechar o círculo: é assim que se "preenche" um arco.
  const restante = volta * (1 - score / 100)

  return (
    <svg width={tamanho} height={tamanho} className="medidor" role="img"
         aria-label={`Nota de condução: ${score} de 100`}>
      <circle cx={tamanho / 2} cy={tamanho / 2} r={raio}
              fill="none" stroke="var(--limo)" strokeWidth="8" />
      <circle cx={tamanho / 2} cy={tamanho / 2} r={raio}
              fill="none" stroke={itaColor(score)} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={volta} strokeDashoffset={restante}
              transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`} />
      <text x="50%" y="52%" textAnchor="middle" className="medidor__numero">{score}</text>
      <text x="50%" y="68%" textAnchor="middle" className="medidor__rotulo">de 100</text>
    </svg>
  )
}

/** Frase de abertura montada a partir dos sinais encontrados. */
function resumir(r) {
  const partes = []
  if (r.prod.length) partes.push(`falou sobre ${r.prod.slice(0, 3).join(', ')}`)
  if (r.conc.length) partes.push(`citou ${r.conc.map((c) => c.nome).join(' e ')}`)
  if (r.churn.risco) partes.push('deu sinais de que pode cancelar')
  if (r.opp.existe) partes.push('demonstrou interesse em comprar mais')

  const corpo = partes.length
    ? partes.join('; ')
    : 'não apareceram sinais fortes de risco nem de oportunidade'

  return `Reunião de ${r.dur} minutos por ${r.formato.toLowerCase()}. Nesta conversa, o cliente ${corpo}.`
}

function explicarConfianca(r) {
  const base = `A transcrição registrou ${r.loc} locutores diferentes. `
  if (r.conf === 'Baixa') {
    return base + 'Isso indica que a fala de uma mesma pessoa foi quebrada em vários pedaços pelo sistema de transcrição. Trate os pontos acima como hipóteses e confirme com o cliente antes de agir.'
  }
  if (r.conf === 'Média') {
    return base + 'A qualidade é aceitável, mas alguns pontos podem precisar de confirmação.'
  }
  return base + 'A transcrição está limpa, então os pontos acima são confiáveis.'
}
