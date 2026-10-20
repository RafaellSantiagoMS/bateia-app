import { useEffect, useState } from 'react'
import { buscarPainel } from '../lib/api'

/**
 * Carrega os dados do painel e devolve os três estados possíveis:
 * carregando, erro (com o motivo) ou os dados.
 */
export function useBateiaData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    buscarPainel()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
