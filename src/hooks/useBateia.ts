import { useEffect, useState } from "react";
import { buscarPainel } from "../lib/api";
import type { Painel } from "../types";

/** Carrega os dados do painel: carregando, erro ou os dados. */
export const useBateia = () => {
  const [dados, setDados] = useState<Painel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setDados(await buscarPainel());
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, []);

  return { dados, carregando, erro };
};
