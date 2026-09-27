import React, { useState, useEffect } from 'react';
import {
  Server,
  FolderTree,
  Terminal,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Folder,
  FileText,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Database,
  X
} from 'lucide-react';

interface MacBackendTieInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFileForContext?: (fileName: string, content: string) => void;
}

interface FileItem {
  name: string;
  relPath: string;
  absPath: string;
  isDir: boolean;
  size: number;
}

export const MacBackendTieInModal: React.FC<MacBackendTieInModalProps> = ({
  isOpen,
  onClose,
  onSelectFileForContext,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'files' | 'terminal'>('guide');
  const [gatewayUrl, setGatewayUrl] = useState<string>('http://127.0.0.1:8765');
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://127.0.0.1:11434');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    hostFs: boolean;
    gateway: boolean;
    ollama: boolean;
    details?: string;
  }>({ hostFs: false, gateway: false, ollama: false });

  // File browser state
  const [currentPath, setCurrentPath] = useState<string>('.');
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [selectedFileContent, setSelectedFileContent] = useState<{
    path: string;
    size: number;
    content: string;
    truncated: boolean;
  } | null>(null);

  // Terminal state
  const [terminalCmd, setTerminalCmd] = useState<string>('ls -la');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isRunningCmd, setIsRunningCmd] = useState<boolean>(false);

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkAllConnections();
      loadFiles('.');
    }
  }, [isOpen]);

  const checkAllConnections = async () => {
    setIsChecking(true);
    let hostFs = false;
    let gateway = false;
    let ollama = false;

    // 1. Check local host filesystem API
    try {
      const res = await fetch('/api/fs/files?path=.');
      if (res.ok) hostFs = true;
    } catch {}

    // 2. Check Ollama & Gateway status
    try {
      const res = await fetch(`/api/ollama/status?gateway=${encodeURIComponent(gatewayUrl)}&host=${encodeURIComponent(ollamaUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.gatewayOnline) gateway = true;
        if (data.ollamaOnline) ollama = true;
      }
    } catch {}

    setConnectionStatus({
      hostFs,
      gateway,
      ollama,
      details: hostFs
        ? 'Direct Host Filesystem Linked'
        : 'Connecting to Sovereign Loopback Socket',
    });
    setIsChecking(false);
  };

  const loadFiles = async (dirPath: string) => {
    setIsLoadingFiles(true);
    setSelectedFileContent(null);
    try {
      const res = await fetch(`/api/fs/files?path=${encodeURIComponent(dirPath)}`);
      if (res.ok) {
        const data = await res.json();
        setFileList(data.items || []);
        setCurrentPath(data.relDir || dirPath);
      }
    } catch (err) {
      console.error('[LOAD FILES ERROR]', err);
    }
    setIsLoadingFiles(false);
  };

  const handleReadFile = async (item: FileItem) => {
    try {
      const res = await fetch(`/api/fs/file?path=${encodeURIComponent(item.relPath)}&max_kb=300`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFileContent(data);
      }
    } catch (err) {
      console.error('[READ FILE ERROR]', err);
    }
  };

  const handleRunCommand = async () => {
    if (!terminalCmd.trim()) return;
    setIsRunningCmd(true);
    try {
      const res = await fetch('/api/fs/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: terminalCmd }),
      });
      if (res.ok) {
        const data = await res.json();
        setTerminalOutput(
          `$ ${data.command}\n[Exit Code: ${data.exitCode}]\n\n${data.stdout}${data.stderr ? '\n[STDERR]:\n' + data.stderr : ''}`
        );
      }
    } catch (err: any) {
      setTerminalOutput(`Error executing command: ${err.message}`);
    }
    setIsRunningCmd(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  if (!isOpen) return null;

  const pythonLaunchCmd = 'python3 sela-gateway.py';
  const curlDownloadCmd = 'curl -O http://localhost:3000/sela-gateway.py && python3 sela-gateway.py';
  const nodeLaunchCmd = 'node sela-gateway.mjs';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-sans">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/80 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Tie Front End to Back End &amp; Files</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  SOVEREIGN MERGER
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Direct integration between this console, your Mac terminal, massive project files, and Ollama AIs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Connectivity HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 sm:p-4 bg-neutral-900/40 border-b border-neutral-800 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Host File System</span>
              <span className="text-neutral-200 font-bold">Process File Access</span>
            </div>
            {connectionStatus.hostFs ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> PENDING
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Mac Terminal Gateway</span>
              <span className="text-neutral-200 font-bold">:8765 Loopback</span>
            </div>
            {connectionStatus.gateway ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> READY TO RUN
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Ollama AIs</span>
              <span className="text-neutral-200 font-bold">:11434 Engine</span>
            </div>
            {connectionStatus.ollama ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> ATTACHED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> STANDBY
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 font-semibold cursor-pointer transition-colors ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Complete Merger Guide
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 px-3 border-b-2 font-semibold cursor-pointer transition-colors ${
              activeTab === 'files'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            2. Live Filesystem Browser ({fileList.length} files)
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`pb-2.5 px-3 border-b-2 font-semibold cursor-pointer transition-colors ${
              activeTab === 'terminal'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3. Direct Terminal Pipeline
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'guide' && (
            <div className="space-y-6 text-sm">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-neutral-200 space-y-2">
                <h3 className="font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  How Front End &amp; Back End Merge Without Crashing Your Browser
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  You noted that your terminal files are massive, so you cannot upload them all into the app.
                  <strong> You don't have to upload them!</strong> Instead of pushing gigabytes into the browser memory,
                  SELA connects to a local gateway that lives right inside your terminal folder. SELA reads file structures on-demand, streams AST code snippets, and runs your terminal commands directly on your Mac.
                </p>
              </div>

              {/* Step 1: Running on your Mac */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-neutral-400 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-300 flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Start the SELA Sovereign Gateway on your Mac</span>
                </h4>
                <p className="text-xs text-neutral-400 font-sans">
                  Open your Mac terminal in your project directory (where your files and models live) and execute this 1 command. It requires zero pip installs:
                </p>

                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-xs flex items-center justify-between gap-3">
                  <span className="text-amber-300 select-all">{pythonLaunchCmd}</span>
                  <button
                    onClick={() => handleCopy(pythonLaunchCmd, 'python-cmd')}
                    className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    {copiedCmd === 'python-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'python-cmd' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-2">
                  <span>Prefer Node.js? Run:</span>
                  <code className="text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded">{nodeLaunchCmd}</code>
                </div>
              </div>

              {/* Step 2: The Two Ports */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-neutral-400 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-300 flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>Confirm Your Ports (Loopback Clamping)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 space-y-1">
                    <span className="text-amber-400 font-bold block">Port 8765: SELA Gateway</span>
                    <p className="text-neutral-400 text-[11px] font-sans">
                      Handles filesystem browsing, reading large files in chunks, and executing Mac bash commands.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 space-y-1">
                    <span className="text-amber-400 font-bold block">Port 11434: Ollama Local AIs</span>
                    <p className="text-neutral-400 text-[11px] font-sans">
                      Runs your local models (<code>llama3.2</code>, <code>qwen2.5-coder</code>, <code>norcor-brain</code>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Complete Tie-in Verification */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-neutral-400 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-300 flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>Verify Tie-in</span>
                </h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={checkAllConnections}
                    disabled={isChecking}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>Run Connection Probe Now</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold cursor-pointer"
                  >
                    Browse Local Files
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <FolderTree className="w-4 h-4 text-amber-400" />
                  <span>Current Path:</span>
                  <code className="text-amber-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {currentPath}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  {currentPath !== '.' && (
                    <button
                      onClick={() => loadFiles('.')}
                      className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer"
                    >
                      Root (./)
                    </button>
                  )}
                  <button
                    onClick={() => loadFiles(currentPath)}
                    className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* File List */}
                <div className="md:col-span-6 bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-neutral-800/60 font-mono text-xs">
                  {fileList.map((item) => (
                    <div
                      key={item.relPath}
                      onClick={() => (item.isDir ? loadFiles(item.relPath) : handleReadFile(item))}
                      className="p-2.5 hover:bg-neutral-800/80 cursor-pointer flex items-center justify-between gap-2 transition-colors group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {item.isDir ? (
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-amber-300" />
                        )}
                        <span className={`truncate ${item.isDir ? 'text-amber-200 font-semibold' : 'text-neutral-300'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 shrink-0">
                        {item.isDir ? 'DIR' : `${(item.size / 1024).toFixed(1)} KB`}
                      </span>
                    </div>
                  ))}
                  {fileList.length === 0 && !isLoadingFiles && (
                    <div className="p-4 text-center text-neutral-500 text-xs">
                      No files found in current directory.
                    </div>
                  )}
                </div>

                {/* File Preview */}
                <div className="md:col-span-6 bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between max-h-80 overflow-hidden font-mono text-xs">
                  {selectedFileContent ? (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <span className="text-amber-400 font-bold truncate">
                          {selectedFileContent.path.split('/').pop()}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {(selectedFileContent.size / 1024).toFixed(1)} KB {selectedFileContent.truncated ? '(Truncated)' : ''}
                        </span>
                      </div>
                      <pre className="flex-1 my-2 overflow-y-auto text-[11px] text-neutral-300 bg-neutral-900/60 p-2 rounded whitespace-pre-wrap">
                        {selectedFileContent.content}
                      </pre>
                      {onSelectFileForContext && (
                        <button
                          onClick={() => {
                            onSelectFileForContext(
                              selectedFileContent.path.split('/').pop() || 'file',
                              selectedFileContent.content
                            );
                            onClose();
                          }}
                          className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Inject into SELA Conversation Context</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-center p-4">
                      <FileText className="w-8 h-8 mb-2 opacity-40" />
                      <span>Select any file on the left to inspect its contents directly from your machine.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="space-y-4 font-mono text-xs">
              <p className="text-neutral-400 text-xs font-sans">
                Execute directives directly on your host machine to verify terminal commands, test models, or pull git repositories.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={terminalCmd}
                  onChange={(e) => setTerminalCmd(e.target.value)}
                  placeholder="e.g. ls -la, git status, ollama list, pwd"
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:border-amber-400 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunCommand();
                  }}
                />
                <button
                  onClick={handleRunCommand}
                  disabled={isRunningCmd}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer transition-all"
                >
                  {isRunningCmd ? 'Executing...' : 'Run'}
                </button>
              </div>

              {/* Quick Terminal Presets */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-neutral-500">Presets:</span>
                {['ls -la', 'pwd', 'git status', 'ollama list', 'df -h'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => {
                      setTerminalCmd(cmd);
                    }}
                    className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              {/* Terminal Screen Output */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 min-h-48 max-h-72 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
                {terminalOutput || '// Terminal ready. Type a command or click a preset above to run.'}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Loopback Token Clamped: 2UFho3h5JF...</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
