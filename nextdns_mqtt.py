import json
import time
import paho.mqtt.client as mqtt
import requests
import os

# Configurações do NextDNS
NEXTDNS_PROFILE = '85d564'
API_KEY = 'f31f2871d328a52a45fefadc09a1c67d0dd5d53d'
NEXTDNS_ENDPOINT = f'https://api.nextdns.io/profiles/{NEXTDNS_PROFILE}/logs?raw=1'

# Configurações do MQTT
MQTT_BROKER = 'te106575.ala.us-east-1.emqxsl.com'
MQTT_PORT = 8883
MQTT_TOPIC = 'nextdns/logs'
MQTT_USERNAME = 'Diogo'
MQTT_PASSWORD = 'Diogo'
MQTT_CA_CERT = 'emqxsl-ca.crt'  # Caminho para o certificado CA

# Caminho do arquivo de logs
LOG_FILE_PATH = 'nextdns_logs.json'

def get_nextdns_logs():
    response = requests.get(NEXTDNS_ENDPOINT, headers={'X-Api-Key': API_KEY})
    return response.json()

def save_logs_locally(logs):
    if os.path.exists(LOG_FILE_PATH):
        with open(LOG_FILE_PATH, 'r') as file:
            existing_logs = json.load(file)
    else:
        existing_logs = []

    existing_logs.extend(logs['data'])

    with open(LOG_FILE_PATH, 'w') as file:
        json.dump(existing_logs, file, indent=4)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Conectado ao Broker MQTT!")
    else:
        print(f"Falha na conexão, código de retorno {rc}")

def on_publish(client, userdata, mid):
    print("Mensagem publicada")

client = mqtt.Client()
client.on_connect = on_connect
client.on_publish = on_publish

client.tls_set(ca_certs=MQTT_CA_CERT)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
client.connect(MQTT_BROKER, MQTT_PORT, 60)

while True:
    logs = get_nextdns_logs()
    save_logs_locally(logs)
    for log in logs['data']:
        payload = json.dumps(log)
        client.publish(MQTT_TOPIC, payload)
    time.sleep(60)  # Intervalo de 60 segundos
