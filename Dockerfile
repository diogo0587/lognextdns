# Use a imagem base do Python 3.9
FROM python:3.9

# Configurar o diretório de trabalho
WORKDIR /app

# Copiar arquivos de requisitos
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o conteúdo para o contêiner
COPY . .

# Criar diretório de logs
RUN mkdir /app/logs

# Definir variáveis de ambiente
ENV NEXTDNS_API_KEY="f31f2871d328a52a45fefadc09a1c67d0dd5d53d"
ENV NEXTDNS_PROFILE_ID="85d564"
ENV YOUR_VIRUSTOTAL_API_KEY="your_virustotal_api_key"

# Executar o script principal
CMD ["python", "app/main.py"]
