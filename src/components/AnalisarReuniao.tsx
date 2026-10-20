import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import type { Reuniao } from "../types";
import { API_URL, analisarTranscricao } from "../lib/api";
import AnaliseReuniao from "./AnaliseReuniao";
import { Cabecalho } from "./ui";

const PASSOS = [
  "O vendedor cola a transcrição e clica em Analisar reunião.",
  "A API grava a reunião no banco Oracle.",
  "O modelo de Data Science calcula as notas e a ação recomendada.",
  "A API grava a análise e devolve o resultado para esta tela.",
];

/** Análise de uma transcrição nova. Precisa da API, porque o modelo roda em Python. */
export default function AnalisarReuniao() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<Reuniao | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      setResultado(await analisarTranscricao(texto));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="space-y-10">
      <Cabecalho titulo="Analisar reunião">
        Cole a transcrição de uma reunião, com as marcações [LOCUTOR n], para ver a ação recomendada.
      </Cabecalho>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form onSubmit={enviar} className="space-y-4 rounded-3xl bg-cartao p-6">
          <label htmlFor="transcricao" className="block font-semibold">
            Transcrição
          </label>
          <textarea
            id="transcricao"
            rows={12}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="[LOCUTOR 1]: Bom dia, como está o uso do Protheus?"
            className="w-full resize-y rounded-2xl border border-linha bg-fundo p-4 text-sm leading-relaxed placeholder:text-suave focus:border-ouro focus:outline-none"
          />

          {!API_URL && (
            <p className="rounded-2xl bg-manteiga p-4 text-sm text-tinta">
              Esta tela funciona quando a API do Bateia estiver no ar. Por enquanto, a mesma análise pode
              ser feita no protótipo em Streamlit da Sprint 4 de Data Science.
            </p>
          )}

          <button
            type="submit"
            disabled={!API_URL || enviando || texto.trim().length < 50}
            className="inline-flex items-center gap-2 rounded-full bg-ouro px-6 py-3 font-semibold text-tinta disabled:cursor-not-allowed disabled:opacity-40"
          >
            {enviando && <LoaderCircle size={18} className="animate-spin" aria-hidden />}
            {enviando ? "Analisando…" : "Analisar reunião"}
          </button>

          {erro && <p className="text-sm text-critica">{erro}</p>}
        </form>

        <aside className="space-y-4">
          <h2 className="font-semibold">Como a análise acontece</h2>
          <ol className="space-y-4">
            {PASSOS.map((passo, i) => (
              <li key={passo} className="flex gap-3 text-sm text-suave">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cartao text-xs font-semibold text-ouro">
                  {i + 1}
                </span>
                {passo}
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {resultado && (
        <div className="rounded-3xl border border-linha p-6 sm:p-8">
          <AnaliseReuniao r={resultado} />
        </div>
      )}
    </section>
  );
}
