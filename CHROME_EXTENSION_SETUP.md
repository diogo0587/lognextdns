# Chrome Extension - Kubiks Network Logger

Esta extensão do Chrome captura automaticamente o histórico de navegação e o envia para o Kubiks para análise completa.

## 📦 O que é capturado?

✅ **Histórico de navegação**
- URLs visitadas nos últimos 7 dias
- Títulos das páginas
- Número de visitas por URL
- Última data/hora de visita

✅ **Sincronização automática**
- A cada 1 hora
- Quando você visita uma nova página
- Manualmente via botão na popup

## 🚀 Instalação

### Passo 1: Preparar a extensão

1. Vá para a pasta `chrome-extension` no seu projeto
2. Você verá estes arquivos:
   - `manifest.json` - Configuração da extensão
   - `background.js` - Serviço que captura histórico
   - `popup.html` - Interface do usuário
   - `popup.js` - Lógica do popup

### Passo 2: Carregar a extensão no Chrome

1. Abra o Chrome
2. Digite `chrome://extensions/` na barra de endereço
3. Ative **Modo de desenvolvedor** (canto superior direito)
4. Clique em **Carregar extensão sem empacotar**
5. Selecione a pasta `chrome-extension`

### Passo 3: Verificar instalação

1. Você verá a extensão na barra de ferramentas (ícone roxo)
2. Clique nela para abrir a popup
3. Verá o status: "Ativo"

## 🎯 Usando a extensão

### Automático
- A extensão sincroniza historicamente a cada 1 hora
- Ao navegar, ela atualiza periodicamente
- Não requer nenhuma ação sua

### Manual
1. Clique no ícone da extensão na barra de ferramentas
2. Clique em "🔄 Sincronizar Agora"
3. Verá a mensagem "✅ Histórico sincronizado com sucesso!"

## 📊 Vendo os dados no Kubiks

Após a sincronização, você poderá ver:

1. Acesse seu dashboard Kubiks
2. Vá para **Logs** ou **Traces**
3. Procure por:
   - `service.name: "chrome-extension"`
   - `data.type: "chrome_history"`
4. Verá todos os URLs visitados com:
   - Data/hora de visita
   - Número de vezes visitado
   - Título da página

## 🔍 Exemplos de dados capturados

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "browser": "Chrome",
  "history_count": 142,
  "history_items": [
    {
      "url": "https://github.com/diogo0587",
      "title": "diogo0587 - GitHub",
      "lastVisitTime": "2024-01-15T09:45:00.000Z",
      "visitCount": 5
    },
    {
      "url": "https://stackoverflow.com",
      "title": "Stack Overflow",
      "lastVisitTime": "2024-01-15T08:30:00.000Z",
      "visitCount": 3
    }
  ]
}
```

## 🔐 Privacidade e Segurança

✅ **HTTPS** - Todos os dados são enviados via HTTPS criptografado
✅ **Sem intermediários** - Dados vão direto para Kubiks
✅ **Nenhum rastreamento** - Kubiks não rastreia para terceiros
✅ **Você controla** - Pode desabilitar a sincronização a qualquer momento
✅ **7 dias** - Apenas histórico dos últimos 7 dias é capturado

## 🛠️ Configuração avançada

### Mudar intervalo de sincronização

No arquivo `chrome-extension/background.js`, mude:

```javascript
const HISTORY_SYNC_INTERVAL = 3600000; // 1 hora em ms

// Exemplos:
// 300000 = 5 minutos
// 600000 = 10 minutos
// 1800000 = 30 minutos
// 3600000 = 1 hora (padrão)
```

### Mudar dias de histórico

```javascript
const RECENT_HISTORY_DAYS = 7; // 7 dias (padrão)

// Exemplos:
// 1 = último 1 dia
// 3 = últimos 3 dias
// 7 = últimos 7 dias (padrão)
// 30 = últimos 30 dias
```

### Mudar API Key

Se precisar usar uma API Key diferente, mude em `background.js`:

```javascript
const KUBIKS_API_KEY = 'sua-nova-api-key';
```

## 📱 Sincronização com API Route

A extensão também pode enviar dados para seu servidor via API:

```bash
# Enviar histórico manualmente
curl -X POST https://seu-dominio.vercel.app/api/chrome-history \
  -H "Content-Type: application/json" \
  -d '{
    "history": [
      {
        "url": "https://example.com",
        "title": "Example",
        "lastVisitTime": "2024-01-15T10:00:00Z",
        "visitCount": 1,
        "typedCount": 1
      }
    ]
  }'
```

## 🐛 Troubleshooting

### A extensão não sincroniza
1. Verifique se está habilitada em `chrome://extensions/`
2. Abra o console de desenvolvedor (F12) e veja os logs
3. Verifique se a API Key está correta

### Permissões negadas
1. Clique no ícone da extensão
2. Clique em "Detalhes"
3. Vá para "Permissões de site"
4. Certifique-se que tem acesso a `<all_urls>`

### Dados não aparecem no Kubiks
1. Verifique as variáveis de ambiente no Vercel
2. Teste o endpoint `/api/chrome-history`
3. Veja os logs do Vercel em Settings → Functions Logs

## 📚 Mais informações

- [Documentação Kubiks](https://docs.kubiks.ai)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [OpenTelemetry](https://opentelemetry.io)

---

Pronto para monitorar seu navegador com Kubiks! 🚀
