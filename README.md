# Bateia

Painel para o time comercial da TOTVS que mostra, a partir das transcrições das reuniões, quais clientes precisam de atenção primeiro e por quê.

A TOTVS grava e transcreve milhares de reuniões de venda por mês, e ninguém consegue ler todas. O Bateia lê no lugar das pessoas e diz, para cada reunião: o produto citado, o sentimento, o risco de o cliente cancelar, a chance de venda, os assuntos da conversa e a ação recomendada, sempre com o trecho da fala que levou ao alerta. O nome vem da bateia do garimpeiro, a peneira que separa o ouro do cascalho.

Challenge 2026 FIAP e TOTVS. Enzo Augusto (RM562249), Gustavo Neres (RM561785), Rafaell Santiago (RM563486) e Sebastian Iriarte (RM563619).

Site publicado: https://rafaellsantiagoms.github.io/bateia-app/

## Telas

| Tela | Para quem | O que mostra |
|---|---|---|
| Fila de hoje | Vendedor | As reuniões que pedem uma ação (retenção, avançar a venda, expansão...), da maior para a menor prioridade, com o trecho da conversa que explica cada uma |
| Carteira | Gestor | Os clientes ordenados pela reunião mais urgente de cada um |
| Reuniões | Todos | Todas as reuniões, com busca e filtros por segmento, ação e confiança da transcrição |
| Analisar reunião | Vendedor | Campo para colar uma transcrição nova e ver a análise na hora (precisa da API ligada) |
| Sobre os dados | Todos | Como cada nota é calculada, os números da base e até onde dá para confiar neles |

Clicando em uma reunião abre o painel com a recomendação, as notas (prioridade, oportunidade, risco de churn, sentimento), os trechos que acenderam os alertas, a condução da reunião (ITA), os produtos e valores citados e a confiança da transcrição.

## Rodando o projeto

Precisa de Node.js 20 ou mais novo.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/bateia-app/`. O site carrega os dados com `fetch`, então precisa desse servidor; abrir o `index.html` com clique duplo não funciona.

Para gerar a versão de produção:

```bash
npm run build     # gera a pasta dist/
npm run preview   # serve a dist/ para conferir
```

Cada push na branch `main` publica o site no GitHub Pages pelo workflow em `.github/workflows/deploy.yml`.

## De onde vêm os dados

O arquivo `public/data/bateia_data.json` é gerado pelo script `scripts/gerar_dados.py`, que usa o mesmo pipeline da Sprint 4 de Data Science: o modelo de Regressão Logística, o TF-IDF e as referências salvos pelo notebook (pasta `scripts/modelo`) e as mesmas funções do protótipo em Streamlit. Por isso os números do site são os mesmos do notebook.

Para gerar de novo (precisa de Python com pandas, numpy, scikit-learn e joblib, e dos dois arquivos da base da TOTVS):

```bash
python scripts/gerar_dados.py CAMINHO/ANON_transcricao.json CAMINHO/ANON_nome_transcricao.csv
```

Repositório do notebook e do protótipo: https://github.com/RafaellSantiagoMS/Bateia_Sprint4_DataScience

## Como o código está organizado

```
src/
├─ main.jsx                    liga o React na página e carrega as fontes
├─ App.jsx                     navegação entre as telas e os painéis abertos
├─ index.css                   cores, tipografia e layout
├─ hooks/
│  └─ useBateiaData.js         carrega os dados (carregando / erro / dados)
├─ lib/
│  ├─ api.js                   de onde os dados vêm: arquivo JSON ou API
│  └─ format.js                datas, tons de cor e o trecho principal de cada reunião
└─ components/
   ├─ FilaHoje.jsx             fila de ações do vendedor
   ├─ Carteira.jsx             clientes por prioridade
   ├─ Reunioes.jsx             todas as reuniões com filtros
   ├─ AnalisarReuniao.jsx      formulário para uma transcrição nova
   ├─ SobreDados.jsx           método e números da base
   ├─ AnaliseReuniao.jsx       tudo o que foi encontrado em uma reunião
   ├─ DetalheConta.jsx         reuniões de um cliente
   ├─ Painel.jsx               painel lateral (fecha com Esc ou clicando fora)
   └─ ui.jsx                   peças pequenas: prioridade, trecho, barras
```

## Ligando na API (back-end)

Sem configuração, o site lê o arquivo JSON. Para usar a API do Bateia, crie um arquivo `.env` na raiz:

```
VITE_API_URL=http://localhost:8080
```

O site passa a chamar dois endpoints, sem mudar nenhum componente:

| Verbo | URI | Envia | Devolve |
|---|---|---|---|
| GET | `/painel` | nada | `{ resumo, contas, reunioes }`, no mesmo formato do `bateia_data.json` |
| POST | `/reunioes/analise` | `{ "transcricao": "..." }` | uma reunião analisada, no mesmo formato de um item de `reunioes` |

A API precisa liberar CORS para o endereço do site. O formato de cada reunião está no próprio `bateia_data.json`; os campos principais são `id`, `cliente`, `segmento`, `data`, `acao`, `recomendacao`, `prioridade`, `oportunidade`, `risco`, `sentimento`, `ita`, `criterios`, `sinais`, `concorrentes`, `produtos`, `valores`, `termos` e `selo`.

## Limitações

O alerta de churn é feito por palavras e não reconheceu os trechos de risco que o grupo anotou à mão; ele indica quais reuniões ler, e não que o cliente vai cancelar. A nota de oportunidade vem de um modelo treinado com só 205 reuniões rotuladas. O índice de condução (ITA) ainda não foi comparado com resultado de venda. A análise de uma reunião nova depende da API, porque o modelo roda em Python e não no navegador.
