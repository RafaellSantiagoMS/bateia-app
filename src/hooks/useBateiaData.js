import { useEffect, useState } from 'react'

/**
 * Carrega o dataset analisado (saída do pipeline / do notebook).
 *
 * Devolve sempre os três estados possíveis de um carregamento:
 *   loading -> ainda buscando
 *   error   -> deu errado (e o motivo)
 *   data    -> chegou
 *
 * Tratar os três explicitamente evita a tela em branco quando algo falha.
 */
export function useBateiaData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // import.meta.env.BASE_URL respeita o "base" do vite.config.js,
    // então o caminho funciona tanto local quanto no GitHub Pages.
    const url = `${import.meta.env.BASE_URL}data/bateia_data.json`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Não foi possível carregar os dados (${res.status})`)
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
