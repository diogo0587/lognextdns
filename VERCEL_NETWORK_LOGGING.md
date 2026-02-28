# Vercel Network Logging para Kubiks

Este projeto está configurado para capturar e logar **todo tráfego de rede** que passa pelo Vercel e enviar para o Kubiks para análise.

## 🎯 O que é capturado?

### Via Middleware (automaticamente)
- **HTTP Method**: GET, POST, PUT, DELETE, etc.
- **URL e Path**: Caminho completo da requisição
- **Client IP**: Endereço IP do cliente
- **User Agent**: Navegador e dispositivo
- **Headers**: Content-Type, Accept-Language, etc.
- **Referer**: Página de origem
- **Timestamp**: Hora exata da requisição

### Via API Route `/api/logs`
Você pode enviar logs customizados de qualquer lugar:

```bash
curl -X POST https://seu-dominio.vercel.app/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "event": "custom_event",
    "data": {
      "user_id": "123",
      "action": "login"
    }
  }'
```

## 🚀 Setup no Vercel

### 1. Adicione variáveis de ambiente

No painel do Vercel, vá para **Settings** → **Environment Variables** e adicione:

```
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.kubiks.app
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_HEADERS=x-kubiks-key=kubiks_545f2470512922b06f79f650ed21ae0918136732e540b108a36f88e813b3ec61
OTEL_SERVICE_NAME=lognextdns
```

### 2. Deploy

```bash
git push origin feature/add-vercel-network-logging
```

Vercel detectará as mudanças automaticamente e fará o deploy.

### 3. Teste a conexão

```bash
# Verificar se o endpoint está ativo
curl https://seu-dominio.vercel.app/api/logs

# Enviar um teste
curl -X POST https://seu-dominio.vercel.app/api/logs \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 📊 Vendo os logs no Kubiks

Após o deploy e alguns minutos de tráfego:

1. Acesse seu dashboard Kubiks
2. Vá para **Logs** ou **Traces**
3. Procure por logs com `service.name: "lognextdns"`
4. Você verá todo tráfego HTTP capturado

## 🔍 Exemplos de uso

### Logar eventos customizados
```typescript
// Em qualquer componente ou API route
async function logCustomEvent(eventName: string, data: any) {
  await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      ...data,
    }),
  });
}

// Usar
await logCustomEvent('user_signup', {
  email: 'user@example.com',
  plan: 'pro',
});
```

### Capturar erros
```typescript
try {
  // seu código
} catch (error) {
  await fetch('/api/logs', {
    method: 'POST',
    body: JSON.stringify({
      error: true,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

## 🛠️ Arquivos adicionados

- **middleware.ts**: Captura automaticamente todo request HTTP
- **app/api/logs/route.ts**: Endpoint para logs customizados
- **OTEL_SETUP.md**: Documentação do OpenTelemetry
- **.env.example**: Template de variáveis de ambiente

## 📈 Performance

O logging é **assíncrono** e **não bloqueia** as requisições. O Vercel continua respondendo rapidamente enquanto os logs são enviados em background.

## 🔐 Segurança

- API Key está em variáveis de ambiente
- Logs são enviados via HTTPS
- Nenhum dado sensível é logado por padrão

## 💬 Troubleshooting

### Logs não aparecem no Kubiks
1. Verifique se as variáveis de ambiente estão corretas
2. Teste: `curl https://seu-dominio.vercel.app/api/logs`
3. Verifique os logs do Vercel em **Settings** → **Functions Logs**

### Rate limiting
Se receber muitas requisições:
- Aumente o intervalo de logs
- Filtre requisições de assets (CSS, JS)
- Use sampling

## 📚 Mais informações

- [Documentação Kubiks](https://docs.kubiks.ai)
- [Vercel Edge Middleware](https://vercel.com/docs/concepts/functions/edge-middleware)
- [OpenTelemetry](https://opentelemetry.io)
