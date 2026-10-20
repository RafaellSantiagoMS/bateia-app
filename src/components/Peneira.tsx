import { useEffect, useMemo, useState } from "react";
import type { FaixaPrioridade, Reuniao } from "../types";

// Cada reunião é um grão na bateia. As de maior prioridade assentam no centro,
// em dourado, como o ouro no fundo da peneira; o cascalho fica na borda.
const COR: Record<FaixaPrioridade, string> = {
  "Crítica": "#f2c14e",
  "Alta": "#c99a2e",
  "Média": "#8a8063",
  "Baixa": "#3a4540",
};

const ESPACO = 10; // distância entre os grãos
const ANGULO_DOURADO = Math.PI * (3 - Math.sqrt(5));

/** Número fixo entre -1 e 1 a partir do id, para o grão sempre sair do mesmo lugar. */
const sorteio = (id: number, semente: number) => (((id * 9301 + semente) % 233280) / 233280) * 2 - 1;

interface PeneiraProps {
  reunioes: Reuniao[];
  onAbrir: (reuniao: Reuniao) => void;
}

export default function Peneira({ reunioes, onAbrir }: PeneiraProps) {
  const [assentado, setAssentado] = useState(false);
  const [emFoco, setEmFoco] = useState<Reuniao | null>(null);

  // espera um quadro para a transição dos grãos acontecer
  useEffect(() => {
    const quadro = requestAnimationFrame(() => setAssentado(true));
    return () => cancelAnimationFrame(quadro);
  }, []);

  const graos = useMemo(
    () =>
      [...reunioes]
        .sort((a, b) => b.prioridade - a.prioridade || b.risco - a.risco)
        .map((r, i) => {
          const raio = ESPACO * Math.sqrt(i + 0.5);
          const angulo = i * ANGULO_DOURADO;
          return { r, i, x: raio * Math.cos(angulo), y: raio * Math.sin(angulo) };
        }),
    [reunioes]
  );

  const borda = ESPACO * Math.sqrt(reunioes.length) + 30;

  return (
    <figure className="space-y-4">
      <svg
        viewBox={`${-borda - 4} ${-borda - 4} ${2 * borda + 8} ${2 * borda + 8}`}
        className="mx-auto w-full max-w-[520px]"
        role="img"
        aria-label={`${reunioes.length} reuniões dispostas como grãos numa bateia: as de maior prioridade no centro, em dourado.`}
        onMouseLeave={() => setEmFoco(null)}
      >
        <circle r={borda} fill="#141b18" stroke="#2c3833" strokeWidth={2} />
        <circle r={borda * 0.66} fill="none" stroke="#2c3833" strokeDasharray="2 8" />
        <circle r={borda * 0.33} fill="none" stroke="#2c3833" strokeDasharray="2 8" />

        {graos.map(({ r, i, x, y }) => (
          <circle
            key={r.id}
            cx={x}
            cy={y}
            r={r.faixa_prioridade === "Crítica" ? 5.6 : 4.6}
            fill={COR[r.faixa_prioridade]}
            stroke={emFoco?.id === r.id ? "#f2efe7" : "none"}
            strokeWidth={2}
            className="cursor-pointer"
            style={{
              transform: assentado ? "none" : `translate(${sorteio(r.id, 49297) * 120}px, ${sorteio(r.id, 7) * 120}px)`,
              opacity: assentado ? 1 : 0,
              transition: `transform 1.4s cubic-bezier(.2,.8,.2,1) ${i * 0.7}ms, opacity .6s ${i * 0.7}ms`,
            }}
            onMouseEnter={() => setEmFoco(r)}
            onClick={() => onAbrir(r)}
          />
        ))}
      </svg>

      <figcaption className="min-h-12 text-center text-sm text-suave">
        {emFoco ? (
          <>
            <span className="text-texto">Reunião {emFoco.id}</span>, prioridade {emFoco.prioridade} ({emFoco.faixa_prioridade.toLowerCase()}),{" "}
            {emFoco.acao.toLowerCase()}. Clique para abrir.
          </>
        ) : (
          <>Cada grão é uma reunião real. Quanto mais perto do centro, maior a prioridade.</>
        )}
      </figcaption>

      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-suave">
        {(Object.keys(COR) as FaixaPrioridade[]).map((faixa) => (
          <li key={faixa} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COR[faixa] }} />
            {faixa}
          </li>
        ))}
      </ul>
    </figure>
  );
}
