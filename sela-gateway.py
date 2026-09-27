#!/usr/bin/env python3
"""
SELA SOVEREIGN GATEWAY (סֶלָע)
Zero-dependency local Mac bridge tying your terminal, massive filesystem, and Ollama to the SELA Frontend.

Run on your Mac terminal:
    python3 sela-gateway.py
Or in background:
    python3 sela-gateway.py &
"""

import os
import sys
import json
import subprocess
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

PORT = int(os.environ.get("SELA_PORT", 8765))
HOST = os.environ.get("SELA_HOST", "0.0.0.0")
TOKEN = os.environ.get("SELA_TOKEN", "2UFho3h5JF8RFw7s-voIt8RiAYkv-H6wxCg75tVAeo8")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")

class SelaGatewayHandler(BaseHTTPRequestHandler):
    def _set_cors(self, status=200):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Client-Token")
        self.send_header("Content-Type", "application/json")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors(200)

    def _verify_auth(self):
        auth_header = self.headers.get("Authorization", "")
        client_token = self.headers.get("X-Client-Token", "")
        expected = f"Bearer {TOKEN}"
        if auth_header == expected or client_token == TOKEN or "localhost" in self.headers.get("Host", ""):
            return True
        # Allow loopback without strict token if local
        client_ip = self.client_address[0]
        if client_ip in ("127.0.0.1", "::1"):
            return True
        return False

    def do_GET(self):
        if not self._verify_auth():
            self._set_cors(401)
            self.wfile.write(json.dumps({"error": "Unauthorized. Provide Bearer token."}).encode())
            return

        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        # Health / Status endpoint
        if parsed.path in ("/", "/health", "/api/status"):
            ollama_status = "OFFLINE"
            ollama_models = []
            try:
                req = urllib.request.Request(f"{OLLAMA_HOST}/api/tags")
                with urllib.request.urlopen(req, timeout=1.5) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode())
                        ollama_status = "ONLINE"
                        ollama_models = [m.get("name") for m in data.get("models", [])]
            except Exception:
                pass

            cwd = os.getcwd()
            file_count = sum(len(files) for _, _, files in os.walk(cwd) if not any(p in _ for p in ['.git', 'node_modules']))

            payload = {
                "status": "ONLINE",
                "gateway": "SELA Sovereign Mac Bridge",
                "platform": sys.platform,
                "cwd": cwd,
                "ollama": {
                    "host": OLLAMA_HOST,
                    "status": ollama_status,
                    "models": ollama_models
                },
                "indexed_files_count": file_count,
                "token_accepted": True
            }
            self._set_cors(200)
            self.wfile.write(json.dumps(payload).encode())
            return

        # List files in directory without loading large files into browser memory
        if parsed.path == "/api/files":
            rel_dir = qs.get("path", ["."])[0]
            limit = int(qs.get("limit", [200])[0])
            target_path = Path(rel_dir).resolve()

            items = []
            try:
                for entry in os.scandir(target_path):
                    if entry.name in ('.git', 'node_modules', '.DS_Store', '__pycache__'):
                        continue
                    stat = entry.stat()
                    items.append({
                        "name": entry.name,
                        "path": str(Path(entry.path).relative_to(Path.cwd())),
                        "abs_path": entry.path,
                        "is_dir": entry.is_dir(),
                        "size": stat.st_size,
                        "modified": stat.st_mtime
                    })
                    if len(items) >= limit:
                        break
            except Exception as e:
                self._set_cors(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

            self._set_cors(200)
            self.wfile.write(json.dumps({"current_dir": str(target_path), "items": items}).encode())
            return

        # Read specific file safely with truncation for massive files
        if parsed.path == "/api/file":
            filepath = qs.get("path", [""])[0]
            if not filepath:
                self._set_cors(400)
                self.wfile.write(json.dumps({"error": "Path required"}).encode())
                return

            p = Path(filepath).resolve()
            if not p.exists() or not p.is_file():
                self._set_cors(404)
                self.wfile.write(json.dumps({"error": "File not found"}).encode())
                return

            max_bytes = int(qs.get("max_kb", [500])[0]) * 1024
            size = p.stat().st_size
            try:
                with open(p, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read(max_bytes)
                truncated = size > max_bytes
                self._set_cors(200)
                self.wfile.write(json.dumps({
                    "path": str(p),
                    "size": size,
                    "content": content,
                    "truncated": truncated
                }).encode())
            except Exception as e:
                self._set_cors(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        self._set_cors(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

    def do_POST(self):
        if not self._verify_auth():
            self._set_cors(401)
            self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        data = {}
        try:
            data = json.loads(body.decode())
        except Exception:
            pass

        # Execute terminal command directly on your Mac
        if self.path == "/api/exec":
            cmd = data.get("command", "")
            if not cmd:
                self._set_cors(400)
                self.wfile.write(json.dumps({"error": "Command required"}).encode())
                return

            try:
                res = subprocess.run(
                    cmd,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=25,
                    cwd=os.getcwd()
                )
                self._set_cors(200)
                self.wfile.write(json.dumps({
                    "command": cmd,
                    "exit_code": res.returncode,
                    "stdout": res.stdout,
                    "stderr": res.stderr
                }).encode())
            except subprocess.TimeoutExpired:
                self._set_cors(504)
                self.wfile.write(json.dumps({"error": "Command timed out after 25s"}).encode())
            except Exception as e:
                self._set_cors(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        self._set_cors(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

def run_server():
    server = HTTPServer((HOST, PORT), SelaGatewayHandler)
    print("=" * 65)
    print(f"🔱 SELA SOVEREIGN GATEWAY ACTIVE ON MAC")
    print(f"📍 Local URL:     http://127.0.0.1:{PORT}")
    print(f"🔒 Client Token:  {TOKEN}")
    print(f"📂 Current Dir:   {os.getcwd()}")
    print(f"🧠 Ollama Bridge: {OLLAMA_HOST}")
    print("=" * 65)
    print("SELA frontend is now directly linked to your Mac filesystem & terminal.")
    print("Press Ctrl+C to terminate gateway.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SELA GATEWAY] Gracefully stopped.")
        sys.exit(0)

if __name__ == "__main__":
    run_server()
