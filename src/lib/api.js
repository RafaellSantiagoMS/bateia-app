// Fonte dos dados do site.
//
// Sem API configurada, o site lê o arquivo gerado pelo pipeline da Sprint 4
// (public/data/bateia_data.json). Quando a API Java estiver no ar, basta criar
// um arquivo .env com VITE_API_URL=http://localhost:8080 e o site passa a
// buscar os dados nela, sem mudar nenhum componente.

export const API_URL = import.meta.env.VITE_API_URL || ''

export async function buscarPainel() {
  const url = API_URL ? `${API_URL}/painel` : `${import.meta.env.BASE_URL}data/bateia_data.json`
  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`Não foi possível carregar os dados (erro ${resposta.status}).`)
  return resposta.json()
}

/** Envia uma transcrição nova para análise. Só funciona com a API ligada. */
export async function analisarTranscricao(transcricao) {
  const resposta = await fetch(`${API_URL}/reunioes/analise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcricao }),
  })
  if (!resposta.ok) throw new Error(`A análise não foi concluída (erro ${resposta.status}).`)
  return resposta.json()
}
