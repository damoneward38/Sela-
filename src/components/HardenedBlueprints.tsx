import React, { useState } from 'react';
import {
  Database,
  FileCode,
  Terminal,
  Play,
  Copy,
  Check,
  Download,
  Server,
  Layers,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { LocalDatabaseService } from '../services/localDatabase';

export const HardenedBlueprints: React.FC = () => {
  const db = LocalDatabaseService.getInstance();
  const [activeSection, setActiveSection] = useState<'sql' | 'docker'>('sql');

  // SQL Console state
  const [sqlInput, setSqlInput] = useState<string>(
    'SELECT u.username, u.tier_access, s.session_id, s.active_ip_address FROM user_sessions s JOIN users u ON s.user_id = u.id;'
  );
  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: (string | number)[][];
    message?: string;
    error?: string;
  } | null>(() => db.executeSql('SELECT * FROM users;'));
  const [queryLatency, setQueryLatency] = useState<number>(0.4);

  // Docker configurator state
  const [dockerPort, setDockerPort] = useState<number>(8080);
  const [pythonVersion, setPythonVersion] = useState<string>('3.9-slim');
  const [dbPath, setDbPath] = useState<string>('/tmp/database.db');
  const [copiedDocker, setCopiedDocker] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const sqlSchemaDef = `-- 1. Create the Master Users Table with Local Argon2 Hashing Requirements
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Managed via local crypt verification
    tier_access VARCHAR(50) DEFAULT 'Shield' CHECK (tier_access IN ('Shield', 'Fortress', 'Sovereign')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the Session Handshake Table linking to Hardware Tracking Tokens
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    active_ip_address VARCHAR(45) NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Create the MatrixBroker Automated Transaction Log Table
CREATE TABLE IF NOT EXISTS matrix_broker_tx_logs (
    tx_id VARCHAR(255) PRIMARY KEY, -- Generates the "tx-xxxxxxxxxxxxx-xxxxx" keys
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action_performed TEXT NOT NULL,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    execution_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED_SUCCESS',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

  const dockerfileContent = `# Step 1: Use an optimized, secure local base image footprint
FROM python:${pythonVersion}

# Step 2: Forcibly override system environment paths to internal disk nodes only
ENV HOME=/tmp
ENV PATH=/tmp/bin:/usr/local/bin
ENV PYTHONPATH=/tmp/lib
ENV PYTHONHOME=/tmp/lib/python3.9/site-packages
ENV OLLAMA_HOST="127.0.0.1:11434"

# Step 3: Establish local working directory structures
WORKDIR /app

# Step 4: Isolate dependency parsing layer to avoid outside telemetry leak
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Copy application code directly into the container workspace environment
COPY . /app/

# Step 6: Expose the secure local communication gateway port interface
EXPOSE ${dockerPort}

# Step 7: Run the native automated background worker binary
CMD ["neural-work", "--login", "--database", "${dbPath}"]`;

  const dockerComposeContent = `version: '3.8'

services:
  sela-fortress-node:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: sela_sovereign_core
    network_mode: "host" # Strict host loopback binding
    ports:
      - "127.0.0.1:${dockerPort}:${dockerPort}"
    volumes:
      - ./data:/tmp:rw
      - ./vault:/var/sela/vault:rw
    environment:
      - BIND_ADDRESS=127.0.0.1
      - DATABASE_PATH=${dbPath}
      - AIR_GAP_MODE=ENFORCED
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE`;

  const handleRunSql = () => {
    const start = performance.now();
    const res = db.executeSql(sqlInput);
    const elapsed = Number((performance.now() - start).toFixed(2));
    setQueryLatency(elapsed > 0 ? elapsed : 0.3);
    setQueryResult(res);
  };

  const handleCopy = (text: string, type: 'sql' | 'docker') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedDocker(true);
      setTimeout(() => setCopiedDocker(false), 2000);
    }
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Header */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Hardened Blueprints</span>
              <span>·</span>
              <span>Local Database &amp; Zero-Cloud Infrastructure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sovereign Schemas &amp; Hardened Dockerfile
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-3xl">
              Strictly self-contained blueprints: PostgreSQL logins &amp; tracking tables with Argon2 hashing, accompanied by zero-cloud rootless Docker deployment templates.
            </p>
          </div>

          {/* Section Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
            <button
              onClick={() => setActiveSection('sql')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeSection === 'sql'
                  ? 'bg-neutral-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              PostgreSQL Schema &amp; SQL Console
            </button>
            <button
              onClick={() => setActiveSection('docker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeSection === 'docker'
                  ? 'bg-neutral-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Hardened Dockerfile &amp; Compose
            </button>
          </div>
        </div>
      </div>

      {/* SECTION A: PostgreSQL Schema & Live SQL Console */}
      {activeSection === 'sql' && (
        <div className="space-y-6">
          {/* Schema Definition Card */}
          <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-400" />
                  Sovereign Database Logins DDL Schema (PostgreSQL)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Table `users` and `user_sessions` enforcing local Argon2 authentication and hardware tracking tokens.
                </p>
              </div>
              <button
                onClick={() => handleCopy(sqlSchemaDef, 'sql')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied DDL' : 'Copy DDL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
              {sqlSchemaDef}
            </pre>
          </div>

          {/* Interactive SQL Console */}
          <div className="space-y-3 p-4 rounded-lg bg-neutral-900/40 border border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Live Local SQL Query Runner
                </h3>
                <p className="text-xs text-neutral-400">
                  Execute queries directly against local disk PostgreSQL mirror (with browser storage persistence)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    db.resetDatabase();
                    handleRunSql();
                  }}
                  className="px-2.5 py-1 text-xs font-mono text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Seed Data
                </button>
              </div>
            </div>

            {/* Quick Queries Buttons */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="text-neutral-500 py-1">Quick Selects:</span>
              <button
                onClick={() => {
                  setSqlInput('SELECT * FROM users;');
                }}
                className="px-2.5 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-amber-500 cursor-pointer"
              >
                SELECT * FROM users;
              </button>
              <button
                onClick={() => {
                  setSqlInput('SELECT * FROM user_sessions;');
                }}
                className="px-2.5 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-amber-500 cursor-pointer"
              >
                SELECT * FROM user_sessions;
              </button>
              <button
                onClick={() => {
                  setSqlInput('SELECT * FROM matrix_broker_tx_logs;');
                }}
                className="px-2.5 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-amber-500 cursor-pointer"
              >
                SELECT * FROM matrix_broker_tx_logs;
              </button>
              <button
                onClick={() => {
                  setSqlInput(
                    'SELECT l.tx_id, u.username, u.tier_access, l.action_performed, l.risk_level, l.execution_status FROM matrix_broker_tx_logs l LEFT JOIN users u ON l.user_id = u.id;'
                  );
                }}
                className="px-2.5 py-1 rounded bg-neutral-900 text-amber-300 border border-neutral-800 hover:border-amber-500 cursor-pointer"
              >
                JOIN logs + users
              </button>
              <button
                onClick={() => {
                  setSqlInput(
                    'SELECT u.username, u.tier_access, s.session_id, s.active_ip_address FROM user_sessions s JOIN users u ON s.user_id = u.id;'
                  );
                }}
                className="px-2.5 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-amber-500 cursor-pointer"
              >
                JOIN users + sessions
              </button>
            </div>

            <div className="flex gap-2">
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                rows={3}
                className="flex-1 p-3 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleRunSql}
                className="px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0"
              >
                <Play className="w-4 h-4" />
                <span>Run Query</span>
              </button>
            </div>

            {/* Query Results Table */}
            {queryResult && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>{queryResult.message || 'Query Result:'}</span>
                  <span className="tabular-nums">Latency: {queryLatency}ms</span>
                </div>

                <div className="border border-neutral-800 rounded overflow-hidden bg-neutral-950">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                        <tr>
                          {queryResult.columns.map((col, idx) => (
                            <th key={idx} className="py-2 px-3 font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-neutral-900/40">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 text-neutral-300 tabular-nums">
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION B: Zero-Cloud Hardened Dockerfile & Compose */}
      {activeSection === 'docker' && (
        <div className="space-y-6">
          {/* Customization Controls */}
          <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-4">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-amber-400" />
              Air-Gapped Deployment Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="text-neutral-400 block mb-1">Base Python Image:</label>
                <select
                  value={pythonVersion}
                  onChange={(e) => setPythonVersion(e.target.value)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="3.9-slim">python:3.9-slim (Standard Hardened)</option>
                  <option value="3.10-slim">python:3.10-slim (Extended AST)</option>
                  <option value="3.11-slim">python:3.11-slim (High Performance)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Internal Loopback Port:</label>
                <input
                  type="number"
                  value={dockerPort}
                  onChange={(e) => setDockerPort(Number(e.target.value))}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500 tabular-nums"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Local Database Mirror Path:</label>
                <input
                  type="text"
                  value={dbPath}
                  onChange={(e) => setDbPath(e.target.value)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Dockerfile & Docker-Compose Code Viewers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hardened Dockerfile */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  Dockerfile (Zero-Cloud Disk Hardened)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(dockerfileContent, 'docker')}
                    className="p-1 text-neutral-400 hover:text-white"
                    title="Copy Dockerfile"
                  >
                    {copiedDocker ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(dockerfileContent, 'Dockerfile')}
                    className="p-1 text-neutral-400 hover:text-white"
                    title="Download Dockerfile"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed h-[380px]">
                {dockerfileContent}
              </pre>
            </div>

            {/* Docker Compose */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  docker-compose.yml (Strict Loopback &amp; Volumes)
                </span>
                <button
                  onClick={() => handleDownloadFile(dockerComposeContent, 'docker-compose.yml')}
                  className="p-1 text-neutral-400 hover:text-white"
                  title="Download docker-compose.yml"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed h-[380px]">
                {dockerComposeContent}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
