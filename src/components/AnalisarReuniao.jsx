import { useState } from 'react'
import { API_URL, analisarTranscricao } from '../lib/api'
import AnaliseReuniao from './AnaliseReuniao'

/**
 * Análise de uma transcrição nova.
 * Depende da API, porque o modelo roda em Python, fora do navegador.
 */
export default function AnalisarReuniao() {
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      setResultado(await analisarTranscricao(texto))
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section>
      <header className="pagina__topo">
        <h1>Analisar reunião</h1>
        <p>Cole a transcrição de uma reunião, com as marcações [LOCUTOR n], para ver a recomendação na hora.</p>
      </header>

      {!API_URL && (
        <p className="aviso aviso--info">
          A análise de uma reunião nova precisa da API do Bateia ligada, porque o modelo roda no
          servidor. Enquanto ela não está no ar, a mesma análise pode ser feita no protótipo em
          Streamlit da Sprint 4 de Data Science (arquivo app_bateia.py).
        </p>
      )}

      <form className="formulario" onSubmit={enviar}>
        <label htmlFor="transcricao">Transcrição</label>
        <textarea id="transcricao" rows={10} value={texto} onChange={(e) => setTexto(e.target.value)}
                  placeholder="[LOCUTOR 1]: Bom dia, como está o uso do Protheus?" />
        <button type="submit" disabled={!API_URL || enviando || texto.trim().length < 50}>
          {enviando ? 'Analisando…' : 'Analisar reunião'}
        </button>
        {erro && <p className="erro">{erro}</p>}
      </form>

      {resultado && <AnaliseReuniao r={resultado} />}
    </section>
  )
}
