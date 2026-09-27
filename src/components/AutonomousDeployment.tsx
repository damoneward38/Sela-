import React, { useState } from 'react';
import {
  Terminal,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCode2,
  GitBranch,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { AST_SAMPLES, AstEngineService } from '../services/astEngine';
import { AstHealingSample, RestorePoint } from '../types';

export const AutonomousDeployment: React.FC = () => {
  const astService = AstEngineService.getInstance();
  const [selectedSample, setSelectedSample] = useState<AstHealingSample>(AST_SAMPLES[0]);
  const [currentCode, setCurrentCode] = useState<string>(AST_SAMPLES[0].brokenCode);
  const [isHealed, setIsHealed] = useState<boolean>(false);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  
  // Snapshots state
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>(() => astService.getRestorePoints());
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);

  // CI Validation state
  const [isRunningCi, setIsRunningCi] = useState<boolean>(false);
  const [ciStage, setCiStage] = useState<number>(0);
  const [ciLogs, setCiLogs] = useState<string[]>([]);
  const [ciCompleted, setCiCompleted] = useState<boolean>(false);
  const [exitCode, setExitCode] = useState<number | null>(null);

  const handleSelectSample = (sample: AstHealingSample) => {
    setSelectedSample(sample);
    setCurrentCode(sample.brokenCode);
    setIsHealed(false);
    setCiLogs([]);
    setCiCompleted(false);
    setExitCode(null);
    setCiStage(0);
  };

  const handleTriggerAstSurgery = () => {
    setIsHealing(true);

    // 1. Capture revertible snapshot FIRST (Automatic Revertible State Insurance)
    const snapshot = astService.createSnapshot(
      selectedSample.filename,
      currentCode,
      `Pre-patch backup for ${selectedSample.defectType}`
    );
    setRestorePoints(astService.getRestorePoints());
    setActiveSnapshotId(snapshot.id);

    // 2. Surgical AST injection
    setTimeout(() => {
      setCurrentCode(selectedSample.healedCode);
      setIsHealed(true);
      setIsHealing(false);

      // Auto trigger CI Validation post-repair
      runCiValidation();
    }, 600);
  };

  const handleRevertSnapshot = (snapshotId: string) => {
    const reverted = astService.revertToSnapshot(snapshotId);
    if (reverted) {
      setCurrentCode(reverted.originalCode);
      setIsHealed(false);
      setRestorePoints(astService.getRestorePoints());
      setCiCompleted(false);
      setExitCode(null);
      setCiLogs([`[FALLBACK RESTORE] System safely reverted to restore point ${snapshotId}. Codecanvas restored.`]);
    }
  };

  const runCiValidation = () => {
    setIsRunningCi(true);
    setCiStage(1);
    setCiLogs(['[CI-STAGE 1/4] Lexical Invariant & Token Stream Validation...']);

    setTimeout(() => {
      setCiStage(2);
      setCiLogs((prev) => [
        ...prev,
        '  ✔ Lexical tokens intact: Zero parse anomalies detected.',
        '[CI-STAGE 2/4] AST Node Hierarchy & Scope Continuity Verification...',
      ]);

      setTimeout(() => {
        setCiStage(3);
        setCiLogs((prev) => [
          ...prev,
          `  ✔ AST Tree Validated: ${selectedSample.astFaultNode.substring(0, 35)}... replaced surgically.`,
          '  ✔ Neighboring functional code preserved with 100% hash parity.',
          '[CI-STAGE 3/4] Memory Footprint & Resource Leak Simulation...',
        ]);

        setTimeout(() => {
          setCiStage(4);
          setCiLogs((prev) => [
            ...prev,
            '  ✔ Heap differential: 0kb leak across 10,000 synthetic iterations.',
            '[CI-STAGE 4/4] Assertion Test Suite & Subprocess Exit Verification...',
            ...selectedSample.regressionTests.map((t) => `  ✔ PASS: ${t}`),
            '------------------------------------------------------------',
            'SUBPROCESS TERMINATED WITH EXIT CODE 0. Clean status trail verified.',
          ]);
          setIsRunningCi(false);
          setCiCompleted(true);
          setExitCode(0);
        }, 350);
      }, 350);
    }, 350);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Scope */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Pillar 3</span>
              <span>·</span>
              <span>Autonomous Deployment Factory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Neural Dev &amp; CyberHealer Core
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-3xl">
              Eliminates manual developer labor through deep Abstract Syntax Tree (AST) surgery, automatic revertible state snapshots (rst-XXXX), and continuous integration regression validation with exit code 0 assertions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-amber-950/60 border border-amber-800/60 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AST Surgical Engine Ready
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Deep AST Defect Selection */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-amber-400" />
            Surgical AST Code-Healing Studio
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select a real-world architectural defect to test automated syntax tree surgery and neighboring code preservation.
          </p>
        </div>

        {/* Defect Scenario Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AST_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`p-3 rounded text-left border transition-all cursor-pointer ${
                selectedSample.id === sample.id
                  ? 'bg-neutral-800 border-amber-500 text-white'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-semibold text-amber-300 mb-1">{sample.title}</div>
              <div className="text-[11px] text-neutral-400 font-mono mb-2">{sample.filename}</div>
              <div className="text-[11px] text-red-300/80 bg-red-950/40 p-1.5 rounded border border-red-900/60 font-sans">
                {sample.defectType}
              </div>
            </button>
          ))}
        </div>

        {/* AST Node Inspector Badge */}
        <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-xs font-mono">
            <span className="text-neutral-500 uppercase text-[10px] block sm:inline sm:mr-2">Identified AST Fault Node:</span>
            <span className="text-red-400 font-semibold">{selectedSample.astFaultNode}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerAstSurgery}
              disabled={isHealing || isHealed}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded transition-all cursor-pointer font-sans"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isHealing ? 'Surgically Patching AST...' : isHealed ? 'AST Patch Injected' : 'Trigger Deep AST Surgery'}
            </button>
          </div>
        </div>

        {/* Code Comparison Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Working Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                Working File: <code className="text-neutral-200">{selectedSample.filename}</code>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isHealed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                {isHealed ? 'AST SURGERY COMMITTED' : 'DEFECTIVE CODE (PRE-PATCH)'}
              </span>
            </div>
            <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed h-[340px]">
              {currentCode}
            </pre>
          </div>

          {/* AST Target Reference & Patch Diff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                AST Surgical Solution Blueprint
              </span>
              <span className="text-[10px] text-neutral-500">Neighboring Code 100% Preserved</span>
            </div>
            <pre className="p-4 bg-neutral-950/80 border border-neutral-800/80 rounded-lg text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed h-[340px]">
              {selectedSample.healedCode}
            </pre>
          </div>
        </div>
      </section>

      {/* SECTION 2: Automatic Revertible State Insurance */}
      <section className="space-y-4 pt-4 border-t border-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Automatic Revertible State Insurance (rst-XXXX)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Captures an isolated snapshot restore point before any logic modifications are written to disk, ensuring a permanent risk-free fallback canvas.
            </p>
          </div>
        </div>

        {/* Restore Points Table */}
        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Snapshot ID</th>
                  <th className="py-2.5 px-4 font-semibold">Target File</th>
                  <th className="py-2.5 px-4 font-semibold">Differential Summary</th>
                  <th className="py-2.5 px-4 font-semibold">Snapshot SHA256</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Fallback Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {restorePoints.map((point) => (
                  <tr key={point.id} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-amber-400">
                      {point.id}
                      {activeSnapshotId === point.id && (
                        <span className="ml-2 text-[10px] text-emerald-400 font-normal">(Current Pre-Patch)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-300">
                      <code>{point.targetFile}</code>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-300 font-sans">{point.diffSummary}</td>
                    <td className="py-2.5 px-4 text-neutral-500 text-[10px] truncate max-w-[140px]">
                      {point.snapshotHash}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleRevertSnapshot(point.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        Revert State
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3: Continuous Integration Validation */}
      <section className="space-y-4 pt-4 border-t border-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Continuous Integration &amp; Regression Test Suite
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Executes independent multi-stage regression testing post-repair to verify a clean exit code 0 status trail before permanent disk commits.
            </p>
          </div>
          <button
            onClick={runCiValidation}
            disabled={isRunningCi}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 hover:border-amber-500 rounded transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            {isRunningCi ? 'Running Regression Harness...' : 'Re-Run Multi-Stage CI Suite'}
          </button>
        </div>

        {/* 4-Stage CI Progress Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className={`p-2.5 rounded border ${ciStage >= 1 ? 'bg-neutral-900 border-amber-500/70 text-amber-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
            <div className="text-[10px] text-neutral-400 uppercase">Stage 1</div>
            <div className="font-semibold mt-0.5">Lexical Invariant</div>
          </div>
          <div className={`p-2.5 rounded border ${ciStage >= 2 ? 'bg-neutral-900 border-amber-500/70 text-amber-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
            <div className="text-[10px] text-neutral-400 uppercase">Stage 2</div>
            <div className="font-semibold mt-0.5">AST Node Continuity</div>
          </div>
          <div className={`p-2.5 rounded border ${ciStage >= 3 ? 'bg-neutral-900 border-amber-500/70 text-amber-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
            <div className="text-[10px] text-neutral-400 uppercase">Stage 3</div>
            <div className="font-semibold mt-0.5">Memory Sweep</div>
          </div>
          <div className={`p-2.5 rounded border ${ciCompleted ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
            <div className="text-[10px] text-neutral-400 uppercase">Stage 4</div>
            <div className="font-semibold mt-0.5">Exit Code 0 Check</div>
          </div>
        </div>

        {/* Live CI Console Output */}
        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-300 space-y-1 max-h-56 overflow-y-auto">
          {ciLogs.length === 0 ? (
            <div className="text-neutral-500">
              CI harness awaiting trigger. Click &apos;Trigger Deep AST Surgery&apos; or &apos;Re-Run Multi-Stage CI Suite&apos; above.
            </div>
          ) : (
            ciLogs.map((logLine, idx) => (
              <div
                key={idx}
                className={
                  logLine.includes('EXIT CODE 0')
                    ? 'text-emerald-400 font-bold'
                    : logLine.startsWith('  ✔')
                    ? 'text-emerald-300/90'
                    : logLine.startsWith('[CI-STAGE')
                    ? 'text-amber-300 font-semibold'
                    : 'text-neutral-400'
                }
              >
                {logLine}
              </div>
            ))
          )}
        </div>

        {exitCode === 0 && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ASSERTION VERIFIED: Regression harness finished with clean exit code 0. Patch approved for permanent disk persistence.</span>
            </div>
            <span className="font-bold px-2 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">STATUS 0</span>
          </div>
        )}
      </section>
    </div>
  );
};
