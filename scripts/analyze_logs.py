from transformers import pipeline
import json
from datetime import datetime
import logging
from tqdm import tqdm

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def carregar_logs(arquivo):
    try:
        with open(arquivo, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        logging.error(f"Arquivo de logs não encontrado: {arquivo}")
        return []
    except json.JSONDecodeError:
        logging.error(f"Erro ao decodificar JSON do arquivo: {arquivo}")
        return []

def salvar_resultados(resultados, arquivo):
    try:
        with open(arquivo, "w") as file:
            json.dump(resultados, file, indent=2)
        logging.info(f"Resultados salvos em: {arquivo}")
    except IOError:
        logging.error(f"Erro ao salvar resultados em: {arquivo}")

def analisar_sentimento(logs, classificador):
    resultados = []
    for log in tqdm(logs, desc="Analisando logs"):
        try:
            mensagem = log.get('message', '')
            if mensagem:
                analise = classificador(mensagem)
                resultados.append({
                    "timestamp": log.get("timestamp", datetime.now().isoformat()),
                    "message": mensagem,
                    "sentiment": analise[0]
                })
            else:
                logging.warning(f"Log sem mensagem: {log}")
        except Exception as e:
            logging.error(f"Erro ao analisar log: {e}")
    return resultados

def main():
    # Carregar o classificador
    classificador = pipeline('sentiment-analysis', model="distilbert-base-uncased-finetuned-sst-2-english")

    # Carregar os logs
    logs = carregar_logs("logs/nextdns_logs.json")

    if not logs:
        logging.error("Nenhum log carregado. Encerrando o programa.")
        return

    # Analisar os logs
    resultados = analisar_sentimento(logs, classificador)

    # Salvar os resultados
    salvar_resultados(resultados, "logs/nextdns_logs_analysis.json")

if __name__ == "__main__":
    main()
