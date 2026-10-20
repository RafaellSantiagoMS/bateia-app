import { dataCurta, fmt, tomAcao } from '../lib/format'
import { Barra, Prioridade, Trecho } from './ui'

/** "Retenção: acionar o gestor..." -> "Acionar o gestor..." */
function detalheAcao(recomendacao) {
  const texto = recomendacao.split(': ')[1] || ''
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const EXPLICA_SELO = {
  Alta: 'A transcrição separou bem quem falou, então os indicadores são confiáveis.',
  Média: 'A fala foi dividida em mais locutores que o normal. Confirme os pontos principais.',
  Baixa: 'A transcrição quebrou a fala em locutores demais (ou não marcou nenhum). Trate os indicadores como hipótese.',
}

/**
 * Tudo o que o pipeline encontrou em uma reunião.
 * Usado no painel lateral e na tela de análise de uma reunião nova.
 */
export default function AnaliseReuniao({ r }) {
  const meta = [r.cliente && `Cliente ${r.cliente}`, r.segmento, r.uf, dataCurta(r.data),
    r.duracao ? `${r.duracao} min` : null].filter(Boolean).join(', ')

  return (
    <div className="analise">
      <header className="analise__topo">
        {r.id && <h2>Reunião {r.id}</h2>}
        {meta && <p className="analise__meta">{meta}</p>}
        {r.tipo_cliente && <p className="analise__meta">No CRM: {r.tipo_cliente.toLowerCase()}</p>}
      </header>

      <section className={`acao acao--${tomAcao(r.acao)}`}>
        <h3>{r.acao}</h3>
        <p>{detalheAcao(r.recomendacao)}</p>
        {r.avisos.map((a) => <p key={a} className="acao__aviso">{a}</p>)}
      </section>

      <p className="analise__resumo">{r.resumo}</p>

      <section className="numeros">
        <div>
          <span className="numeros__rotulo">Prioridade</span>
          <Prioridade valor={r.prioridade} faixa={r.faixa_prioridade} />
        </div>
        <div>
          <span className="numeros__rotulo">Oportunidade</span>
          <strong>{r.oportunidade}</strong> <span>{r.faixa_oportunidade}</span>
        </div>
        <div>
          <span className="numeros__rotulo">Risco de churn</span>
          <strong>{r.risco}</strong> <span>{r.nivel_risco}</span>
        </div>
        <div>
          <span className="numeros__rotulo">Sentimento</span>
          <strong className="numeros__texto">{r.sentimento}</strong>
        </div>
      </section>

      {(r.sinais.length > 0 || r.concorrentes.length > 0) && (
        <section className="bloco">
          <h3>O que acendeu os alertas</h3>
          {r.sinais.map((s) => (
            <Trecho key={s.termo} texto={s.trecho}
                    origem={`Sinal de churn: "${s.termo}", ${s.vezes} ${s.vezes === 1 ? 'vez' : 'vezes'} na reunião`} />
          ))}
          {r.concorrentes.map((c) => (
            <Trecho key={c.nome} texto={c.trecho} origem={`Concorrente citado: ${c.nome}`} />
          ))}
        </section>
      )}

      <section className="bloco">
        <h3>Condução da reunião (ITA {r.ita} de 100)</h3>
        <dl className="criterios">
          {Object.entries(r.criterios).map(([nome, nota]) => (
            <div key={nome}>
              <dt>{nome}</dt>
              <dd><Barra valor={nota} tom={nota < 50 ? 'risco' : 'agua'} /><span>{nota}</span></dd>
            </div>
          ))}
        </dl>
        <p className="nota">{r.conducao}</p>
      </section>

      <section className="bloco bloco--colunas">
        <div>
          <h3>Produtos citados</h3>
          <p>{r.produtos.length ? r.produtos.join(', ') : 'Nenhum produto TOTVS citado.'}</p>
        </div>
        <div>
          <h3>Valores falados</h3>
          <p>{r.valores.length ? r.valores.join(', ') : 'Nenhum valor em reais.'}</p>
        </div>
      </section>

      <section className="bloco">
        <h3>Assuntos da conversa</h3>
        <p className="termos">{r.termos.map((t) => <span key={t}>{t}</span>)}</p>
      </section>

      <section className="bloco">
        <h3>Qualidade da transcrição: confiança {r.selo.toLowerCase()}</h3>
        <p className="nota">{fmt(r.locutores)} locutores diferentes. {EXPLICA_SELO[r.selo]}</p>
      </section>
    </div>
  )
}
