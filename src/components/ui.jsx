// Peças pequenas reaproveitadas pelas telas.
import { tomPrioridade } from '../lib/format'

/** Nota de prioridade com a faixa. É o que ordena a fila do vendedor. */
export function Prioridade({ valor, faixa }) {
  return (
    <div className={`prioridade prioridade--${tomPrioridade(faixa)}`}>
      <span className="prioridade__valor">{valor}</span>
      <span className="prioridade__faixa">{faixa}</span>
    </div>
  )
}

/** Trecho real da conversa: a evidência por trás de um alerta. */
export function Trecho({ texto, origem }) {
  if (!texto) return null
  return (
    <figure className="trecho">
      <blockquote>{texto}</blockquote>
      {origem && <figcaption>{origem}</figcaption>}
    </figure>
  )
}

/** Barra horizontal simples, de 0 a máximo. */
export function Barra({ valor, maximo = 100, tom = 'tinta' }) {
  const largura = maximo > 0 ? Math.max(2, (100 * valor) / maximo) : 0
  return (
    <div className="barra">
      <div className={`barra__cheia barra__cheia--${tom}`} style={{ width: `${largura}%` }} />
    </div>
  )
}

/** Lista de contagens em barras, usada na tela Sobre os dados. */
export function Distribuicao({ titulo, nota, dados, tom }) {
  const itens = Object.entries(dados)
  const maior = Math.max(...itens.map(([, v]) => v), 1)
  return (
    <section className="distribuicao">
      <h3>{titulo}</h3>
      {nota && <p className="nota">{nota}</p>}
      <dl>
        {itens.map(([rotulo, valor]) => (
          <div key={rotulo} className="distribuicao__linha">
            <dt>{rotulo}</dt>
            <dd>
              <Barra valor={valor} maximo={maior} tom={tom} />
              <span>{valor}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function Aviso({ texto }) {
  return <div className="aviso">{texto}</div>
}
