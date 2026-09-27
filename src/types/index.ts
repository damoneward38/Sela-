export type SystemTier = 'Shield' | 'Fortress' | 'Sovereign';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  tier_access: SystemTier;
  role?: 'admin' | 'architect' | 'operator';
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  session_id: string;
  user_id: number;
  active_ip_address: string;
  last_activity: string;
  user?: User;
}

export interface EnvironmentStatus {
  id: 'neural-core' | 'open-jev' | 't3mp3st';
  name: string;
  framework: string;
  status: 'SYNCHRONIZED' | 'PROCESSING' | 'STANDBY' | 'DEGRADED';
  memoryUsageMb: number;
  activeNodes: number;
  throughput: string;
  lastHeartbeat: string;
  version: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  system: 'Neural Core' | 'Open-JEV' | 'T3MP3ST' | 'MatrixBroker' | 'CyberHealer' | 'Kernel';
  level: 'INFO' | 'SECURITY' | 'DISPATCH' | 'AST_PATCH' | 'WARN';
  message: string;
  txToken?: string;
}

export interface CognitiveTask {
  id: string;
  prompt: string;
  complexityScore: number; // 0 - 100
  syntaxDepth: number; // 1 - 10
  tokenDensity: number; // tokens/sec
  algorithmicEntropy: number; // 0 - 1.0
  recommendedModel: 'norcor-brain' | 'qwen2.5-coder:7b';
  decisionRationale: string;
  executionStatus?: 'QUEUED' | 'ROUTING' | 'EXECUTING' | 'COMPLETED';
  latencyMs?: number;
  outputPreview?: string;
}

export interface PortTopology {
  port: number;
  protocol: 'TCP' | 'UDP';
  boundAddress: string;
  service: string;
  state: 'SECURED_LOOPBACK' | 'INTERNAL_QUEUE' | 'SYSTEM_CORE' | 'EXPOSED_RISK';
  airGapCompliant: boolean;
  notes: string;
}

export interface TransactionAudit {
  token: string;
  timestamp: string;
  caller: string;
  scriptPath: string;
  sha256Digest: string;
  ecdsaSignature: string;
  safetyEnvelopeValidated: boolean;
  status: 'VERIFIED' | 'REVOKED' | 'QUARANTINED';
}

export interface RestorePoint {
  id: string; // rst-XXXX
  timestamp: string;
  targetFile: string;
  snapshotHash: string;
  diffSummary: string;
  originalCode: string;
  reverted: boolean;
}

export interface AstHealingSample {
  id: string;
  title: string;
  filename: string;
  defectType: string;
  brokenCode: string;
  healedCode: string;
  astFaultNode: string;
  regressionTests: string[];
}

export interface WhiteLabelConfig {
  enabled: boolean;
  brandName: string;
  subTitle: string;
  logoUrl?: string;
  accentTheme: 'amber' | 'emerald' | 'cobalt' | 'titanium';
  tenantPrefix: string;
  hideSelaBrand: boolean;
  customDockerTag: string;
  corporateDomain: string;
}

export interface BlueprintArchetype {
  id: string;
  title: string;
  description: string;
  targetEnvironment: string;
  defaultPorts: number[];
  recommendedTier: SystemTier;
  pillarsIncluded: ('nami' | 'matrixbroker' | 'cyberhealer')[];
}

export interface GeneratedBlueprintFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export interface MatrixBrokerTxLog {
  tx_id: string; // Generates the "tx-xxxxxxxxxxxxx-xxxxx" keys
  user_id: number | null;
  action_performed: string;
  risk_level: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  execution_status: string;
  timestamp: string;
  user?: User;
}

export interface BlueprintBuildResult {
  deploymentToken: string;
  timestamp: string;
  status: 'SYNTHESIZED' | 'VERIFIED' | 'LOCKED';
  filesGenerated: number;
  totalBytes: number;
  verificationReport: string[];
}

