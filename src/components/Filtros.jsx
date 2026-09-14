/**
 * Barra de filtros da lista de reuniões.
 *
 * Componente "controlado": ele não guarda estado nenhum.
 * Recebe os valores atuais (filtros) e avisa o pai quando algo muda (onChange).
 * Quem manda no estado é o App — isso mantém uma única fonte de verdade.
 */
export default function Filtros({ filtros, onChange, segmentos, total }) {
  // Atualiza uma chave do objeto de filtros, preservando as outras.
  const set = (chave, valor) => onChange({ ...filtros, [chave]: valor })

  return (
    <div className="filtros">
      <input
        className="campo"
        type="search"
        placeholder="Buscar por código do cliente ou ID"
        value={filtros.busca}
        onChange={(e) => set('busca', e.target.value)}
      />

      <select
        className="campo"
        value={filtros.segmento}
        onChange={(e) => set('segmento', e.target.value)}
      >
        <option value="">Todos os segmentos</option>
        {segmentos.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        className="campo"
        value={filtros.confianca}
        onChange={(e) => set('confianca', e.target.value)}
      >
        <option value="">Qualquer confiança</option>
        <option value="Alta">Confiança alta</option>
        <option value="Média">Confiança média</option>
        <option value="Baixa">Confiança baixa</option>
      </select>

      <label className="alternador">
        <input
          type="checkbox"
          checked={filtros.risco}
          onChange={(e) => set('risco', e.target.checked)}
        />
        Só risco de cancelamento
      </label>

      <label className="alternador">
        <input
          type="checkbox"
          checked={filtros.oportunidade}
          onChange={(e) => set('oportunidade', e.target.checked)}
        />
        Só oportunidade
      </label>

      <span className="contagem">{total}</span>
    </div>
  )
}
