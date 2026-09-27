#!/usr/bin/env node
/**
 * SELA SOVEREIGN GATEWAY (Node.js edition)
 * Zero-dependency bridge connecting your terminal, filesystem, and Ollama to SELA.
 *
 * Run:
 *   node sela-gateway.mjs
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { URL } from 'url';

const PORT = parseInt(process.env.SELA_PORT || '8765', 10);
const HOST = process.env.SELA_HOST || '0.0.0.0';
const TOKEN = process.env.SELA_TOKEN || '2UFho3h5JF8RFw7s-voIt8RiAYkv-H6wxCg75tVAeo8';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

function setCors(res, status = 200) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Token',
    'Content-Type': 'application/json',
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    setCors(res, 200);
    res.end();
    return;
  }

  const authHeader = req.headers['authorization'] || '';
  const clientToken = req.headers['x-client-token'] || '';
  const isLoopback = req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1';
  const isAuthed = isLoopback || authHeader === `Bearer ${TOKEN}` || clientToken === TOKEN;

  if (!isAuthed) {
    setCors(res, 401);
    res.end(JSON.stringify({ error: 'Unauthorized. Provide Bearer token.' }));
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && (reqUrl.pathname === '/' || reqUrl.pathname === '/health' || reqUrl.pathname === '/api/status')) {
    setCors(res, 200);
    res.end(JSON.stringify({
      status: 'ONLINE',
      gateway: 'SELA Sovereign Mac Node Bridge (Node.js)',
      platform: process.platform,
      cwd: process.cwd(),
      token_accepted: true,
      ollama_host: OLLAMA_HOST
    }));
    return;
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/files') {
    const targetDir = path.resolve(reqUrl.searchParams.get('path') || '.');
    try {
      const entries = fs.readdirSync(targetDir, { withFileTypes: true });
      const items = entries
        .filter(e => !['.git', 'node_modules', '.DS_Store'].includes(e.name))
        .map(e => {
          const absPath = path.join(targetDir, e.name);
          let size = 0;
          try { size = fs.statSync(absPath).size; } catch {}
          return {
            name: e.name,
            path: path.relative(process.cwd(), absPath),
            abs_path: absPath,
            is_dir: e.isDirectory(),
            size
          };
        });
      setCors(res, 200);
      res.end(JSON.stringify({ current_dir: targetDir, items }));
    } catch (err) {
      setCors(res, 500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/file') {
    const filePath = reqUrl.searchParams.get('path');
    if (!filePath) {
      setCors(res, 400);
      res.end(JSON.stringify({ error: 'Path required' }));
      return;
    }
    const resolved = path.resolve(filePath);
    try {
      const stats = fs.statSync(resolved);
      const maxBytes = parseInt(reqUrl.searchParams.get('max_kb') || '500', 10) * 1024;
      const truncated = stats.size > maxBytes;
      const buffer = Buffer.alloc(Math.min(stats.size, maxBytes));
      const fd = fs.openSync(resolved, 'r');
      fs.readSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);

      setCors(res, 200);
      res.end(JSON.stringify({
        path: resolved,
        size: stats.size,
        content: buffer.toString('utf-8'),
        truncated
      }));
    } catch (err) {
      setCors(res, 500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && reqUrl.pathname === '/api/exec') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body || '{}');
        if (!command) {
          setCors(res, 400);
          res.end(JSON.stringify({ error: 'Command required' }));
          return;
        }
        exec(command, { cwd: process.cwd(), timeout: 25000 }, (error, stdout, stderr) => {
          setCors(res, 200);
          res.end(JSON.stringify({
            command,
            exit_code: error ? (error.code || 1) : 0,
            stdout,
            stderr
          }));
        });
      } catch (err) {
        setCors(res, 500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  setCors(res, 404);
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`🔱 SELA Node Gateway running on http://127.0.0.1:${PORT}`);
});
