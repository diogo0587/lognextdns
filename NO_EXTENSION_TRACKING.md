# Network & User Behavior Tracking (Sem Extensão)

Este projeto agora rastreia toda a navegação e comportamento do usuário **sem precisar de extensão do Chrome**. Tudo funciona com JavaScript nativo no navegador.

## 📊 O que é rastreado?

### Navegação e Páginas
✅ Carregamento de página (`page_load`)
✅ Mudanças de URL em Single Page Apps (`navigation`)
✅ Página anterior (referrer)
✅ Tempo de carregamento total
✅ DOM Content Loaded time
✅ First Paint / First Contentful Paint

### Interações do Usuário
✅ Cliques em elementos
✅ Scroll na página (com debounce)
✅ Tipo de elemento clicado
✅ Classes e IDs dos elementos
✅ Coordenadas de click

### Erros e Problemas
✅ Erros JavaScript não capturados
✅ Promise rejections
✅ Mensagem de erro, arquivo, linha, coluna
✅ Stack trace completo

### Informações do Dispositivo
✅ User Agent (navegador/SO)
✅ Resolução de tela
✅ Fuso horário
✅ Idioma do navegador
✅ Memória disponível
✅ Núcleos de processador
✅ Touch points (tipo de dispositivo)

## 🚀 Como funciona

### 1. Cliente (Browser)
O arquivo `components/ClientTracker.tsx` é carregado em TODAS as páginas e:
- Rastreia automaticamente todas as interações
- Envia dados para `/api/logs` em tempo real
- Funciona em Single Page Applications (SPA)
- Não bloqueia a navegação (assíncrono)

### 2. Servidor (API)
O arquivo `app/api/logs/route.ts` recebe os dados e:
- Processa os logs
- Envia para Kubiks via OpenTelemetry
- Retorna confirmação ao cliente

### 3. Kubiks
Todos os dados são enviados para sua dashboard onde você pode:
- Ver padrões de navegação
- Identificar problemas/erros
- Analisar comportamento do usuário
- Rastrear performance

## 🔄 Fluxo de dados

```
Browser (Cliente)
    ↓
  Evento (click, scroll, erro, etc)
    ↓
ClientTracker.tsx detecta
    ↓
Envia para /api/logs
    ↓
app/api/logs/route.ts processa
    ↓
Kubiks recebe via OpenTelemetry
    ↓
Dashboard Kubiks mostra dados
```

## 📈 Exemplos de eventos capturados

### Page Load
```json
{
  "type": "page_load",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "currentUrl": "https://seu-dominio.com/page",
  "previousUrl": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "screenResolution": "1920x1080",
  "timezone": "America/Sao_Paulo",
  "language": "pt-BR"
}
```

### Click
```json
{
  "type": "click",
  "element": "BUTTON",
  "class": "btn btn-primary",
  "id": "submit-button",
  "text": "Enviar formulário",
  "url": "https://seu-dominio.com/form",
  "timestamp": "2024-01-15T10:31:00.000Z"
}
```

### Scroll
```json
{
  "type": "scroll",
  "scrollY": 450,
  "scrollX": 0,
  "url": "https://seu-dominio.com/page",
  "timestamp": "2024-01-15T10:31:30.000Z"
}
```

### Erro
```json
{
  "type": "error",
  "message": "Cannot read property 'foo' of undefined",
  "filename": "https://seu-dominio.com/main.js",
  "lineno": 42,
  "colno": 15,
  "url": "https://seu-dominio.com/page",
  "timestamp": "2024-01-15T10:32:00.000Z"
}
```

### Performance
```json
{
  "type": "performance",
  "loadTime": 1234,
  "domContentLoaded": 856,
  "url": "https://seu-dominio.com/page",
  "timestamp": "2024-01-15T10:30:30.000Z"
}
```

## 🎯 Vendo os dados no Kubiks

1. Acesse seu dashboard Kubiks
2. Vá para **Logs** ou **Traces**
3. Procure por `service.name: "lognextdns"`
4. Filtre por tipo: `click`, `navigation`, `error`, `performance`, etc
5. Análise em tempo real!

## ⚙️ Configuração

Tudo é automático! Mas você pode customizar:

### Em `components/ClientTracker.tsx`

**Desabilitar rastreamento de cliques:**
```typescript
// Comentar ou remover o bloco de cliques
document.addEventListener('click', ...
```

**Mudar intervalo de scroll:**
```typescript
}, 1000); // Mude para 2000 (2 segundos), etc
```

**Mudar intervalo de detecção de URL:**
```typescript
setInterval(() => {
  // Mude 1000 para outro valor em ms
}, 1000);
```

## 🔐 Privacidade e Segurança

✅ Nenhuma extensão necessária
✅ Dados não saem do seu servidor
✅ Transmitidos via HTTPS
✅ Processados localmente primeiro
✅ Você controla o que é capturado
✅ Sem cookies de rastreamento
✅ Sem fingerprinting

## 📱 Compatibilidade

✅ Chrome/Chromium
✅ Firefox
✅ Safari
✅ Edge
✅ Opera
✅ Qualquer navegador moderno com suporte a Fetch API

## 🚀 Deployment

Nenhuma configuração adicional necessária:

1. **Merge a PR** no GitHub
2. **Vercel fará o deploy** automaticamente
3. **Componente ClientTracker** será incluído em todas as páginas
4. **Tracking iniciará** imediatamente

## 📊 Casos de uso

✅ **Analytics** - Entender como usuários navegam
✅ **Debugging** - Capturar erros em produção
✅ **Performance** - Monitorar tempos de carregamento
✅ **UX** - Entender onde usuários clicam
✅ **Compliance** - Auditoria de acesso
✅ **Security** - Detectar comportamentos suspeitos

## 💡 Dicas

- Use com o Middleware também para dados do servidor
- Combine com logs de API para visão completa
- Filtre dados sensíveis se necessário
- Use sampling para reduzir volume em alto tráfego
- Configure alertas para erros críticos

## 🐛 Troubleshooting

### Dados não aparecem no Kubiks
1. Verifique se `/api/logs` está respondendo
2. Abra DevTools (F12) e procure por erros
3. Verifique as variáveis de ambiente
4. Veja logs do Vercel

### Muitos logs sendo enviados
1. Aumente os intervalos de debounce
2. Desabilite rastreamento de cliques/scroll
3. Use sampling nos dados
4. Filtre eventos menos importantes

### Performance afetada
1. Reduza a frequência de envio
2. Agrupe múltiplos eventos
3. Use Web Workers para processar dados
4. Comprima os dados antes de enviar

---

Pronto! Você agora tem rastreamento completo sem extensão! 🚀
