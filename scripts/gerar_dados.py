"""
Gera public/data/bateia_data.json com o mesmo pipeline da Sprint 4 de Data Science.

Usa o modelo e as referências salvos pelo notebook (pasta scripts/modelo) e as
mesmas funções do app em Streamlit, então o site mostra exatamente o que o
notebook calcula.

Uso:
    python scripts/gerar_dados.py CAMINHO/ANON_transcricao.json CAMINHO/ANON_nome_transcricao.csv
"""
import json
import re
import string
import sys
import unicodedata
from collections import Counter
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

PASTA = Path(__file__).parent
modelo = joblib.load(PASTA / "modelo" / "modelo_oportunidade.joblib")
tfidf_termos = joblib.load(PASTA / "modelo" / "tfidf_termos.joblib")
ref = joblib.load(PASTA / "modelo" / "referencias.joblib")
vocabulario = tfidf_termos.get_feature_names_out()


# =========================================================
# FUNÇÕES DO PIPELINE (iguais às do notebook e do app_bateia.py)
# =========================================================
# =========================================================

def limpar_transcricao(texto):
    t = re.sub(r'\[LOCUTOR\s*\d+\]:?', ' ', texto)
    t = re.sub(r'\[(PESSOA|EMPRESA|LOCAL)\]', ' ', t)
    t = t.lower()
    t = re.sub(f'[{re.escape(string.punctuation)}]', ' ', t)
    t = re.sub(r'\b\d+\b', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def pipeline_limpeza(texto):
    palavras = [p for p in limpar_transcricao(texto).split()
                if p not in ref['STOPWORDS_PT'] and len(p) >= 3]
    return ' '.join(palavras)


def remove_acentos(s):
    return ''.join(ch for ch in unicodedata.normalize('NFD', s)
                   if unicodedata.category(ch) != 'Mn')


def texto_para_busca(texto):
    return remove_acentos(limpar_transcricao(texto))


def contar_termos(texto_busca, termos):
    encontrados = {}
    for termo in termos:
        n = len(re.findall(r'\b' + termo + r'\b', texto_busca))
        if n > 0:
            encontrados[termo] = n
    return encontrados


def identificar(texto_busca, dicionario):
    return [nome for nome, variacoes in dicionario.items() if contar_termos(texto_busca, variacoes)]


def trecho(texto_busca, termo):
    # o termo com até 15 palavras antes e depois, como evidência do sinal
    achados = re.findall(r'(?:\S+ ){0,15}\b' + termo + r'\b(?: \S+){0,15}', texto_busca)
    if not achados:
        return ''
    return '...' + achados[0] + '...'


def valores_citados(transcricao):
    return sorted(set(re.findall(r'R\$ ?\d+(?:[.,]\d+)*(?: mil| milhões)?', transcricao)))


def medir_conversa(transcricao):
    texto = re.sub(r'\[(PESSOA|EMPRESA|LOCAL)\]', 'x', transcricao)
    falas = re.findall(r'\[LOCUTOR (\d+)\]:?([^\[]*)', texto)
    palavras_por_locutor = Counter()
    for locutor, fala in falas:
        palavras_por_locutor[locutor] += len(fala.split())

    palavras = texto_para_busca(transcricao).split()
    n_palavras = max(len(palavras), 1)
    perguntas = transcricao.count('?') / n_palavras * 1000

    maiores = palavras_por_locutor.most_common(2)
    total = sum(palavras_por_locutor.values())
    if len(maiores) == 2:
        balanco = 1 - abs(maiores[0][1] / (maiores[0][1] + maiores[1][1]) - 0.5) * 2
    else:
        balanco = 0
    engajamento = 1 - maiores[0][1] / total if total > 0 else 0

    final = ' '.join(palavras[int(len(palavras) * 0.8):])
    proximos = sum(contar_termos(final, ref['PROXIMOS_PASSOS']).values())

    return {'perguntas': perguntas, 'balanco': balanco, 'engajamento': engajamento,
            'proximos_passos': proximos, 'n_locutores': len(palavras_por_locutor)}


def principais_termos(texto_limpo, n=8):
    # mesmo cálculo de pesos da Sprint 2, aplicado a uma reunião só
    pesos = np.asarray(tfidf_termos.transform([texto_limpo]).sum(axis=0)).flatten()
    termos = pd.Series(pesos, index=vocabulario).sort_values(ascending=False).head(n)
    return list(termos[termos > 0].index)


def pontuar_sentimento(texto_busca):
    positivas = sum(contar_termos(texto_busca, ref['PALAVRAS_POSITIVAS']).values())
    negativas = sum(contar_termos(texto_busca, ref['PALAVRAS_NEGATIVAS']).values())
    if positivas + negativas == 0:
        return 0
    return (positivas - negativas) / (positivas + negativas)


def classe_sentimento(pontuacao):
    if pontuacao < ref['SENT_Q1']:
        return 'Negativo'
    if pontuacao > ref['SENT_Q3']:
        return 'Positivo'
    return 'Neutro'


def nota_risco(n_sinais):
    return round(100 * min(n_sinais / ref['LIMITE_CHURN'], 1))


def nivel_risco(nota):
    if nota == 100:
        return 'Alto'
    if nota > 0:
        return 'Atenção'
    return 'Sem sinais'


def notas_ita(medidas_conversa):
    return {c: round(100 * min(medidas_conversa[c] / ref['REFERENCIA_ITA'][c], 1))
            for c in ref['CRITERIOS_ITA']}


def selo_confianca(n_locutores):
    if n_locutores == 0 or n_locutores > ref['LIMITE_OUTLIER']:
        return 'Baixa'
    if n_locutores > ref['Q3_LOCUTORES']:
        return 'Média'
    return 'Alta'


def faixa_oportunidade(nota):
    if nota >= 60:
        return 'Alta'
    if nota >= 40:
        return 'Média'
    return 'Baixa'


def faixa_prioridade(prioridade):
    if prioridade >= 75:
        return 'Crítica'
    if prioridade >= 55:
        return 'Alta'
    if prioridade >= 35:
        return 'Média'
    return 'Baixa'


def gerar_recomendacao(r):
    produtos = ', '.join(r['produtos']) if r['produtos'] else 'a solução discutida'
    if r['nivel_risco'] == 'Alto':
        acao = 'Retenção: acionar o gestor da conta e agendar contato com o cliente em até 48 horas.'
    elif r['faixa_oportunidade'] == 'Alta':
        acao = 'Avançar a venda: enviar proposta ou agendar demonstração de ' + produtos + '.'
    elif r['nivel_risco'] == 'Atenção' and r['sentimento'] == 'Negativo':
        acao = 'Cuidar do relacionamento: retomar os pontos negativos antes de oferecer algo novo.'
    elif r['sinais_expansao'] >= 2:
        acao = 'Oferecer expansão: apresentar módulos ou licenças adicionais ao cliente.'
    elif r['faixa_oportunidade'] == 'Média':
        acao = 'Qualificar: confirmar necessidade, prazo e orçamento na próxima conversa.'
    else:
        acao = 'Acompanhar: manter o relacionamento no ciclo normal da conta.'

    avisos = []
    if r['nivel_risco'] == 'Alto' and r['faixa_oportunidade'] == 'Alta':
        avisos.append('A reunião também parece prospecção: confirme se a insatisfação é com a TOTVS ou com o fornecedor atual do cliente.')
    if r['concorrentes']:
        avisos.append('Concorrente citado (' + ', '.join(r['concorrentes']) + '): leve um comparativo para a próxima conversa.')
    if r['selo'] == 'Baixa':
        avisos.append('Selo de confiança baixo: confira a transcrição antes de agir.')
    return acao, avisos


def resumir(r):
    partes = []
    if r['produtos']:
        partes.append('falou sobre ' + ', '.join(r['produtos'][:3]))
    if r['concorrentes']:
        partes.append('citou ' + ' e '.join(r['concorrentes']))
    if r['nivel_risco'] == 'Alto':
        partes.append('deu sinais de que pode cancelar')
    if r['faixa_oportunidade'] == 'Alta':
        partes.append('tem perfil de oportunidade de venda')
    if not partes:
        return 'Nesta conversa não apareceram sinais fortes de risco nem de oportunidade.'
    return 'Nesta conversa, o cliente ' + '; '.join(partes) + '.'


def analisar_reuniao(transcricao):
    texto_limpo = pipeline_limpeza(transcricao)
    texto_busca = texto_para_busca(transcricao)
    conversa = medir_conversa(transcricao)

    indice = list(modelo.classes_).index('Oportunidade')
    oportunidade = round(100 * modelo.predict_proba([texto_limpo])[0][indice])

    sinais = contar_termos(texto_busca, ref['SINAIS_CHURN'])
    risco = nota_risco(sum(sinais.values()))
    criterios = notas_ita(conversa)
    concorrentes = identificar(texto_busca, ref['CONCORRENTES'])

    r = {
        'produtos': identificar(texto_busca, ref['PRODUTOS_TOTVS']),
        'concorrentes': concorrentes,
        'trechos_concorrentes': [trecho(texto_busca, ref['CONCORRENTES'][c][0]) for c in concorrentes],
        'valores': valores_citados(transcricao),
        'sentimento': classe_sentimento(pontuar_sentimento(texto_busca)),
        'risco': risco,
        'nivel_risco': nivel_risco(risco),
        'sinais_churn': sinais,
        'trechos_churn': [trecho(texto_busca, s) for s in list(sinais)[:3]],
        'oportunidade': oportunidade,
        'faixa_oportunidade': faixa_oportunidade(oportunidade),
        'sinais_expansao': sum(contar_termos(texto_busca, ref['SINAIS_EXPANSAO']).values()),
        'prioridade': round(0.62 * risco + 0.38 * oportunidade),
        'ita': round(np.mean(list(criterios.values()))),
        'criterios_ita': criterios,
        'selo': selo_confianca(conversa['n_locutores']),
        'n_locutores': conversa['n_locutores'],
        'principais_termos': principais_termos(texto_limpo),
    }

    pior = min(criterios, key=criterios.get)
    if criterios[pior] < 50:
        r['conducao'] = ref['DICAS_CONDUCAO'][pior]
    else:
        r['conducao'] = 'Boa condução: descoberta, equilíbrio de fala e encaminhamento presentes.'
    r['resumo'] = resumir(r)
    r['recomendacao'], r['avisos'] = gerar_recomendacao(r)
    return r



# =========================================================
# APRESENTAÇÃO: trecho legível (com acentos) para mostrar no site
# =========================================================

def frase_com_termo(transcricao, termo, limite=240):
    # devolve a frase original (com acentos e sem as marcações de locutor) em que o termo aparece
    texto = re.sub(r'\[LOCUTOR\s*\d+\]:?', ' ', transcricao)
    texto = re.sub(r'\s+', ' ', texto)
    for frase in re.split(r'(?<=[.!?])\s+', texto):
        if re.search(r'\b' + termo + r'\b', remove_acentos(frase.lower())):
            frase = frase.strip()
            return frase if len(frase) <= limite else frase[:limite].rsplit(' ', 1)[0] + '…'
    return ''



def minutos(duracao):
    try:
        h, m, s = (duracao or '0:0:0').split(':')
        return round(int(h) * 60 + int(m) + int(s) / 60)
    except ValueError:
        return 0


SEGMENTOS = {'SAUDE': 'Saúde', 'MANUFATURA': 'Manufatura', 'SERVICOS': 'Serviços',
             'EDUCACIONAL': 'Educacional', 'VAREJO': 'Varejo', 'DISTRIBUICAO': 'Distribuição',
             'LOGISTICA': 'Logística', 'AGROINDUSTRIA': 'Agroindústria',
             'CONSTRUCAO E PROJETOS': 'Construção e projetos', 'SUPERMERCADOS': 'Supermercados'}


def main(caminho_json, caminho_csv):
    registros = [json.loads(l) for l in open(caminho_json, encoding='utf-8') if l.strip()]

    # rótulo do CRM (mesma extração da Sprint 3), só para mostrar lead/cliente no site
    inicio = re.compile(r'"(\d{6,8}),(\d{4}-\d{2}-\d{2}[^,]*),' + r'([^,]*),' * 6)
    conteudo = open(caminho_csv, encoding='latin1').read()
    tipo_cliente = {int(m.group(1)): m.group(8).strip() for m in inicio.finditer(conteudo)}

    # mesma limpeza da Sprint 3: IDs repetidos, textos idênticos e textos curtos
    vistos_id, vistos_texto, base = set(), set(), []
    for r in registros:
        texto = r.get('ANON_TRANSCRICAO') or ''
        limpo = pipeline_limpeza(texto)
        idm = int(r['ID_MEETING'])
        if idm in vistos_id or limpo in vistos_texto or len(limpo) < 200:
            continue
        vistos_id.add(idm)
        vistos_texto.add(limpo)
        base.append(r)

    reunioes = []
    for i, r in enumerate(base, 1):
        texto = r['ANON_TRANSCRICAO']
        a = analisar_reuniao(texto)
        seg = (r.get('NOME_SEGMENTO') or '').strip().upper()
        reunioes.append({
            'id': int(r['ID_MEETING']),
            'cliente': (r.get('CODT') or '').strip(),
            'tipo_cliente': {'lead': 'Prospecção', 'customer': 'Cliente da base'}.get(tipo_cliente.get(int(r['ID_MEETING']))),
            'data': (r.get('DT_MEETING') or '')[:10],
            'duracao': minutos(r.get('DURACAO_MEETING')),
            'segmento': SEGMENTOS.get(seg, seg.title()) or None,
            'uf': r.get('UF') or None,
            'resumo': a['resumo'],
            'produtos': a['produtos'],
            'concorrentes': [{'nome': c, 'trecho': frase_com_termo(texto, ref['CONCORRENTES'][c][0])}
                             for c in a['concorrentes']],
            'valores': a['valores'],
            'sentimento': a['sentimento'],
            'risco': a['risco'],
            'nivel_risco': a['nivel_risco'],
            'sinais': [{'termo': t, 'vezes': n, 'trecho': frase_com_termo(texto, t)}
                       for t, n in list(a['sinais_churn'].items())[:3]],
            'oportunidade': a['oportunidade'],
            'faixa_oportunidade': a['faixa_oportunidade'],
            'prioridade': a['prioridade'],
            'faixa_prioridade': faixa_prioridade(a['prioridade']),
            'ita': a['ita'],
            'criterios': {ref['CRITERIOS_ITA'][c]: v for c, v in a['criterios_ita'].items()},
            'conducao': a['conducao'],
            'selo': a['selo'],
            'locutores': a['n_locutores'],
            'termos': a['principais_termos'],
            'acao': a['recomendacao'].split(':')[0],
            'recomendacao': a['recomendacao'],
            'avisos': a['avisos'],
        })
        if i % 100 == 0:
            print(i, 'reuniões analisadas')

    # carteira: uma linha por cliente, puxada pela reunião de maior prioridade
    por_cliente = {}
    for m in reunioes:
        if m['cliente']:
            por_cliente.setdefault(m['cliente'], []).append(m)
    contas = []
    for cliente, ms in por_cliente.items():
        ms = sorted(ms, key=lambda m: m['data'], reverse=True)
        topo = max(ms, key=lambda m: m['prioridade'])
        contas.append({
            'cliente': cliente,
            'reunioes': [m['id'] for m in ms],
            'segmento': ms[0]['segmento'],
            'uf': ms[0]['uf'],
            'ultima': ms[0]['data'],
            'prioridade': topo['prioridade'],
            'faixa_prioridade': topo['faixa_prioridade'],
            'acao': topo['acao'],
            'reuniao_prioritaria': topo['id'],
            'risco_alto': sum(1 for m in ms if m['nivel_risco'] == 'Alto'),
            'oportunidade_max': max(m['oportunidade'] for m in ms),
            'ita_medio': round(np.mean([m['ita'] for m in ms])),
        })
    contas.sort(key=lambda c: (-c['prioridade'], -c['risco_alto'], c['cliente']))

    def contagem(campo):
        return dict(Counter(m[campo] for m in reunioes if m[campo]).most_common())

    resumo = {
        'reunioes': len(reunioes),
        'reunioes_arquivo': len(registros),
        'clientes': len(contas),
        'acoes': contagem('acao'),
        'faixa_prioridade': contagem('faixa_prioridade'),
        'faixa_oportunidade': contagem('faixa_oportunidade'),
        'nivel_risco': contagem('nivel_risco'),
        'sentimento': contagem('sentimento'),
        'selo': contagem('selo'),
        'segmentos': contagem('segmento'),
        'produtos': dict(Counter(p for m in reunioes for p in m['produtos']).most_common()),
        'concorrentes': dict(Counter(c['nome'] for m in reunioes for c in m['concorrentes']).most_common()),
        'ita_medio': round(np.mean([m['ita'] for m in reunioes])),
        'sem_segmento': sum(1 for m in reunioes if not m['segmento']),
    }

    saida = Path(__file__).parent.parent / 'public' / 'data' / 'bateia_data.json'
    with open(saida, 'w', encoding='utf-8') as f:
        json.dump({'resumo': resumo, 'contas': contas, 'reunioes': reunioes}, f,
                  ensure_ascii=False, separators=(',', ':'))
    print('Arquivo gerado:', saida, '|', len(reunioes), 'reuniões,', len(contas), 'clientes')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
