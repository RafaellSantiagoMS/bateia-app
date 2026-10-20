import type { Painel, Reuniao } from "../types";

// Sem API configurada, o site lê o arquivo gerado pelo pipeline de Data Science.
// Com a API Java no ar, basta criar um .env com VITE_API_URL=http://localhost:8080.
export const API_URL: string = import.meta.env.VITE_API_URL || "";

export async function buscarPainel(): Promise<Painel> {
  const url = API_URL
    ? `${API_URL}/painel`
    : `${import.meta.env.BASE_URL}data/bateia_data.json`;

  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar os dados (erro ${resposta.status}).`);
  }
  return resposta.json();
}

export async function analisarTranscricao(transcricao: string): Promise<Reuniao> {
  const resposta = await fetch(`${API_URL}/reunioes/analise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcricao }),
  });
  if (!resposta.ok) {
    throw new Error(`A análise não foi concluída (erro ${resposta.status}).`);
  }
  return resposta.json();
}
