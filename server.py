"""
ASHA Copilot - Local HTTP Server
Kalachakra 2K26 Healthcare & Biotech PS-H02: "One Worker, Five Systems"

Runs zero-dependency local web server on Python 3.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable caching for smooth development/demo
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print("=" * 65)
                print("  [+] ASHA COPILOT - PS-H02 Web Application Server")
                print("  'Capture Once. Generate Every Record.'")
                print(f"  Serving at: http://localhost:{port}")
                print("=" * 65)
                print("  Press Ctrl+C to stop the server.")
                print("=" * 65)
                httpd.serve_forever()
                break
        except OSError:
            print(f"Port {port} is in use, trying {port + 1}...")
            port += 1

if __name__ == '__main__':
    run_server()
