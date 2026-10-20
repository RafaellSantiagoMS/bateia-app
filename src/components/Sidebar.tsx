import { BarChart3, Briefcase, ListChecks, MessagesSquare, ScanText, type LucideIcon } from "lucide-react";

export type Pagina = "fila" | "carteira" | "reunioes" | "analisar" | "sobre";

const PAGINAS: { id: Pagina; rotulo: string; icone: LucideIcon }[] = [
  { id: "fila", rotulo: "Fila de hoje", icone: ListChecks },
  { id: "carteira", rotulo: "Carteira", icone: Briefcase },
  { id: "reunioes", rotulo: "Reuniões", icone: MessagesSquare },
  { id: "analisar", rotulo: "Analisar reunião", icone: ScanText },
  { id: "sobre", rotulo: "Sobre os dados", icone: BarChart3 },
];

interface SidebarProps {
  pagina: Pagina;
  onTrocar: (pagina: Pagina) => void;
}

export default function Sidebar({ pagina, onTrocar }: SidebarProps) {
  return (
    <aside className="sticky top-0 z-20 flex shrink-0 flex-col border-b border-linha bg-lateral lg:h-screen lg:w-64 lg:border-r lg:border-b-0">
      <p className="titulo-largo px-5 pt-5 text-2xl lg:px-7 lg:pt-8 lg:text-[28px]">Bateia</p>

      <nav aria-label="Seções" className="overflow-x-auto px-3 py-3 lg:flex-1 lg:px-4 lg:py-8">
        <ul className="flex gap-1 lg:flex-col">
          {PAGINAS.map(({ id, rotulo, icone: Icone }) => {
            const ativa = pagina === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onTrocar(id)}
                  aria-current={ativa ? "page" : undefined}
                  className={`flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    ativa ? "bg-ouro text-tinta" : "text-suave hover:bg-cartao hover:text-texto"
                  }`}
                >
                  <Icone size={18} aria-hidden />
                  {rotulo}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="hidden border-t border-linha px-7 py-6 text-xs leading-relaxed text-suave lg:block">
        Challenge 2026 FIAP e TOTVS
        <br />
        Enzo, Gustavo, Rafaell e Sebastian
      </p>
    </aside>
  );
}
