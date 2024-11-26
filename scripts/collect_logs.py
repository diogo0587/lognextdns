
import requests
import json
from datetime import datetime, timedelta

# Configurações
api_key = "1f31f2871d328a52a45fefadc09a1c67d0dd5d53d"
profile_id = "85d564"
output_json = "logs/nextdns_logs.json"

def collect_logs():
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S') + 'Z'
    now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S') + 'Z'
    url = f"https://api.nextdns.io/profiles/{profile_id}/logs/download?from={yesterday}&to={now}&limit=500"
    headers = {"X-Api-Key": api_key}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        logs = response.json()
        with open(output_json, "w") as file:
            json.dump(logs, file, indent=2)

# Coletar logs
collect_logs()
