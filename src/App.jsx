import { useMemo, useState } from 'react'
import { useBateiaData } from './hooks/useBateiaData'
import { fmt } from './lib/format'
import Filtros from './components/Filtros'
import LinhaReuniao from './components/LinhaReuniao'
import DetalheReuniao from './components/DetalheReuniao'
import PainelGestor from './components/PainelGestor'
import DetalheConta from './components/DetalheConta'
import Panorama from './components/Panorama'

const FILTROS_INICIAIS = {
  busca: '',
  segmento: '',
  confianca: '',
  risco: false,
  oportunidade: false,
}

const ABAS = [
  { id: 'panorama', rotulo: 'Panorama' },
  { id: 'carteira', rotulo: 'Carteira de clientes' },
  { id: 'reunioes', rotulo: 'Reuniões' },
]

export default function App() {
  const { data, loading, error } = useBateiaData()

  const [aba, setAba] = useState('panorama')
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const [visiveis, setVisiveis] = useState(20)

  // Só uma coisa fica aberta por vez: ou uma reunião, ou um cliente.
  const [reuniaoAberta, setReuniaoAberta] = useState(null)
  const [contaAberta, setContaAberta] = useState(null)

  const segmentos = useMemo(() => {
    if (!data) return []
    return [...new Set(data.meetings.map((m) => m.seg).filter(Boolean))].sort()
  }, [data])

  const reunioes = useMemo(() => {
    if (!data) return []
    const busca = filtros.busca.trim().toLowerCase()

    return data.meetings.filter((m) => {
      if (filtros.segmento && m.seg !== filtros.segmento) return false
      if (filtros.confianca && m.conf !== filtros.confianca) return false
      if (filtros.risco && !m.churn.risco) return false
      if (filtros.oportunidade && !m.opp.existe) return false
      if (busca && !`${m.id} ${m.codt || ''}`.toLowerCase().includes(busca)) return false
      return true
    })
  }, [data, filtros])

  function alterarFiltros(novos) {
    setFiltros(novos)
    setVisiveis(20)
  }

  // Ao abrir uma reunião a partir de um cliente, fecha o painel do cliente
  // para não empilhar dois painéis sobrepostos.
  function abrirReuniaoDeConta(reuniao) {
    setContaAberta(null)
    setReuniaoAberta(reuniao)
  }

  if (loading) return <Aviso texto="Carregando as reuniões…" />
  if (error) return <Aviso texto={error} />

  const { agg } = data

  return (
    <div className="app">
      <header className="cabecalho">
        <div>
          <h1 className="marca">Bateia</h1>
          <p className="marca__sub">
            O que importa em cada conversa com o cliente, sem ninguém precisar ler a transcrição.
          </p>
        </div>
      </header>

      <section className="resumo">
        <Indicador valor={fmt(agg.total)} rotulo="reuniões analisadas" />
        <Indicador valor={fmt(agg.risco)} rotulo="com sinal de cancelamento" tom="risco" />
        <Indicador valor={fmt(agg.oport)} rotulo="com chance de venda" tom="ganho" />
        <Indicador valor={agg.ita_medio} rotulo="nota média de condução" />
      </section>

      <nav className="abas">
        {ABAS.map((a) => (
          <button
            key={a.id}
            className={`aba ${aba === a.id ? 'aba--ativa' : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      {aba === 'panorama' && <Panorama agg={agg} />}

      {aba === 'carteira' && (
        <PainelGestor contas={data.accounts} onAbrirConta={setContaAberta} />
      )}

      {aba === 'reunioes' && (
        <>
          <p className="seccao__intro">
            Cada reunião com o que o Bateia encontrou nela. Clique para ver os trechos da
            conversa que geraram cada alerta.
          </p>

          <Filtros
            filtros={filtros}
            onChange={alterarFiltros}
            segmentos={segmentos}
            total={`${fmt(reunioes.length)} reuniões`}
          />

          {reunioes.length === 0 ? (
            <p className="vazio">
              Nenhuma reunião com esses filtros. Remova um deles para ampliar a busca.
            </p>
          ) : (
            <>
              <div className="lista">
                {reunioes.slice(0, visiveis).map((r) => (
                  <LinhaReuniao key={r.id} reuniao={r} onAbrir={setReuniaoAberta} />
                ))}
              </div>

              {visiveis < reunioes.length && (
                <button className="mais" onClick={() => setVisiveis(visiveis + 20)}>
                  Mostrar mais reuniões
                </button>
              )}
            </>
          )}
        </>
      )}

      <footer className="rodape">
        <p>
          Bateia · Challenge 2026 FIAP × TOTVS · Enzo Augusto, Gustavo Neres, Sebastian Iriarte e Rafaell Santiago.
        </p>
        <p className="rodape__nota">
          Base real de {fmt(agg.total)} reuniões anonimizadas. Nenhum dado pessoal é exibido.
        </p>
      </footer>

      {/* Renderização condicional: só existe na tela se houver algo selecionado. */}
      {reuniaoAberta && (
        <DetalheReuniao reuniao={reuniaoAberta} onFechar={() => setReuniaoAberta(null)} />
      )}

      {contaAberta && (
        <DetalheConta
          conta={contaAberta}
          reunioes={data.meetings}
          onFechar={() => setContaAberta(null)}
          onAbrirReuniao={abrirReuniaoDeConta}
        />
      )}
    </div>
  )
}

function Indicador({ valor, rotulo, tom }) {
  return (
    <div className="indicador">
      <div className={`indicador__valor ${tom ? `indicador__valor--${tom}` : ''}`}>{valor}</div>
      <div className="indicador__rotulo">{rotulo}</div>
    </div>
  )
}

function Aviso({ texto }) {
  return <div className="aviso">{texto}</div>
}
