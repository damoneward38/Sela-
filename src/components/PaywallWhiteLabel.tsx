import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Check,
  Building,
  Palette,
  Package,
  Sparkles,
  Lock,
  ArrowRight,
  Download
} from 'lucide-react';
import { SystemTier, User, WhiteLabelConfig } from '../types';

interface PaywallWhiteLabelProps {
  currentTier: SystemTier;
  onSelectTier: (tier: SystemTier) => void;
  currentUser: User | null;
  whiteLabel: WhiteLabelConfig;
  onUpdateWhiteLabel: (config: Partial<WhiteLabelConfig>) => void;
  onNavigateToCheckout?: (tier?: SystemTier) => void;
}

export const PaywallWhiteLabel: React.FC<PaywallWhiteLabelProps> = ({
  currentTier,
  onSelectTier,
  currentUser,
  whiteLabel,
  onUpdateWhiteLabel,
  onNavigateToCheckout,
}) => {
  const [copiedDockerCmd, setCopiedDockerCmd] = useState<boolean>(false);

  const plans = [
    {
      id: 'Shield' as SystemTier,
      name: 'SELA SHIELD',
      badge: 'Core Automation',
      target: 'Independent Developers & Autonomous Software Researchers',
      price: '$250',
      billing: '/ Month (Billed Annually)',
      description: 'Foundational local software automation, workspace topology mapping, and AST logic assembly.',
      features: [
        'Full Localized Workspace Discovery',
        'Automated System Documentation Layouts',
        'AST Logic Assembly via NAMI Control Plane',
        'Offline Norcor Edge Brain Model Access',
        'Basic Revertible State Rollback Snapshots',
        'Local Loopback 127.0.0.1 Binding',
      ],
      notIncluded: [
        'MatrixBroker Port Vulnerability Sweeps',
        'Multi-Stage CI Regression Assertion Engine',
        'Pure Local Argon2 Multi-Session Auth',
        'Absolute White Label Brand Extraction',
      ],
    },
    {
      id: 'Fortress' as SystemTier,
      name: 'SELA FORTRESS',
      badge: 'Premium Cyber Security Shield',
      target: 'Defense Operations, Privacy-Critical Agencies, & Mid-Sized Technical Enterprises',
      price: '$1,500 – $2,500',
      billing: '/ Month',
      popular: true,
      description: 'Complete cryptographic defense shield, loopback WAN clamping, deep AST surgery, and PostgreSQL local disk logins.',
      features: [
        'All Features in Sela Shield Included',
        'Full MatrixBroker Cryptographic Gateway',
        'Loopback Network Clamping (127.0.0.1:11434)',
        'Tokenized Transaction Auditing (tx-XXXX)',
        'Local Port Vulnerability Sweeps & WAN Evasion',
        'Surgical AST Code Healing & Fault Injection',
        'Continuous Integration Regression Suite (Exit Code 0)',
        'Pure Local Argon2 Database Authentication',
        'Offline qwen2.5-coder:7b High-Complexity Routing',
      ],
      notIncluded: [
        'Absolute White Label Brand Extraction',
        'Containerized Enterprise Handover Package',
        'Custom Multi-Tenant MSP Reseller Rights',
      ],
    },
    {
      id: 'Sovereign' as SystemTier,
      name: 'SELA SOVEREIGN',
      badge: 'Elite White Label Enterprise',
      target: 'Global Security Firms, Enterprise Networks, & Managed Service Providers (MSPs)',
      price: '$25,000 Setup',
      billing: '+ $1,500 / Month Recurring License',
      highlight: true,
      description: 'Absolute White Label Authorization. Complete extraction of Sela branding and full handover of containerized Docker infrastructure for client re-sale.',
      features: [
        'All Features in Sela Fortress Included',
        'Absolute White Label Brand Extraction',
        'Replace all Sela (סֶלָע) Trademarks with Custom Brand',
        'Full Handover of Containerized Docker Infrastructure',
        'Direct Deployment on Private Air-Gapped Enterprise Nodes',
        'Custom Multi-Tenant Tracking & Hardware Token Tokens',
        'Authorized Commercial Reseller & MSP Distribution Rights',
        'Zero-Cloud Hardened Dockerfile & Compose Generator',
        'Custom Theme Styling (Obsidian, Emerald, Cobalt, Titanium)',
      ],
      notIncluded: [],
    },
  ];

  const handleCopyCustomDocker = () => {
    const cmd = `docker run -d \\
  --name ${whiteLabel.customDockerTag || 'sovereign-node'} \\
  -p 127.0.0.1:8080:8080 \\
  -v ./data:/tmp:rw \\
  -e BRAND_NAME="${whiteLabel.brandName}" \\
  -e TENANT_PREFIX="${whiteLabel.tenantPrefix}" \\
  sela/sovereign-core:latest`;

    navigator.clipboard.writeText(cmd);
    setCopiedDockerCmd(true);
    setTimeout(() => setCopiedDockerCmd(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Scope */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Commercial Paywall &amp; White Label Matrix</span>
              <span>·</span>
              <span>Sovereign Licensing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Enterprise Membership Tiers
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-3xl">
              Air-gapped licensing matrix providing transparent local-first capabilities from single-developer AST automation to full White Label enterprise distribution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Active Tier: <span className="text-amber-400 font-bold">{currentTier}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-xl flex flex-col justify-between transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-b from-neutral-900 via-neutral-900 to-amber-950/20 border-2 border-amber-500/60 shadow-lg shadow-amber-950/20'
                  : plan.popular
                  ? 'bg-neutral-900/90 border-2 border-neutral-700'
                  : 'bg-neutral-900/50 border border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    {plan.badge}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-neutral-950">
                      CURRENT TIER
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-neutral-400 mb-4">{plan.target}</p>

                <div className="mb-4 pb-4 border-b border-neutral-800">
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
                    {plan.price}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">{plan.billing}</div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed mb-5 font-sans">
                  {plan.description}
                </p>

                {/* Features List */}
                <div className="space-y-2.5 text-xs">
                  <div className="font-semibold text-neutral-300 text-[11px] uppercase tracking-wider font-mono">
                    Included Capabilities:
                  </div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}

                  {plan.notIncluded.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                        Not Included in {plan.name}:
                      </div>
                      {plan.notIncluded.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-neutral-500 line-through">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-600" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-neutral-800 space-y-2">
                <button
                  onClick={() => onSelectTier(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded text-xs font-semibold font-sans transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-neutral-800 text-neutral-400 cursor-default'
                      : plan.highlight
                      ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                  }`}
                >
                  {isCurrent ? (
                    'Active Operational Tier'
                  ) : (
                    <>
                      <span>Activate {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                {onNavigateToCheckout && (
                  <button
                    onClick={() => onNavigateToCheckout(plan.id)}
                    className="w-full py-2 px-3 rounded text-[11px] font-mono text-neutral-400 hover:text-white bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
                  >
                    Open Enterprise Checkout &amp; Invoice
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: Sovereign White Label Authorization Studio */}
      <section className="space-y-4 pt-6 border-t border-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Sovereign White Label Authorization Studio
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
              Extract all Sela branding, replace with your company trademarks, configure custom multi-tenant namespaces, and export containerized private-node Docker packages.
            </p>
          </div>
          {currentTier !== 'Sovereign' && (
            <span className="px-3 py-1 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-mono">
              Requires Sela Sovereign Tier
            </span>
          )}
        </div>

        {/* White Label Controls Form */}
        <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <span className="text-sm font-semibold text-white block">
                Extract All Sela (סֶלָע) Trademarks
              </span>
              <span className="text-xs text-neutral-400">
                Removes original logos and enables custom wordmark &amp; styling across the entire control plane.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whiteLabel.hideSelaBrand}
                onChange={(e) => onUpdateWhiteLabel({ hideSelaBrand: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-neutral-400 block mb-1">Custom Enterprise Brand Name:</label>
              <input
                type="text"
                value={whiteLabel.brandName}
                onChange={(e) => onUpdateWhiteLabel({ brandName: e.target.value })}
                placeholder="e.g. Apex Sovereign OS"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Corporate Subtitle / Deployment Model:</label>
              <input
                type="text"
                value={whiteLabel.subTitle}
                onChange={(e) => onUpdateWhiteLabel({ subTitle: e.target.value })}
                placeholder="e.g. Private Enterprise Defense Node"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Multi-Tenant Client Prefix:</label>
              <input
                type="text"
                value={whiteLabel.tenantPrefix}
                onChange={(e) => onUpdateWhiteLabel({ tenantPrefix: e.target.value })}
                placeholder="e.g. corp-acme-node-1"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Container Image Tag:</label>
              <input
                type="text"
                value={whiteLabel.customDockerTag}
                onChange={(e) => onUpdateWhiteLabel({ customDockerTag: e.target.value })}
                placeholder="e.g. acme-defense/node:1.0"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Theme Palette Selector */}
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Corporate Accent Colorway:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'amber', name: 'Obsidian Gold', hex: '#f59e0b' },
                { id: 'emerald', name: 'Emerald Defense', hex: '#10b981' },
                { id: 'cobalt', name: 'Cobalt Cyber', hex: '#3b82f6' },
                { id: 'titanium', name: 'Deep Titanium', hex: '#94a3b8' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateWhiteLabel({ accentTheme: theme.id as any })}
                  className={`p-2.5 rounded border text-left text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
                    whiteLabel.accentTheme === theme.id
                      ? 'bg-neutral-800 border-amber-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.hex }}></span>
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Download Branded Deployment Package */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs font-mono text-neutral-400">
              Generate self-contained Docker node command tailored with your enterprise variables:
            </div>
            <button
              onClick={handleCopyCustomDocker}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {copiedDockerCmd ? <Check className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
              <span>{copiedDockerCmd ? 'Copied Run Script' : 'Copy Branded Docker Launch Script'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
