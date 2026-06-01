import os
import sys
import webbrowser
import http.server
import socketserver
import threading
import time
from pathlib import Path

def start_server(port=5500):
    os.chdir(Path(__file__).parent)
    
    handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"\n🚀 Сервер запущен на http://localhost:{port}")
        print("📊 Открываю проект в браузере...")
        print("⏸️ Нажми Ctrl+C для остановки\n")
        
        def open_browser():
            time.sleep(1)
            webbrowser.open(f"http://localhost:{port}")
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Сервер остановлен")
            sys.exit(0)

if __name__ == "__main__":
    start_server()