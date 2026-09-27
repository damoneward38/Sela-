import { CognitiveTask, EnvironmentStatus, PortTopology, SystemLog } from '../types';

export const INITIAL_ENVIRONMENTS: EnvironmentStatus[] = [
  {
    id: 'neural-core',
    name: 'Neural Core v4',
    framework: 'Norcor Native Core',
    status: 'SYNCHRONIZED',
    memoryUsageMb: 18432,
    activeNodes: 14,
    throughput: '3.4k ops/s',
    lastHeartbeat: '0.4s ago',
    version: '4.9.1-airgap',
  },
  {
    id: 'open-jev',
    name: 'Open-JEV Pipeline',
    framework: 'JEV Distributed Bus',
    status: 'SYNCHRONIZED',
    memoryUsageMb: 4280,
    activeNodes: 6,
    throughput: '120 FPS bus',
    lastHeartbeat: '0.2s ago',
    version: '2.1.0-sovereign',
  },
  {
    id: 't3mp3st',
    name: 'T3MP3ST Mesh',
    framework: 'T3MP3ST Secure Tensor',
    status: 'SYNCHRONIZED',
    memoryUsageMb: 8960,
    activeNodes: 8,
    throughput: '982 tensor/s',
    lastHeartbeat: '0.6s ago',
    version: '3.8.4-locked',
  },
];

export const INITIAL_PORTS: PortTopology[] = [
  {
    port: 11434,
    protocol: 'TCP',
    boundAddress: '127.0.0.1 (Strict Loopback)',
    service: 'Local Ollama / Neural Workforce (norcor-brain, qwen2.5-coder)',
    state: 'SECURED_LOOPBACK',
    airGapCompliant: true,
    notes: 'Bound strictly to lo adapter. External packet sweeps forcibly dropped by MatrixBroker clamp.',
  },
  {
    port: 5432,
    protocol: 'TCP',
    boundAddress: '127.0.0.1 (Internal Socket)',
    service: 'PostgreSQL Local Fortress Store (users, user_sessions)',
    state: 'SYSTEM_CORE',
    airGapCompliant: true,
    notes: 'Pure local disk persistence. Standalone tracking with zero remote metrics.',
  },
  {
    port: 8080,
    protocol: 'TCP',
    boundAddress: '127.0.0.1:8080 (Loopback Container)',
    service: 'Zero-Cloud Hardened Dockerfile Container Endpoint',
    state: 'SECURED_LOOPBACK',
    airGapCompliant: true,
    notes: 'Rootless execution in /tmp, isolated memory mapped volumes.',
  },
  {
    port: 9092,
    protocol: 'TCP',
    boundAddress: '127.0.0.1:9092 (IPC Ring Buffer)',
    service: 'T3MP3ST Cross-Framework Event Queue',
    state: 'INTERNAL_QUEUE',
    airGapCompliant: true,
    notes: 'High-throughput kernel ring buffer; no external WAN binding.',
  },
  {
    port: 3000,
    protocol: 'TCP',
    boundAddress: '127.0.0.1:3000 (Local Host)',
    service: 'Sela Sovereign UI & NAMI Master Control Plane',
    state: 'SECURED_LOOPBACK',
    airGapCompliant: true,
    notes: 'Air-gapped administrative command console.',
  },
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-101',
    timestamp: '10:29:48',
    system: 'Kernel',
    level: 'SECURITY',
    message: 'Loopback clamping active: iptables bound 127.0.0.1:11434 against WAN probing.',
    txToken: 'tx-17904-8fa29-c104',
  },
  {
    id: 'log-102',
    timestamp: '10:29:52',
    system: 'Neural Core',
    level: 'INFO',
    message: 'Local weights norcor-brain (FP16) verified with SHA256 integrity check.',
  },
  {
    id: 'log-103',
    timestamp: '10:29:58',
    system: 'Open-JEV',
    level: 'INFO',
    message: 'Cross-system synchronization bridge established with Neural Core & T3MP3ST.',
    txToken: 'tx-17904-91b33-e771',
  },
  {
    id: 'log-104',
    timestamp: '10:30:02',
    system: 'CyberHealer',
    level: 'DISPATCH',
    message: 'AST surgical inspection daemon primed. Snapshot restore storage initialized at /var/sela/vault.',
  },
  {
    id: 'log-105',
    timestamp: '10:30:10',
    system: 'MatrixBroker',
    level: 'SECURITY',
    message: 'Hardware token issued for architect_sovereign session. Pure local Argon2 authentication verified.',
    txToken: 'tx-17905-182a4-44bf',
  },
];

export const SAMPLE_COGNITIVE_PROMPTS = [
  {
    title: 'Code Refactoring & Recursive AST Repair',
    prompt: 'Parse abstract syntax tree for circular event listeners in EventEmitter2, isolate leaky closure references, and inject surgical cleanup hooks without touching external method signatures.',
    expectedComplexity: 88,
  },
  {
    title: 'Audit Loopback Network Telemetry & Port Clamping',
    prompt: 'Enforce loopback clamp on port 11434, verify socket binding table against external network sweeps, and log verification token.',
    expectedComplexity: 42,
  },
  {
    title: 'Deep Multi-Threaded Deadlock Resolution',
    prompt: 'Analyze mutex contention across Open-JEV render loop and T3MP3ST ring buffer. Reorder acquire lock primitives and construct revertible snapshot state.',
    expectedComplexity: 94,
  },
  {
    title: 'Local PostgreSQL Schema Migration & Session Prune',
    prompt: 'Query active sessions from user_sessions table, purge tokens older than 7 days, and verify Argon2 password hash formatting.',
    expectedComplexity: 34,
  },
];

export function evaluateTaskComplexity(prompt: string): CognitiveTask {
  const cleanPrompt = prompt.trim();
  const words = cleanPrompt.split(/\s+/).length;
  
  // Complexity heuristics
  const highComplexityKeywords = [
    'ast', 'abstract syntax tree', 'deadlock', 'mutex', 'tensor', 'recursion',
    'cryptographic', 'compiler', 'bytecode', 'decompile', 'concurrency', 'race condition',
    'memory leak', 'closure', 'healer', 'pipeline'
  ];
  
  const matches = highComplexityKeywords.filter((kw) => cleanPrompt.toLowerCase().includes(kw));
  const keywordScore = Math.min(matches.length * 14, 50);
  const lengthScore = Math.min(Math.floor(words * 1.2), 35);
  const complexityScore = Math.min(Math.max(keywordScore + lengthScore + 15, 20), 98);

  const syntaxDepth = Math.min(Math.max(Math.round(complexityScore / 10), 2), 10);
  const algorithmicEntropy = Number((0.25 + (complexityScore / 100) * 0.68).toFixed(2));
  const tokenDensity = Math.round(45 + complexityScore * 1.8);

  const recommendedModel: 'norcor-brain' | 'qwen2.5-coder:7b' =
    complexityScore >= 65 ? 'qwen2.5-coder:7b' : 'norcor-brain';

  const decisionRationale =
    recommendedModel === 'qwen2.5-coder:7b'
      ? `Structural complexity index ${complexityScore}/100 exceeds threshold (65). Algorithmic entropy (${algorithmicEntropy}) and AST depth (${syntaxDepth}) require qwen2.5-coder:7b multi-pass reasoning engine.`
      : `Structural complexity index ${complexityScore}/100 is within nominal limits. Fast-path offline routing to norcor-brain local weights (12ms latency budget, zero compute overhead).`;

  return {
    id: `tsk-${Math.random().toString(36).substring(2, 8)}`,
    prompt: cleanPrompt,
    complexityScore,
    syntaxDepth,
    tokenDensity,
    algorithmicEntropy,
    recommendedModel,
    decisionRationale,
    executionStatus: 'QUEUED',
  };
}
