import { useEffect } from 'react'

/**
 * Painel lateral sobreposto. Fecha com Esc ou clicando fora.
 * O return do useEffect remove o listener quando o painel some.
 */
export default function Painel({ titulo, onFechar, children }) {
  useEffect(() => {
    const aoTeclar = (e) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  return (
    <div className="fundo" onClick={onFechar}>
      <aside className="painel" role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <button className="painel__fechar" onClick={onFechar} aria-label="Fechar">✕</button>
        {children}
      </aside>
    </div>
  )
}
