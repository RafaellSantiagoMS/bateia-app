import { useState } from "react";
import { useBateia } from "./hooks/useBateia";
import type { Conta, Reuniao } from "./types";
import Sidebar, { type Pagina } from "./components/Sidebar";
import FilaHoje from "./components/FilaHoje";
import Carteira from "./components/Carteira";
import Reunioes from "./components/Reunioes";
import AnalisarReuniao from "./components/AnalisarReuniao";
import SobreDados from "./components/SobreDados";
import Painel from "./components/Painel";
import AnaliseReuniao from "./components/AnaliseReuniao";
import DetalheConta from "./components/DetalheConta";

export default function App() {
  const { dados, carregando, erro } = useBateia();
  const [pagina, setPagina] = useState<Pagina>("fila");

  // Só um painel aberto por vez: uma reunião ou um cliente.
  const [reuniaoAberta, setReuniaoAberta] = useState<Reuniao | null>(null);
  const [contaAberta, setContaAberta] = useState<Conta | null>(null);

  if (carregando || erro || !dados) {
    return (
      <p className="grid min-h-screen place-items-center px-6 text-center text-suave">
        {erro ?? "Carregando as reuniões…"}
      </p>
    );
  }

  const { resumo, contas, reunioes } = dados;

  const trocarPagina = (nova: Pagina) => {
    setPagina(nova);
    window.scrollTo(0, 0);
  };

  const abrirReuniaoDaConta = (reuniao: Reuniao) => {
    setContaAberta(null);
    setReuniaoAberta(reuniao);
  };

  return (
    <div className="lg:flex">
      <Sidebar pagina={pagina} onTrocar={trocarPagina} />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-12">
        {pagina === "fila" && <FilaHoje reunioes={reunioes} acoes={resumo.acoes} onAbrir={setReuniaoAberta} />}
        {pagina === "carteira" && <Carteira contas={contas} onAbrir={setContaAberta} />}
        {pagina === "reunioes" && <Reunioes reunioes={reunioes} onAbrir={setReuniaoAberta} />}
        {pagina === "analisar" && <AnalisarReuniao />}
        {pagina === "sobre" && <SobreDados resumo={resumo} />}

        <footer className="mt-16 border-t border-linha pt-6 text-xs text-suave">
          Base real da TOTVS, anonimizada: nenhum nome de pessoa ou empresa aparece no site.
        </footer>
      </main>

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
  );
}
