import os
import requests
from datetime import datetime

NEXTDNS_API_KEY = os.environ['NEXTDNS_API_KEY']
NEXTDNS_PROFILE_ID = os.environ['NEXTDNS_PROFILE_ID']

headers = {'X-Api-Key': NEXTDNS_API_KEY}
url = f'https://api.nextdns.io/profiles/{NEXTDNS_PROFILE_ID}/logs'

response = requests.get(url, headers=headers)
if response.status_code != 200:
    raise Exception(f"Erro ao buscar logs NextDNS: {response.status_code} {response.text}")

logs = response.json().get('data', [])
if not logs:
    print("Nenhum log encontrado.")
    exit(0)

# Gera um índice
with open('content/_index.md', 'w') as f:
    f.write("""---
title: "NextDNS Logs Dashboard"
---
Bem-vindo ao Dashboard de Logs do NextDNS. Abaixo estão as entradas de log mais recentes.
""")

# Gera posts (ajuste o limite conforme necessário)
for i, log in enumerate(logs[:30]):
    post = f"""---
title: "Log Entry {i+1}"
date: {datetime.now().isoformat()}
domain: "{log.get('domain', 'N/A')}"
status: "{log.get('status', 'N/A')}"
timestamp: "{log.get('timestamp', 'N/A')}"
---
"""
    with open(f'content/posts/log-{i+1}.md', 'w') as p:
        p.write(post)
        
