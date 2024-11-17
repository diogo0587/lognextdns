
from transformers import pipeline
import json

# Carregar o classificador
classifier = pipeline('sentiment-analysis')

# Carregar os logs
with open("logs/nextdns_logs.json", "r") as file:
    logs = json.load(file)

# Analisar os logs
results = []
for log in logs:
    analysis = classifier(log['message'])
    results.append({
        "timestamp": log["timestamp"],
        "message": log["message"],
        "sentiment": analysis[0]
    })

# Salvar os resultados
with open("logs/nextdns_logs_analysis.json", "w") as file:
    json.dump(results, file, indent=2)
```

### 5. Arquivo de Dependências (`requirements.txt`)

