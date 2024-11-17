# lognextdns
[![diogo0587's GitHub | Stats](https://stats.quira.sh/diogo0587/github?theme=dark)](https://quira.sh?utm_source=widgets&utm_campaign=diogo0587)


[![diogo0587's GitHub | Languages](https://stats.quira.sh/diogo0587/languages-over-time?theme=dark)](https://quira.sh?utm_source=widgets&utm_campaign=diogo0587)


[![diogo0587's GitHub | Topics](https://stats.quira.sh/diogo0587/topics-over-time?theme=dark)](https://quira.sh?utm_source=widgets&utm_campaign=diogo0587)


markdown
# NextDNS Log Collector

Este projeto coleta e analisa logs do NextDNS usando ferramentas da Hugging Face e GitHub Actions.

## Estrutura do Projeto

```
nextdns-log-collector/
├── .github/
│   └── workflows/
│       ├── main.yml         # Workflow principal para captura e análise de logs
│       └── menu.yml         # Workflow para controle manual (iniciar/parar)
├── logs/
│   └── nextdns_logs.json    # Arquivo de logs capturados
│   └── nextdns_logs_analysis.json  # Arquivo de logs analisados
├── scripts/
│   └── collect_logs.py      # Script para coletar logs do NextDNS
│   └── analyze_logs.py      # Script para analisar logs com Hugging Face
├── requirements.txt         # Arquivo de dependências
└── README.md                # Instruções e informações do projeto
```

## Como Usar

### Configuração

1. Clone o repositório.
2. Configure a chave da API do NextDNS no arquivo `scripts/collect_logs.py`.

### Execução Manual

Você pode iniciar ou parar a execução do workflow manualmente pela aba `Actions` no GitHub.

### Dependências

As dependências estão listadas no arquivo `requirements.txt` e serão instaladas automaticamente pelo GitHub Actions.

## Contribuição

Sinta-se à vontade para abrir issues e pull requests para melhorias e correções.
```
