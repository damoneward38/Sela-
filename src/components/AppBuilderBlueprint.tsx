import React, { useState } from 'react';
import {
  Hammer,
  Layers,
  FileCode,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Terminal,
  FolderTree,
  Sparkles,
  Play,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
  Server
} from 'lucide-react';
import {
  BLUEPRINT_ARCHETYPES,
  BlueprintConfig,
  generateSovereignRepository,
  executeDryRunVerification
} from '../services/blueprintBuilder';
import { GeneratedBlueprintFile, BlueprintBuildResult, WhiteLabelConfig } from '../types';

interface AppBuilderBlueprintProps {
  whiteLabel: WhiteLabelConfig;
}

export const AppBuilderBlueprint: React.FC<AppBuilderBlueprintProps> = ({ whiteLabel }) => {
  const [config, setConfig] = useState<BlueprintConfig>({
    appName: whiteLabel.hideSelaBrand ? 'Enterprise-Sovereign-Fortress' : 'Sela-Sovereign-Node',
    archetypeId: 'sovereign-master',
    primaryPort: 8080,
    databasePath: '/tmp/database.db',
    enableArgon2: true,
    enableLoopbackClamp: true,
    enableAstSurgery: true,
    whiteLabelBrand: whiteLabel.hideSelaBrand ? whiteLabel.brandName : 'Sela (סֶלָע)',
    customDockerTag: whiteLabel.customDockerTag || 'sela/sovereign-node:latest',
  });

  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<BlueprintBuildResult | null>(() =>
    executeDryRunVerification(config)
  );

  const { files, manifestJson } = generateSovereignRepository(config);
  const activeFile = files[activeFileIndex] || files[0];

  const handleArchetypeChange = (archId: string) => {
    const arch = BLUEPRINT_ARCHETYPES.find((a) => a.id === archId);
    if (arch) {
      setConfig((prev) => ({
        ...prev,
        archetypeId: arch.id,
        primaryPort: arch.defaultPorts[0] || 8080,
      }));
      setVerificationResult(null);
    }
  };

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = executeDryRunVerification(config);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 600);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
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

  const handleDownloadBundle = () => {
    const bundleText = files
      .map(
        (f) =>
          `===================================================================\nFILE: ${f.path}\nDESCRIPTION: ${f.description}\n===================================================================\n${f.content}\n\n`
      )
      .join('\n');
    handleDownloadFile(bundleText, `${config.appName.toLowerCase()}_blueprint_bundle.txt`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Scope */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Autonomous Generator</span>
              <span>·</span>
              <span>Repository Scaffolder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Hammer className="w-7 h-7 text-amber-400" />
              Master App Builder Blueprint Studio
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-3xl font-sans">
              Visually scaffold, synthesize, and export complete self-hosted sovereign application codebases. Fully configured for zero third-party corporate APIs, loopback clamping, and local database persistence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBundle}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Download All Blueprint Code
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Choose Archetype */}
      <section className="space-y-3">
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
          Step 1: Select Sovereign System Archetype
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BLUEPRINT_ARCHETYPES.map((arch) => {
            const isSelected = config.archetypeId === arch.id;
            return (
              <button
                key={arch.id}
                onClick={() => handleArchetypeChange(arch.id)}
                className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-amber-500/80 shadow-md text-white'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-amber-300">{arch.title}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed mb-3">
                    {arch.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>Tier: {arch.recommendedTier}</span>
                  <span className="text-neutral-400">Ports: {arch.defaultPorts.join(', ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Configuration Parameters */}
      <section className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
          <span>Step 2: Air-Gapped Deployment Parameters</span>
          <span className="text-emerald-400 font-semibold">Self-Hosted Bare-Metal Model</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="text-neutral-400 block mb-1">Application Identifier:</label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Loopback Port:</label>
            <input
              type="number"
              value={config.primaryPort}
              onChange={(e) => setConfig({ ...config, primaryPort: Number(e.target.value) })}
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500 tabular-nums"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Disk Database Storage Path:</label>
            <input
              type="text"
              value={config.databasePath}
              onChange={(e) => setConfig({ ...config, databasePath: e.target.value })}
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Docker Image Registry Tag:</label>
            <input
              type="text"
              value={config.customDockerTag}
              onChange={(e) => setConfig({ ...config, customDockerTag: e.target.value })}
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <label className="flex items-center gap-2.5 p-3 rounded bg-neutral-950 border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableLoopbackClamp}
              onChange={(e) => setConfig({ ...config, enableLoopbackClamp: e.target.checked })}
              className="rounded border-neutral-700 text-amber-500 focus:ring-0"
            />
            <div>
              <span className="text-neutral-200 font-semibold block">Loopback Network Clamp</span>
              <span className="text-[10px] text-neutral-500">Drop all incoming WAN probes</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded bg-neutral-950 border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableArgon2}
              onChange={(e) => setConfig({ ...config, enableArgon2: e.target.checked })}
              className="rounded border-neutral-700 text-amber-500 focus:ring-0"
            />
            <div>
              <span className="text-neutral-200 font-semibold block">Local Argon2 Engine</span>
              <span className="text-[10px] text-neutral-500">64MB memory cost on local disk</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded bg-neutral-950 border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableAstSurgery}
              onChange={(e) => setConfig({ ...config, enableAstSurgery: e.target.checked })}
              className="rounded border-neutral-700 text-amber-500 focus:ring-0"
            />
            <div>
              <span className="text-neutral-200 font-semibold block">Deep AST Code Surgery</span>
              <span className="text-[10px] text-neutral-500">Pre-patch revertible snapshots</span>
            </div>
          </label>
        </div>
      </section>

      {/* SECTION 3: Live Repository Code Viewer */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Step 3: Synthesized Repository Layout ({files.length} Files)
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 font-sans">
              Explore and copy production-ready code files generated specifically for your sovereign node configuration.
            </p>
          </div>
          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 hover:border-amber-500 rounded transition-colors cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Validating Air-Gap Perimeter...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Dry-Run Integrity Verification
              </>
            )}
          </button>
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div className="p-4 rounded-lg bg-neutral-900/90 border border-emerald-800/80 space-y-2 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Air-Gap Verification Seal: {verificationResult.deploymentToken}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                100% AIR-GAP COMPLIANT
              </span>
            </div>
            <div className="font-mono text-xs text-neutral-300 space-y-1">
              {verificationResult.verificationReport.map((line, idx) => (
                <div key={idx} className="text-emerald-300/90">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Navigator & Code Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* File Tree List */}
          <div className="lg:col-span-4 rounded-lg bg-neutral-900/60 border border-neutral-800 p-3 space-y-1">
            <div className="text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider pb-2 mb-1 border-b border-neutral-800 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-amber-400" />
              Repository Root Tree
            </div>
            <div className="space-y-1 max-h-[460px] overflow-y-auto">
              {files.map((file, idx) => {
                const isActive = activeFileIndex === idx;
                return (
                  <button
                    key={file.path}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`w-full text-left p-2 rounded text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-neutral-800 text-amber-300 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="text-neutral-500 mr-1.5">/</span>
                      {file.path}
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase shrink-0">
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Code Inspector */}
          <div className="lg:col-span-8 rounded-lg bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs font-mono">
              <div>
                <span className="text-amber-400 font-bold">/{activeFile.path}</span>
                <span className="text-neutral-500 text-[11px] block mt-0.5 font-sans">
                  {activeFile.description}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(activeFile.content)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors cursor-pointer"
                  title="Copy File Content"
                >
                  {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(activeFile.content, activeFile.path.split('/').pop() || 'file')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-neutral-900/40 rounded border border-neutral-800/80 font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed h-[400px]">
              {activeFile.content}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
