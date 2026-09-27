import React from 'react';
import {
  Shield,
  Cpu,
  Lock,
  Terminal,
  Activity,
  CheckCircle2,
  Server,
  ArrowRight,
  Database,
  Layers,
  KeyRound,
  FileCode2,
  CreditCard,
  Crown,
  Sparkles
} from 'lucide-react';
import { SystemTier, User, WhiteLabelConfig } from '../types';

interface SystemOverviewProps {
  onNavigate: (tab: string) => void;
  currentTier: SystemTier;
  currentUser: User | null;
  whiteLabel: WhiteLabelConfig;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  onNavigate,
  currentTier,
  currentUser,
  whiteLabel,
}) => {
  const brandTitle = whiteLabel.hideSelaBrand
    ? whiteLabel.brandName || 'Sovereign Fortress'
    : 'Sela (סֶלָע)';

  const subTitle = whiteLabel.hideSelaBrand
    ? whiteLabel.subTitle || 'Self-Contained Private Cyber Fortress'
    : 'Full System Master Architecture Blueprint · Air-Gapped Enterprise Fortress';

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Master Fortress Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Air-Gapped Node Online · Zero Cloud Reliance
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
              {brandTitle}
            </h1>

            <p className="text-xs sm:text-sm font-mono text-neutral-400 uppercase tracking-wider">
              {subTitle}
            </p>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl font-sans">
              Completely self-contained, sovereign software and orchestration fortress. Engineered to completely eradicate reliance on third-party cloud corporate APIs, centralized tracking networks, and remote subscription models. Your machine acts as an independent cloud node.
            </p>

            {/* Quick stats / metrics bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-neutral-950/80 rounded border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">WAN Perimeter</span>
                <span className="text-sm font-bold text-emerald-400">Loopback Clamped</span>
              </div>
              <div className="p-3 bg-neutral-950/80 rounded border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">Local DB Auth</span>
                <span className="text-sm font-bold text-amber-400">Argon2id Disk</span>
              </div>
              <div className="p-3 bg-neutral-950/80 rounded border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">AST Engine</span>
                <span className="text-sm font-bold text-white">Surgical Healer</span>
              </div>
              <div className="p-3 bg-neutral-950/80 rounded border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">Active License</span>
                <span className="text-sm font-bold text-amber-300">{currentTier} Tier</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('sela')}
                className="px-5 py-2.5 rounded text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 transition-all cursor-pointer flex items-center gap-2 font-sans shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                <span>Launch SELA AI Core (Ollama 3.2)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('builder')}
                className="px-5 py-2.5 rounded text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-colors cursor-pointer flex items-center gap-2 font-sans"
              >
                <span>App Builder Blueprint Studio</span>
              </button>
              <button
                onClick={() => onNavigate('nami')}
                className="px-5 py-2.5 rounded text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-colors cursor-pointer flex items-center gap-2 font-sans"
              >
                <span>NAMI Control Plane</span>
              </button>
              <button
                onClick={() => onNavigate('cyberhealer')}
                className="px-5 py-2.5 rounded text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer flex items-center gap-2 font-sans"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>AST Code Healer</span>
              </button>
              <button
                onClick={() => onNavigate('checkout')}
                className="px-5 py-2.5 rounded text-xs font-semibold bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-600/80 transition-colors cursor-pointer flex items-center gap-2 font-sans"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Enterprise Checkout</span>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-5 py-2.5 rounded text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer flex items-center gap-2 font-sans"
              >
                {currentUser?.username.toLowerCase() === 'damoneward' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{currentUser ? `${currentUser.username} (Admin)` : 'Login & Identity'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Fortress Seal Image Asset */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-neutral-700 shadow-2xl bg-neutral-950 relative">
                <img
                  src="/src/assets/images/sovereign_fortress_seal_1790357450623.jpg"
                  alt="Sela Sovereign Fortress Architectural Seal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[11px] font-mono text-neutral-300">
                    Sovereign Core System Seal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE THREE IMMOVABLE PILLARS */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
            Core Architectural Triad
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            The Three Immovable Pillars
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Sela is anchored upon three non-negotiable operational centers designed to guarantee complete data sovereignty and air-gapped automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div
            onClick={() => onNavigate('nami')}
            className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-amber-400 font-semibold">PILLAR 1</span>
                <span className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-colors">
                  <Cpu className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                The NAMI Control Plane
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">Cognitive Orchestration Engine</p>

              <div className="mt-4 space-y-2 text-xs text-neutral-300 font-sans">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Cross-System Sync:</strong> Unifies Neural Core, Open-JEV &amp; T3MP3ST.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Offline Cognitive Routing:</strong> norcor-brain vs qwen2.5-coder:7b.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Local Topology Discovery:</strong> Air-gapped socket &amp; file mapping.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-amber-400">
              <span>Inspect Control Plane</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => onNavigate('matrixbroker')}
            className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-amber-400 font-semibold">PILLAR 2</span>
                <span className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-colors">
                  <Lock className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                The MatrixBroker System
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">Cryptographic Defense Gateway</p>

              <div className="mt-4 space-y-2 text-xs text-neutral-300 font-sans">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Loopback Clamping:</strong> Binds port 11434 strictly to lo adapter.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Tokenized Auditing:</strong> Signs every execution path with tx-XXXX tokens.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pure Local DB Auth:</strong> Argon2 hashing with zero external tracking.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-amber-400">
              <span>Inspect Defense Gateway</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => onNavigate('cyberhealer')}
            className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-amber-400 font-semibold">PILLAR 3</span>
                <span className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-colors">
                  <Terminal className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Neural Dev &amp; CyberHealer Core
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">Autonomous Deployment Factory</p>

              <div className="mt-4 space-y-2 text-xs text-neutral-300 font-sans">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Deep AST Surgery:</strong> Repairs logic flaws without touching neighboring code.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Revertible State Insurance:</strong> Auto snapshots (rst-XXXX) pre-patch.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>CI Regression Suite:</strong> Validates exit code 0 status trail.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-amber-400">
              <span>Inspect Deployment Factory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Server Node & Blueprints Showcase */}
      <section className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 h-52">
            <img
              src="/src/assets/images/hardware_server_node_1790357463257.jpg"
              alt="Air-Gapped Sovereign Hardware Server Node"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-7 space-y-3">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
              Hardened Local Deployment Specifications
            </span>
            <h3 className="text-xl font-bold text-white">
              Zero-Cloud Docker Container &amp; PostgreSQL Disk Storage
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              All user profiles, sessions, and telemetry are stored database-side directly on host disk space. No tracking requests are ever emitted to external CDNs or analytics endpoints.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => onNavigate('blueprints')}
                className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>View PostgreSQL Tables &amp; SQL Console</span>
              </button>
              <button
                onClick={() => onNavigate('tiers')}
                className="px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded transition-colors cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Manage Commercial Tiers &amp; White Label</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
