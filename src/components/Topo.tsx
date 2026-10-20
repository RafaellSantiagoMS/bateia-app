export type Pagina = "inicio" | "fila" | "carteira" | "reunioes" | "analisar" | "sobre";

const LINKS: { id: Pagina; rotulo: string }[] = [
  { id: "fila", rotulo: "Fila de hoje" },
  { id: "carteira", rotulo: "Carteira" },
  { id: "reunioes", rotulo: "Reuniões" },
  { id: "sobre", rotulo: "Sobre os dados" },
];

interface TopoProps {
  pagina: Pagina;
  onTrocar: (pagina: Pagina) => void;
}

/** Menu do topo: o nome à esquerda, as telas no meio e a análise nova em destaque. */
export default function Topo({ pagina, onTrocar }: TopoProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-linha bg-fundo/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-2 px-4 py-4 sm:px-8">
        <button onClick={() => onTrocar("inicio")} className="titulo-largo text-2xl" aria-label="Bateia, página inicial">
          Bateia
        </button>

        <nav aria-label="Telas" className="order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 md:order-none md:mx-0 md:w-auto md:flex-1 md:px-0">
          <ul className="flex gap-6 text-sm">
            {LINKS.map(({ id, rotulo }) => (
              <li key={id}>
                <button
                  onClick={() => onTrocar(id)}
                  aria-current={pagina === id ? "page" : undefined}
                  className={`whitespace-nowrap border-b-2 py-1 transition-colors ${
                    pagina === id ? "border-ouro text-texto" : "border-transparent text-suave hover:text-texto"
                  }`}
                >
                  {rotulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button
          onClick={() => onTrocar("analisar")}
          className={`ml-auto rounded-full px-5 py-2 text-sm font-semibold transition-colors md:ml-0 ${
            pagina === "analisar" ? "bg-texto text-tinta" : "bg-ouro text-tinta hover:bg-manteiga"
          }`}
        >
          Analisar reunião
        </button>
      </div>
    </header>
  );
}
