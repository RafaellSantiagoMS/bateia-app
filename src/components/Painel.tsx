import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface PainelProps {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

/** Painel lateral sobreposto. Fecha com Esc, no X ou clicando fora. */
export default function Painel({ titulo, onFechar, children }: PainelProps) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };

    window.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={onFechar}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-linha bg-fundo px-6 py-8 sm:px-8"
      >
        <button
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute top-6 right-6 rounded-full p-2 text-suave hover:bg-cartao hover:text-texto"
        >
          <X size={20} />
        </button>
        {children}
      </aside>
    </div>
  );
}
