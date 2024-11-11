import os
import requests
import json
from datetime import datetime

def capture_logs():
    nextdns_api_key = os.getenv('f31f2871d328a52a45fefadc09a1c67d0dd5d53d')
    nextdns_profile_id = os.getenv('85d564')

    response = requests.get(f"https://api.nextdns.io/profiles/{nextdns_profile_id}/logs?raw=1", 
                            headers={"X-Api-Key": nextdns_api_key})
    logs = response.json()

    file_name = f"logs/daily_log_{datetime.now().strftime('%Y-%m-%d')}.json"
    os.makedirs(os.path.dirname(file_name), exist_ok=True)
    with open(file_name, 'w') as file:
        json.dump(logs, file)
    print(f"Logs capturados e salvos em {file_name}")

def enrich_logs():
    input_file = f"logs/daily_log_{datetime.now().strftime('%Y-%m-%d')}.json"
    output_file = f"logs/enriched_daily_log_{datetime.now().strftime('%Y-%m-%d')}.json"

    with open(input_file, 'r') as file:
        logs = json.load(file)
    
    enriched_logs = []
    for log in logs['data']:
        log['timestamp'] = datetime.now().isoformat()
        enriched_logs.append(log)

    with open(output_file, 'w') as file:
        json.dump(enriched_logs, file)
    print(f"Logs enriquecidos salvos em {output_file}")

def analyze_urls():
    input_file = f"logs/enriched_daily_log_{datetime.now().strftime('%Y-%m-%d')}.json"

    with open(input_file, 'r') as file:
        logs = json.load(file)

    for log in logs:
        url = log.get('url', 'N/A')
        print(f"Analisando {url}")
        safety_response = requests.get(f"https://www.virustotal.com/api/v3/urls/{url}", 
                                       headers={"x-apikey": os.getenv('YOUR_VIRUSTOTAL_API_KEY')})
        log['safety'] = safety_response.json()

    output_file = f"logs/analyzed_daily_log_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(output_file, 'w') as file:
        json.dump(logs, file)
    print(f"Logs analisados salvos em {output_file}")

if __name__ == "__main__":
    capture_logs()
    enrich_logs()
    analyze_urls()
