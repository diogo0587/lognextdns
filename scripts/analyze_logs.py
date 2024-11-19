from transformers import pipeline
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def carregar_logs(caminho_arquivo):
    try:
        with open(caminho_arquivo, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        logger.error(f"Arquivo não encontrado: {caminho_arquivo}")
        return []
    except json.JSONDecodeError:
        logger.error(f"Erro ao decodificar JSON do arquivo: {caminho_arquivo}")
        return []

def salvar_resultados(resultados, caminho_arquivo):
    try:
        with open(caminho_arquivo, "w") as file:
            json.dump(resultados, file, indent=2)
        logger.info(f"Resultados salvos em: {caminho_arquivo}")
    except IOError:
        logger.error(f"Erro ao salvar resultados em: {caminho_arquivo}")

def main():
    # Carregar o classificador
    classifier = pipeline('sentiment-analysis')

    # Carregar os logs
    logs = carregar_logs("logs/nextdns_logs.json")
    if not logs:
        return

    # Analisar os logs
    results = []
    for log in logs:
        try:
            analysis = classifier(log['message'])
            results.append({
                "timestamp": log["timestamp"],
                "message": log["message"],
                "sentiment": analysis[0]
            })
        except KeyError as e:
            logger.error(f"Chave não encontrada no log: {e}")
        except Exception as e:
            logger.error(f"Erro ao analisar log: {e}")

    # Salvar os resultados
    salvar_resultados(results, "logs/nextdns_logs_analysis.json")

if __name__ == "__main__":
    main()
