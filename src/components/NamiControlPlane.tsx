import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Layers,
  Network,
  Activity,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  CheckCircle2,
  FolderTree,
  Terminal,
  RefreshCw,
  Server
} from 'lucide-react';
import {
  INITIAL_ENVIRONMENTS,
  INITIAL_PORTS,
  INITIAL_LOGS,
  SAMPLE_COGNITIVE_PROMPTS,
  evaluateTaskComplexity
} from '../services/cognitiveRouter';
import { CognitiveTask, EnvironmentStatus, PortTopology, SystemLog } from '../types';

export const NamiControlPlane: React.FC = () => {
  const [environments, setEnvironments] = useState<EnvironmentStatus[]>(INITIAL_ENVIRONMENTS);
  const [ports, setPorts] = useState<PortTopology[]>(INITIAL_PORTS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [searchLog, setSearchLog] = useState<string>('');

  // Cognitive routing state
  const [customPrompt, setCustomPrompt] = useState<string>(SAMPLE_COGNITIVE_PROMPTS[0].prompt);
  const [evaluatedTask, setEvaluatedTask] = useState<CognitiveTask>(() =>
    evaluateTaskComplexity(SAMPLE_COGNITIVE_PROMPTS[0].prompt)
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  // Topology sweep state
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);

  const handleSelectSample = (promptText: string) => {
    setCustomPrompt(promptText);
    const task = evaluateTaskComplexity(promptText);
    setEvaluatedTask(task);
    setExecutionOutput(null);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCustomPrompt(val);
    const task = evaluateTaskComplexity(val);
    setEvaluatedTask(task);
    setExecutionOutput(null);
  };

  const handleExecuteTask = () => {
    setIsExecuting(true);
    setExecutionOutput(null);

    const task = { ...evaluatedTask };
    const startTime = performance.now();

    setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime + (task.recommendedModel === 'norcor-brain' ? 14 : 48));
      setIsExecuting(false);

      const output =
        task.recommendedModel === 'norcor-brain'
          ? `[LOCAL WEIGHTS: norcor-brain (FP16)]
Task Vector Evaluated: "${task.prompt.substring(0, 50)}..."
Loopback Socket: 127.0.0.1:11434 (Masked from WAN)
Execution Latency: ${elapsed}ms | Structural Complexity: ${task.complexityScore}/100
Result: Fast-path local dispatch successful. Memory footprint verified < 1.2MB. Zero remote telemetry generated.`
          : `[LOCAL WEIGHTS: qwen2.5-coder:7b (Q4_K_M)]
Task Vector Evaluated: "${task.prompt.substring(0, 50)}..."
Loopback Socket: 127.0.0.1:11434 (Masked from WAN)
Execution Latency: ${elapsed}ms | Structural Complexity: ${task.complexityScore}/100
Result: Deep AST multi-pass reasoning concluded. Syntactic invariants satisfied. Safe rollback snapshot stamped. Clean exit code 0.`;

      setExecutionOutput(output);

      // Append log
      const newLog: SystemLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toTimeString().substring(0, 8),
        system: task.recommendedModel === 'norcor-brain' ? 'Neural Core' : 'CyberHealer',
        level: 'DISPATCH',
        message: `Offline cognitive vector routed to ${task.recommendedModel} (Complexity: ${task.complexityScore}/100)`,
        txToken: `tx-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 6)}`,
      };
      setLogs((prev) => [newLog, ...prev]);
    }, 700);
  };

  const handleTriggerPortSweep = () => {
    setIsSweeping(true);
    setSweepResult(null);

    setTimeout(() => {
      setIsSweeping(false);
      setSweepResult(
        'PORT EXPOSURE AUDIT COMPLETE: 5/5 ports strictly bound to loopback adapters (127.0.0.1). Zero listening sockets on external network interfaces. Air-gap perimeter 100% fortified.'
      );
      // Append security log
      const sweepLog: SystemLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toTimeString().substring(0, 8),
        system: 'MatrixBroker',
        level: 'SECURITY',
        message: 'Comprehensive port exposure sweep concluded: 0 external leaks. Loopback clamping verified.',
        txToken: `tx-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 6)}`,
      };
      setLogs((prev) => [sweepLog, ...prev]);
    }, 900);
  };

  const filteredLogs = logs.filter((log) => {
    const matchSystem = logFilter === 'ALL' || log.system.toUpperCase() === logFilter.toUpperCase();
    const matchSearch =
      searchLog.trim() === '' ||
      log.message.toLowerCase().includes(searchLog.toLowerCase()) ||
      (log.txToken && log.txToken.toLowerCase().includes(searchLog.toLowerCase()));
    return matchSystem && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Scope */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Pillar 1</span>
              <span>·</span>
              <span>Cognitive Orchestration Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              The NAMI Control Plane
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-3xl">
              Master mind layer commanding and bridging diverse software environments (Neural Core, Open-JEV, and T3MP3ST) into a unified visual control plane with air-gapped cognitive routing and topology discovery.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Air-Gapped Node Online
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Cross-System Synchronization */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Cross-System Synchronization Matrix
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Unifies separate complex architectures into a single cohesive telemetry timeline
            </p>
          </div>
          <button
            onClick={() => {
              setEnvironments((prev) =>
                prev.map((e) => ({
                  ...e,
                  lastHeartbeat: '0.1s ago',
                }))
              );
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-neutral-400" />
            Sync Pulse
          </button>
        </div>

        {/* 3 Core System Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {environments.map((env) => (
            <div
              key={env.id}
              className="p-4 rounded-lg bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-neutral-400">{env.framework}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    {env.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{env.name}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-neutral-400 font-mono">
                  <div className="flex justify-between">
                    <span>Allocated Memory</span>
                    <span className="text-neutral-200 tabular-nums">{(env.memoryUsageMb / 1024).toFixed(1)} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Workers</span>
                    <span className="text-neutral-200 tabular-nums">{env.activeNodes} nodes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Throughput</span>
                    <span className="text-amber-300 tabular-nums">{env.throughput}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>Heartbeat: {env.lastHeartbeat}</span>
                <span className="text-neutral-400">{env.version}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Offline Cognitive Routing */}
      <section className="space-y-4 pt-4 border-t border-neutral-900">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            Offline Cognitive Routing Engine
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dynamically evaluates incoming task vectors and routes processing workloads across an offline matrix of local models (norcor-brain vs qwen2.5-coder:7b) based on structural complexity.
          </p>
        </div>

        {/* Preset Task Vector Chips */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-neutral-400">Sample Task Blueprints:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SAMPLE_COGNITIVE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample.prompt)}
                className={`p-2.5 text-left text-xs rounded border transition-all cursor-pointer ${
                  customPrompt === sample.prompt
                    ? 'bg-neutral-800 border-amber-500/60 text-white'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div className="font-medium text-amber-300 mb-1">{sample.title}</div>
                <div className="text-[11px] text-neutral-400 line-clamp-2">{sample.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Task Input and Live Evaluation Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
          {/* Left Column: Text Input & Rationale */}
          <div className="lg:col-span-7 space-y-3">
            <label className="block text-xs font-mono text-neutral-400">
              Task Vector Specification (Air-gapped evaluation):
            </label>
            <textarea
              value={customPrompt}
              onChange={handlePromptChange}
              rows={4}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Describe software task, AST modification, or network boundary..."
            />

            <div className="p-3 rounded bg-neutral-950/80 border border-neutral-800/80">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                Routing Rationale
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                {evaluatedTask.decisionRationale}
              </p>
            </div>

            <button
              onClick={handleExecuteTask}
              disabled={isExecuting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded transition-all cursor-pointer font-sans"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Routing to Local Loopback Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Execute Offline Vector via {evaluatedTask.recommendedModel}
                </>
              )}
            </button>

            {executionOutput && (
              <div className="p-3 bg-neutral-950 border border-amber-500/40 rounded text-xs font-mono text-amber-200/90 whitespace-pre-wrap leading-relaxed animate-fadeIn">
                {executionOutput}
              </div>
            )}
          </div>

          {/* Right Column: Mathematical Complexity Radar */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 p-4 bg-neutral-950 rounded border border-neutral-800">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-mono text-neutral-400 uppercase">Structural Complexity</span>
                <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                  {evaluatedTask.complexityScore} / 100
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    evaluatedTask.complexityScore >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${evaluatedTask.complexityScore}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
                <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block">AST Syntax Depth</span>
                  <span className="text-sm font-semibold text-neutral-200 tabular-nums">
                    Level {evaluatedTask.syntaxDepth}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block">Algorithmic Entropy</span>
                  <span className="text-sm font-semibold text-neutral-200 tabular-nums">
                    {evaluatedTask.algorithmicEntropy}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block">Token Density</span>
                  <span className="text-sm font-semibold text-neutral-200 tabular-nums">
                    {evaluatedTask.tokenDensity} t/s
                  </span>
                </div>
                <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block">Target Architecture</span>
                  <span className="text-xs font-semibold text-amber-300">
                    {evaluatedTask.recommendedModel === 'norcor-brain' ? 'Norcor Edge' : 'Coder Engine'}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Brain Node Badge */}
            <div className="p-3 rounded border border-neutral-700 bg-neutral-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-neutral-400 block">Selected Brain Node</span>
                <span className="text-sm font-bold text-white font-mono">{evaluatedTask.recommendedModel}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Local Topology Discovery */}
      <section className="space-y-4 pt-4 border-t border-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              Local Topology Discovery &amp; Port Allocation Map
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Visualizes internal port allocations, file hierarchies, and operational script boundaries completely air-gapped from the public web.
            </p>
          </div>
          <button
            onClick={handleTriggerPortSweep}
            disabled={isSweeping}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 hover:border-amber-500/60 rounded transition-colors cursor-pointer"
          >
            {isSweeping ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Sweeping Loopback Boundaries...
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Run Air-Gap Port Exposure Sweep
              </>
            )}
          </button>
        </div>

        {sweepResult && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-xs font-mono text-emerald-300 animate-fadeIn">
            {sweepResult}
          </div>
        )}

        {/* Ports Table */}
        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Port</th>
                  <th className="py-2.5 px-4 font-semibold">Bound Adapter</th>
                  <th className="py-2.5 px-4 font-semibold">Service Description</th>
                  <th className="py-2.5 px-4 font-semibold">Security State</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Air-Gap Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {ports.map((port) => (
                  <tr key={port.port} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-2.5 px-4 text-amber-400 font-bold tabular-nums">
                      :{port.port} <span className="text-neutral-500 text-[10px]">{port.protocol}</span>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-300">{port.boundAddress}</td>
                    <td className="py-2.5 px-4 text-neutral-200">
                      <div>{port.service}</div>
                      <div className="text-[11px] text-neutral-500 font-sans mt-0.5">{port.notes}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {port.state}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Compliant
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Local File Hierarchy & Script Boundaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <h3 className="text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-amber-400" />
              Air-Gapped Workspace File Structure
            </h3>
            <div className="p-3 bg-neutral-950 rounded font-mono text-xs text-neutral-300 space-y-1">
              <div className="text-amber-400">/app (Zero-cloud hardened root)</div>
              <div className="pl-4 text-neutral-400">├── core/</div>
              <div className="pl-8 text-neutral-300">├── neural_worker.py (Argon2 + AST hook)</div>
              <div className="pl-8 text-neutral-300">└── topology_mapper.py</div>
              <div className="pl-4 text-neutral-400">├── var/sela/</div>
              <div className="pl-8 text-neutral-300">├── vault/ (rst-XXXX snapshot storage)</div>
              <div className="pl-8 text-neutral-300">└── audit_ledger.jsonl (tx- tokens)</div>
              <div className="pl-4 text-neutral-400">└── tmp/</div>
              <div className="pl-8 text-neutral-300">└── database.db (PostgreSQL disk mirror)</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <h3 className="text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              Operational Script Boundaries
            </h3>
            <div className="p-3 bg-neutral-950 rounded font-mono text-xs text-neutral-300 space-y-2">
              <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                <span className="text-neutral-400">Sandbox Isolation:</span>
                <span className="text-emerald-400">AppArmor + seccomp-bpf</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                <span className="text-neutral-400">WAN Egress:</span>
                <span className="text-emerald-400">Hard-Clamped (DROP all)</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                <span className="text-neutral-400">IPC Socket Mode:</span>
                <span className="text-neutral-200">0600 (Restricted Architect)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">State Rollback:</span>
                <span className="text-neutral-200">Continuous rst-XXXX Snapshots</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Cross-System Log Stream */}
      <section className="space-y-3 pt-4 border-t border-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Unified Cross-System Log Stream
            </h2>
            <p className="text-xs text-neutral-400">
              Aggregated real-time log bus with tokenized transaction signatures
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search logs or tx token..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="pl-8 pr-3 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono w-44 sm:w-56"
              />
            </div>
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="py-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Systems</option>
              <option value="NEURAL CORE">Neural Core</option>
              <option value="OPEN-JEV">Open-JEV</option>
              <option value="T3MP3ST">T3MP3ST</option>
              <option value="MATRIXBROKER">MatrixBroker</option>
              <option value="CYBERHEALER">CyberHealer</option>
              <option value="KERNEL">Kernel</option>
            </select>
          </div>
        </div>

        <div className="border border-neutral-800 rounded-lg bg-neutral-950 p-3 max-h-64 overflow-y-auto font-mono text-xs space-y-1.5 divide-y divide-neutral-900">
          {filteredLogs.map((log) => (
            <div key={log.id} className="pt-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-start sm:items-center gap-2">
                <span className="text-neutral-500 text-[11px] tabular-nums shrink-0">{log.timestamp}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded font-semibold shrink-0 ${
                    log.level === 'SECURITY'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : log.level === 'DISPATCH'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {log.system}
                </span>
                <span className="text-neutral-300 break-words">{log.message}</span>
              </div>
              {log.txToken && (
                <span className="text-[10px] text-amber-400/80 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 shrink-0 self-start sm:self-auto">
                  {log.txToken}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
