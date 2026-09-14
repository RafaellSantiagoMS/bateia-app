# Bateia

**Inteligência conversacional para o time comercial da TOTVS.**

A TOTVS grava mais de 10 mil reuniões de vendas por mês. Elas são transcritas
automaticamente e ninguém as lê. O Bateia lê essas conversas no lugar das pessoas e
mostra o que apareceu em cada uma: o que o cliente quer comprar, se citou um concorrente,
se está insatisfeito e se corre risco de cancelar.

O nome vem da bateia do garimpeiro — a peneira que separa o ouro do cascalho do rio.

Challenge 2026 · FIAP × TOTVS · Enzo Augusto (RM562249), Gustavo Neres (RM561785),
Rafaell Santiago (RM563486), Sebastian Iriarte (RM563619).

---

## Rodando o projeto

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/bateia/`.

> O site carrega os dados via `fetch`, então precisa de um servidor. Abrir o
> `index.html` com clique duplo não funciona — o navegador bloqueia.

Para gerar a versão de produção:

```bash
npm run build     # gera a pasta dist/
npm run preview   # serve a dist/ localmente para conferir
```

## As três telas

| Tela | O que mostra |
|---|---|
| **Panorama** | Números gerais da base e a distribuição das reuniões por segmento, confiança e reação do cliente. |
| **Carteira de clientes** | Os 484 clientes ordenados por quem precisa de atenção primeiro. Clique para ver as reuniões que geraram o alerta. |
| **Reuniões** | As 1.174 reuniões com filtros e busca. Clique para ver os trechos da conversa por trás de cada sinal. |

## Como o código está organizado

```
src/
├─ main.jsx                    liga o React na página
├─ App.jsx                     estado das abas, filtros e painéis
├─ index.css                   cores e estilos
├─ hooks/
│  └─ useBateiaData.js         carrega o JSON (loading / erro / dados)
├─ lib/
│  └─ format.js                cores, selos e faixas de prioridade
└─ components/
   ├─ Panorama.jsx             gráficos da base
   ├─ PainelGestor.jsx         lista de clientes por prioridade
   ├─ DetalheConta.jsx         painel de um cliente
   ├─ Filtros.jsx              barra de filtros das reuniões
   ├─ LinhaReuniao.jsx         uma reunião na lista
   └─ DetalheReuniao.jsx       painel com tudo que foi extraído
```

O dado fica em `public/data/bateia_data.json`, gerado pelo pipeline de análise a
partir da base real de transcrições. Trocar esse arquivo troca o conteúdo do site
inteiro, sem mexer em uma linha de componente.

## Três decisões de código

**Componentes controlados.** `Filtros` não guarda estado próprio: recebe os valores e
avisa o pai quando algo muda. Assim existe uma única fonte de verdade, no `App`.

**`useMemo` na filtragem.** Sem ele, percorrer as 1.174 reuniões rodaria a cada tecla
digitada na busca. Com ele, roda só quando dados ou filtros mudam de fato.

**Linhas clicáveis são `<button>`.** Como `div`, não seriam alcançáveis pelo teclado nem
anunciadas por leitores de tela. Como `button`, a acessibilidade vem de graça.


