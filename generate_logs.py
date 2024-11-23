import yaml
import requests

def get_nextdns_logs():
    url = "https://api.nextdns.io/profiles/85d564/logs?raw=1"
    headers = {'X-Api-Key': 'f31f2871d328a52a45fefadc09a1c67d0dd5d53d'}
    response = requests.get(url, headers=headers)
    return response.json()['data']

def create_html(logs):
    html_content = """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>NextDNS Logs</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
        </style>
    </head>
    <body>
        <h1>NextDNS Logs</h1>
        <table>
            <tr><th>Timestamp</th><th>URL</th><th>Device</th><th>Status</th></tr>
    """
    for log in logs:
        html_content += f"<tr><td>{log['timestamp']}</td><td>{log['url']}</td><td>{log['device']}</td><td>{log['status']}</td></tr>"
    html_content += "</table></body></html>"
    return html_content

logs = get_nextdns_logs()
html_page = create_html(logs)

with open('public/nextdns_logs.html', 'w') as file:
    file.write(html_page)
