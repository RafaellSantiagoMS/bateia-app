import { useState } from 'react'
import { useBateiaData } from './hooks/useBateiaData'
import { fmt } from './lib/format'
import FilaHoje from './components/FilaHoje'
import Carteira from './components/Carteira'
import Reunioes from './components/Reunioes'
import SobreDados from './components/SobreDados'
import AnalisarReuniao from './components/AnalisarReuniao'
import AnaliseReuniao from './components/AnaliseReuniao'
import DetalheConta from './components/DetalheConta'
import Painel from './components/Painel'
import { Aviso } from './components/ui'

const PAGINAS = [
  { id: 'fila', rotulo: 'Fila de hoje' },
  { id: 'carteira', rotulo: 'Carteira' },
  { id: 'reunioes', rotulo: 'Reuniões' },
  { id: 'analisar', rotulo: 'Analisar reunião' },
  { id: 'sobre', rotulo: 'Sobre os dados' },
]

export default function App() {
  const { data, loading, error } = useBateiaData()
  const [pagina, setPagina] = useState('fila')

  // Só um painel aberto por vez: uma reunião ou um cliente.
  const [reuniaoAberta, setReuniaoAberta] = useState(null)
  const [contaAberta, setContaAberta] = useState(null)

  function abrirReuniaoDaConta(reuniao) {
    setContaAberta(null)
    setReuniaoAberta(reuniao)
  }

  if (loading) return <Aviso texto="Carregando as reuniões…" />
  if (error) return <Aviso texto={error} />

  const { resumo, contas, reunioes } = data

  return (
    <div className="app">
      <nav className="lateral" aria-label="Seções">
        <div className="marca">
          {/* a bateia: a peneira rasa do garimpeiro, com a pepita no fundo */}
          <svg viewBox="0 0 40 40" aria-hidden="true" className="marca__icone">
            <path d="M3 16 Q20 40 37 16" />
            <path d="M3 16 Q20 22 37 16" />
            <circle cx="20" cy="25" r="3.4" />
          </svg>
          <span>Bateia</span>
        </div>
        <ul>
          {PAGINAS.map((p) => (
            <li key={p.id}>
              <button className={pagina === p.id ? 'ativo' : ''} aria-current={pagina === p.id ? 'page' : undefined}
                      onClick={() => setPagina(p.id)}>
                {p.rotulo}
              </button>
            </li>
          ))}
        </ul>
        <p className="lateral__rodape">
          {fmt(resumo.reunioes)} reuniões, {fmt(resumo.clientes)} clientes. Challenge 2026 FIAP e TOTVS.
        </p>
      </nav>

      <main className="conteudo">
        {pagina === 'fila' && <FilaHoje reunioes={reunioes} acoes={resumo.acoes} onAbrir={setReuniaoAberta} />}
        {pagina === 'carteira' && <Carteira contas={contas} onAbrir={setContaAberta} />}
        {pagina === 'reunioes' && <Reunioes reunioes={reunioes} onAbrir={setReuniaoAberta} />}
        {pagina === 'analisar' && <AnalisarReuniao />}
        {pagina === 'sobre' && <SobreDados resumo={resumo} />}

        <footer className="rodape">
          Bateia, Challenge 2026 FIAP e TOTVS. Enzo Augusto, Gustavo Neres, Rafaell Santiago e Sebastian Iriarte.
          Base real anonimizada: nenhum nome de pessoa ou empresa é exibido.
        </footer>
      </main>

      {/* Renderização condicional: o painel só existe se houver algo selecionado. */}
      {reuniaoAberta && (
        <Painel titulo={`Reunião ${reuniaoAberta.id}`} onFechar={() => setReuniaoAberta(null)}>
          <AnaliseReuniao r={reuniaoAberta} />
        </Painel>
      )}
      {contaAberta && (
        <Painel titulo={`Cliente ${contaAberta.cliente}`} onFechar={() => setContaAberta(null)}>
          <DetalheConta conta={contaAberta} reunioes={reunioes} onAbrirReuniao={abrirReuniaoDaConta} />
        </Painel>
      )}
    </div>
  )
}
