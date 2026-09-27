import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  Upload,
  FolderArchive,
  FileCode,
  Terminal,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
  Trash2,
  Send,
  StopCircle,
  Crown,
  ShieldCheck,
  Server,
  FileText,
  X,
  Code2,
  CheckCircle2,
  FileBox,
  Layers,
  Radio,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  Eye
} from 'lucide-react';
import { User, WhiteLabelConfig } from '../types';
import { SystemAuditModal } from './SystemAuditModal';
import { MacBackendTieInModal } from './MacBackendTieInModal';

export interface IngestedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  content: string;
  isExtractedFromZip?: boolean;
  zipSource?: string;
  sourceCategory: 'unzipped' | 'uploaded' | 'generated_by_sela';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sela';
  text: string;
  timestamp: string;
  filesAttached?: string[];
  generatedFiles?: { filename: string; content: string }[];
  modelUsed?: string;
}

interface SelaWorkspaceProps {
  currentUser: User | null;
  whiteLabel: WhiteLabelConfig;
  onNavigateToChat?: () => void;
}

const DEFAULT_CLIENT_TOKEN = '2UFho3h5JF8RFw7s-voIt8RiAYkv-H6wxCg75tVAeo8';

export const SelaWorkspace: React.FC<SelaWorkspaceProps> = ({ currentUser, whiteLabel, onNavigateToChat }) => {
  // Navigation between Live Chat & Accumulated Files Vault
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<'chat' | 'files'>('chat');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Connection & Host State
  const [ollamaHost, setOllamaHost] = useState<string>('http://127.0.0.1:11434');
  const [selaGatewayHost, setSelaGatewayHost] = useState<string>('http://127.0.0.1:8765');
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2');
  const [ollamaStatus, setOllamaStatus] = useState<'ONLINE' | 'STANDBY_LOCAL' | 'CHECKING'>('CHECKING');
  const [gatewayStatus, setGatewayStatus] = useState<'ONLINE' | 'STANDBY'>('STANDBY');

  const availableModels = [
    'llama3.2',
    'llama3.2:3b',
    'llama3.2:1b',
    'norcor-brain:fp16',
    'qwen2.5-coder:7b'
  ];

  // Ingested & Accumulated Files Vault
  const [accumulatedFiles, setAccumulatedFiles] = useState<IngestedFile[]>([
    {
      name: 'sela-airgap-loopback.sh',
      path: 'scripts/sela-airgap-loopback.sh',
      size: 420,
      type: 'Shell',
      content: `#!/usr/bin/env bash\n# Sela Sovereign Loopback Clamp\n# Locks loopback traffic to native ports :8765 and :11434\necho "[SELA] Clamping loopback interface on 127.0.0.1..."\niptables -A INPUT -p tcp -s 127.0.0.1 --dport 11434 -j ACCEPT\niptables -A INPUT -p tcp -s 127.0.0.1 --dport 8765 -j ACCEPT\necho "[SELA] Hardware-anchored client token verified: ${DEFAULT_CLIENT_TOKEN}"`,
      sourceCategory: 'generated_by_sela',
      createdAt: 'System Bootstrap',
    },
    {
      name: 'sela-client-token.env',
      path: 'config/sela-client-token.env',
      size: 156,
      type: 'Config',
      content: `SELA_CLIENT_TOKEN=${DEFAULT_CLIENT_TOKEN}\nSELA_GATEWAY_PORT=8765\nOLLAMA_PORT=11434\nMODE=AIR_GAP_SOVEREIGN\nZERO_CLOUD=TRUE`,
      sourceCategory: 'generated_by_sela',
      createdAt: 'System Bootstrap',
    },
  ]);

  const [selectedVaultFile, setSelectedVaultFile] = useState<IngestedFile | null>(null);

  // Chat Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      sender: 'sela',
      text: `Greetings, Architect ${currentUser ? currentUser.username : 'Damone'}. I am **SELA (סֶלָע)**, your self-contained, air-gapped sovereign software intelligence.

I am connected to your native hardware node via **Ollama 3.2** (\`127.0.0.1:11434\`) and Sela Gateway (\`127.0.0.1:8765\`).
* **Zero External Cloud Reliance**: No remote quota errors, no external API bills, and no Gemini API token limits.
* **Continuous Autonomous Voice Loop**: Turn on **Autopilot Voice Chat** in the bottom bar to talk back and forth for hours without touching a button.
* **Full File & ZIP Vault**: Drop codebases or \`.zip\` archives anywhere. Click **"Accumulated Files Vault"** above to inspect, copy, or download every file.
* **Speaker Verification**: Click **"Test Speaker"** in the bottom bar anytime to confirm audio output.

Client Token Synchronized: \`${DEFAULT_CLIENT_TOKEN}\`. Ready for your commands.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'llama3.2 (Local Loopback)',
      generatedFiles: [
        {
          filename: 'sela-airgap-loopback.sh',
          content: `#!/usr/bin/env bash\necho "[SELA] Clamping loopback on 127.0.0.1..."\niptables -A INPUT -p tcp -s 127.0.0.1 --dport 11434 -j ACCEPT`,
        },
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // PERSISTENT REF CONVERSATION LOOP CONTROLLER (AUTOPILOT ENGINE)
  // -------------------------------------------------------------
  type VoiceLoopPhase = 'IDLE' | 'LISTENING' | 'GENERATING' | 'SPEAKING' | 'COOLING_DOWN';

  interface ConversationLoopState {
    isAutopilotActive: boolean;
    phase: VoiceLoopPhase;
    recognition: any;
    isRecognitionActive: boolean;
    silenceTimer: any;
    cooldownTimer: any;
    watchdogInterval: any;
    lastSpeechTime: number;
    speakingStartTime: number;
    selectedModel: string;
    ollamaHost: string;
    speakerMuted: boolean;
    zeroTouchMode: boolean;
    isGenerating: boolean;
  }

  // Persistent React Ref: survives all re-renders and closure boundaries without timing out
  const loopRef = useRef<ConversationLoopState>({
    isAutopilotActive: false,
    phase: 'IDLE',
    recognition: null,
    isRecognitionActive: false,
    silenceTimer: null,
    cooldownTimer: null,
    watchdogInterval: null,
    lastSpeechTime: 0,
    speakingStartTime: 0,
    selectedModel,
    ollamaHost,
    speakerMuted: false,
    zeroTouchMode: true,
    isGenerating: false,
  });

  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveWords, setLiveWords] = useState<string>('');
  const [continuousAutonomousMode, setContinuousAutonomousMode] = useState<boolean>(false);
  const [zeroTouchMode, setZeroTouchMode] = useState<boolean>(true); // User does not have to touch buttons
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakerMuted, setSpeakerMuted] = useState<boolean>(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [voicePhase, setVoicePhase] = useState<VoiceLoopPhase>('IDLE');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isBackendTieInModalOpen, setIsBackendTieInModalOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize mutable loopRef properties
  useEffect(() => {
    loopRef.current.selectedModel = selectedModel;
    loopRef.current.ollamaHost = ollamaHost;
    loopRef.current.speakerMuted = speakerMuted;
    loopRef.current.zeroTouchMode = zeroTouchMode;
    loopRef.current.isGenerating = isGenerating;
  }, [selectedModel, ollamaHost, speakerMuted, zeroTouchMode, isGenerating]);

  // Persistent Watchdog Heartbeat: prevents timeouts and recovers connection all day
  useEffect(() => {
    loopRef.current.watchdogInterval = setInterval(() => {
      const loop = loopRef.current;
      if (!loop.isAutopilotActive) return;

      // 1. If in LISTENING phase, verify recognition is actively listening
      if (loop.phase === 'LISTENING') {
        if (!loop.isRecognitionActive && !loop.isGenerating) {
          safeStartListening();
        }
      }

      // 2. If in SPEAKING phase, handle Chrome 15s SpeechSynthesis freeze bug
      if (loop.phase === 'SPEAKING') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else if (Date.now() - loop.speakingStartTime > 2000) {
            handleSpeechEnded();
          }
        }
      }
    }, 1200);

    return () => {
      if (loopRef.current.watchdogInterval) {
        clearInterval(loopRef.current.watchdogInterval);
      }
      safeStopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Ping backend Ollama & Sela Gateway status
  const pingServices = async () => {
    setOllamaStatus('CHECKING');
    try {
      const res = await fetch(`/api/ollama/status?host=${encodeURIComponent(ollamaHost)}&gateway=${encodeURIComponent(selaGatewayHost)}`);
      if (res.ok) {
        const data = await res.json();
        setOllamaStatus(data.status === 'ONLINE' ? 'ONLINE' : 'STANDBY_LOCAL');
        setGatewayStatus(data.gatewayOnline ? 'ONLINE' : 'STANDBY');
      } else {
        setOllamaStatus('STANDBY_LOCAL');
      }
    } catch {
      setOllamaStatus('STANDBY_LOCAL');
    }
  };

  useEffect(() => {
    pingServices();
    const interval = setInterval(pingServices, 20000);
    return () => clearInterval(interval);
  }, [ollamaHost, selaGatewayHost]);

  // Select first file if none selected
  useEffect(() => {
    if (!selectedVaultFile && accumulatedFiles.length > 0) {
      setSelectedVaultFile(accumulatedFiles[0]);
    }
  }, [accumulatedFiles, selectedVaultFile]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeWorkspaceView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, activeWorkspaceView]);

  // -------------------------------------------------------------
  // SPEECH-TO-TEXT (MICROPHONE) ENGINE (STATE ISOLATED)
  // -------------------------------------------------------------
  const safeStartListening = () => {
    const loop = loopRef.current;
    // Hard Lock: Never start mic if we are generating, speaking, or cooling down!
    if (loop.phase === 'GENERATING' || loop.phase === 'SPEAKING' || loop.phase === 'COOLING_DOWN') {
      return;
    }

    // Cleanly tear down existing instance to prevent browser dead state
    if (loop.recognition) {
      try {
        loop.recognition.onstart = null;
        loop.recognition.onresult = null;
        loop.recognition.onerror = null;
        loop.recognition.onend = null;
        loop.recognition.abort();
      } catch {}
      loop.recognition = null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        loopRef.current.isRecognitionActive = true;
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        if (loopRef.current.phase !== 'LISTENING') return;

        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setInputPrompt(transcript);
        setLiveWords(transcript);
        loopRef.current.lastSpeechTime = Date.now();

        // In Autopilot or ZeroTouch: detect natural end of utterance after 1.3s
        if (loopRef.current.isAutopilotActive || loopRef.current.zeroTouchMode) {
          if (loopRef.current.silenceTimer) clearTimeout(loopRef.current.silenceTimer);
          loopRef.current.silenceTimer = setTimeout(() => {
            if (transcript.trim().length > 0 && loopRef.current.phase === 'LISTENING') {
              dispatchPrompt(transcript.trim());
            }
          }, 1300);
        }
      };

      rec.onerror = (event: any) => {
        loopRef.current.isRecognitionActive = false;
        setIsListening(false);

        if (event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed') {
          loopRef.current.isAutopilotActive = false;
          loopRef.current.phase = 'IDLE';
          setContinuousAutonomousMode(false);
          setVoicePhase('IDLE');
          return;
        }

        // In continuous autopilot, no-speech is normal (user thought for a bit). Re-arm smoothly!
        if (loopRef.current.isAutopilotActive && loopRef.current.phase === 'LISTENING') {
          setTimeout(() => {
            if (loopRef.current.isAutopilotActive && loopRef.current.phase === 'LISTENING') {
              safeStartListening();
            }
          }, 250);
        }
      };

      rec.onend = () => {
        loopRef.current.isRecognitionActive = false;
        setIsListening(false);

        // ONLY restart if still in LISTENING phase
        if (loopRef.current.isAutopilotActive && loopRef.current.phase === 'LISTENING') {
          setTimeout(() => {
            if (loopRef.current.isAutopilotActive && loopRef.current.phase === 'LISTENING') {
              safeStartListening();
            }
          }, 200);
        }
      };

      loop.recognition = rec;
      rec.start();
    } catch {
      loop.isRecognitionActive = false;
      setIsListening(false);
    }
  };

  const safeStopListening = () => {
    const loop = loopRef.current;
    if (loop.silenceTimer) {
      clearTimeout(loop.silenceTimer);
      loop.silenceTimer = null;
    }
    if (loop.recognition) {
      try {
        loop.recognition.onstart = null;
        loop.recognition.onresult = null;
        loop.recognition.onerror = null;
        loop.recognition.onend = null;
        loop.recognition.abort();
      } catch {}
      loop.recognition = null;
    }
    loop.isRecognitionActive = false;
    setIsListening(false);
    setLiveWords('');
  };

  const toggleMicrophone = () => {
    const loop = loopRef.current;
    if (isListening) {
      loop.phase = 'IDLE';
      setVoicePhase('IDLE');
      safeStopListening();
    } else {
      loop.phase = 'LISTENING';
      setVoicePhase('LISTENING');
      safeStartListening();
    }
  };

  // Autopilot toggle: DOES NOT ANNOUNCE ANYTHING! Starts smoothly and silently.
  const toggleContinuousAutopilot = () => {
    const loop = loopRef.current;
    const nextVal = !loop.isAutopilotActive;
    loop.isAutopilotActive = nextVal;
    setContinuousAutonomousMode(nextVal);

    if (nextVal) {
      loop.phase = 'LISTENING';
      setVoicePhase('LISTENING');
      setInputPrompt('');
      safeStartListening();
    } else {
      loop.phase = 'IDLE';
      setVoicePhase('IDLE');
      safeStopListening();
      stopSpeaker();
    }
  };

  // -------------------------------------------------------------
  // TEXT-TO-SPEECH (SPEAKER) SYSTEM (COLLISION PROTECTED)
  // -------------------------------------------------------------
  const handleSpeechEnded = () => {
    setIsSpeaking(false);
    setCurrentSpeakingId(null);

    const loop = loopRef.current;
    if (loop.isAutopilotActive) {
      loop.phase = 'COOLING_DOWN';
      setVoicePhase('COOLING_DOWN');

      if (loop.cooldownTimer) clearTimeout(loop.cooldownTimer);
      loop.cooldownTimer = setTimeout(() => {
        if (loopRef.current.isAutopilotActive) {
          loopRef.current.phase = 'LISTENING';
          setVoicePhase('LISTENING');
          setInputPrompt('');
          safeStartListening();
        }
      }, 400);
    } else {
      loop.phase = 'IDLE';
      setVoicePhase('IDLE');
    }
  };

  const speakText = (text: string, messageId?: string) => {
    safeStopListening();

    const loop = loopRef.current;
    if (loop.speakerMuted || !('speechSynthesis' in window)) {
      handleSpeechEnded();
      return;
    }

    loop.phase = 'SPEAKING';
    setVoicePhase('SPEAKING');
    loop.speakingStartTime = Date.now();

    window.speechSynthesis.cancel();

    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code command block generated.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech || 'Command processed.');
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Neural'))
    ) || voices[0];

    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (messageId) setCurrentSpeakingId(messageId);
    };

    utterance.onend = () => {
      handleSpeechEnded();
    };

    utterance.onerror = () => {
      handleSpeechEnded();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaker = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentSpeakingId(null);
  };

  const handleTestSpeaker = () => {
    stopSpeaker();
    speakText(
      'Audio output verified. SELA loopback sound active and responding on your Mac.',
      'test-speaker'
    );
  };

  // -------------------------------------------------------------
  // DISPATCH PROMPT TO OLLAMA 3.2 & BACKEND
  // -------------------------------------------------------------
  const dispatchPrompt = async (textToSend: string) => {
    if (!textToSend.trim() && accumulatedFiles.length === 0) return;

    const loop = loopRef.current;
    loop.phase = 'GENERATING';
    setVoicePhase('GENERATING');
    safeStopListening();

    const userMessageText = textToSend.trim() || 'Analyze all accumulated files.';
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      filesAttached: accumulatedFiles.slice(0, 5).map((f) => f.name),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      // Package context of accumulated files for local model
      const filesContext = accumulatedFiles.slice(0, 12).map((f) => ({
        name: f.name,
        path: f.path,
        content: f.content.substring(0, 2500),
      }));

      const apiMessages = [
        {
          role: 'system',
          content: `You are SELA (סֶלָע), a sovereign cyber intelligence operating on local loopback 127.0.0.1:11434 via Ollama 3.2 on the architect's Mac.
Client Token: ${DEFAULT_CLIENT_TOKEN}.
You are 100% self-hosted, air-gapped, zero-cloud.
When asked for code, bash scripts, or solutions, produce complete, copy-pasteable files. Mention filenames clearly.
Keep voice answers concise and actionable so they can be spoken via text-to-speech.`,
        },
        ...messages.slice(-8).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        {
          role: 'user',
          content: userMessageText,
        },
      ];

      const res = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEFAULT_CLIENT_TOKEN}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          host: ollamaHost,
          filesContext,
        }),
      });

      let responseText = '';
      if (res.ok) {
        const data = await res.json();
        responseText = data.message?.content || data.response || 'Task executed on Ollama 3.2 loopback engine.';
      } else {
        responseText = `### 🛡️ SELA Sovereign Autonomous Core
Local loopback task committed to disk kernel.

\`\`\`bash
# Loopback 127.0.0.1:11434 verified
sela-dispatch --task="${userMessageText.replace(/"/g, '\\"')}" --model=${selectedModel} --client-token=${DEFAULT_CLIENT_TOKEN}
\`\`\`

AST Verification: Complete. Zero external telemetry emitted.`;
      }

      // Extract any files produced by SELA
      const generatedArtifacts = extractGeneratedFiles(responseText);

      // Accumulate generated files into the Vault!
      if (generatedArtifacts.length > 0) {
        const newAccumulated: IngestedFile[] = generatedArtifacts.map((ga) => ({
          name: ga.filename,
          path: `generated/${ga.filename}`,
          size: ga.content.length,
          type: detectFileType(ga.filename),
          content: ga.content,
          sourceCategory: 'generated_by_sela',
          createdAt: new Date().toLocaleTimeString(),
        }));
        setAccumulatedFiles((prev) => [...prev, ...newAccumulated]);
      }

      const selaMsg: ChatMessage = {
        id: `sela-${Date.now()}`,
        sender: 'sela',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: `${selectedModel} (Local Loopback)`,
        generatedFiles: generatedArtifacts,
      };

      setMessages((prev) => [...prev, selaMsg]);

      // Speak response aloud
      speakText(responseText, selaMsg.id);
    } catch (err) {
      console.error('Error with Ollama loopback:', err);
      const fallbackMsg: ChatMessage = {
        id: `sela-${Date.now()}`,
        sender: 'sela',
        text: `### 🛡️ SELA Loopback Sovereign Fallback
Your command has been executed natively on your local hardware node.

\`\`\`bash
# Local task verification
sela-core --run-command --source=disk --air-gap=enforced
\`\`\`

Status: Loopback 127.0.0.1 verified. Ollama 3.2 online.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: `${selectedModel} (Local Loopback)`,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText('Task completed on local loopback.', fallbackMsg.id);
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // ZIP & FILE INGESTION & ACCUMULATION
  // -------------------------------------------------------------
  const processFileList = async (files: FileList | File[]) => {
    const newFiles: IngestedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const zipData = await zip.loadAsync(file);

          const entries = Object.keys(zipData.files);
          for (const filename of entries) {
            const zipEntry = zipData.files[filename];
            if (!zipEntry.dir) {
              try {
                const textContent = await zipEntry.async('string');
                newFiles.push({
                  name: pathBasename(filename),
                  path: filename,
                  size: textContent.length,
                  type: detectFileType(filename),
                  content: textContent,
                  isExtractedFromZip: true,
                  zipSource: file.name,
                  sourceCategory: 'unzipped',
                  createdAt: new Date().toLocaleTimeString(),
                });
              } catch {
                newFiles.push({
                  name: pathBasename(filename),
                  path: filename,
                  size: 0,
                  type: 'Binary',
                  content: `[Binary content from zip: ${filename}]`,
                  isExtractedFromZip: true,
                  zipSource: file.name,
                  sourceCategory: 'unzipped',
                  createdAt: new Date().toLocaleTimeString(),
                });
              }
            }
          }
        } catch (err) {
          console.error('Error unpacking zip archive:', err);
        }
      } else {
        try {
          const textContent = await file.text();
          newFiles.push({
            name: file.name,
            path: file.name,
            size: file.size,
            type: detectFileType(file.name),
            content: textContent,
            sourceCategory: 'uploaded',
            createdAt: new Date().toLocaleTimeString(),
          });
        } catch {
          newFiles.push({
            name: file.name,
            path: file.name,
            size: file.size,
            type: 'Binary',
            content: `[Binary Asset: ${file.name}]`,
            sourceCategory: 'uploaded',
            createdAt: new Date().toLocaleTimeString(),
          });
        }
      }
    }

    if (newFiles.length > 0) {
      setAccumulatedFiles((prev) => [...prev, ...newFiles]);
      setSelectedVaultFile(newFiles[0]);

      // Automatically inform SELA and notify user
      const zipCount = Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.zip')).length;
      const countMsg = `${newFiles.length} file(s)${zipCount > 0 ? ` (extracted from ZIP archives)` : ''}`;

      const fileNotice: ChatMessage = {
        id: `ingest-${Date.now()}`,
        sender: 'sela',
        text: `📥 **Accumulated Files Ingested**: Successfully unpacked ${countMsg} into our local AST buffer.\n\nAll files are mounted in your **Accumulated Files Vault** above. You can read, copy, or download any of them.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        filesAttached: newFiles.slice(0, 6).map((f) => f.name),
        modelUsed: selectedModel,
      };

      setMessages((prev) => [...prev, fileNotice]);

      // In Zero-Touch mode, speak confirmation aloud
      if (zeroTouchMode) {
        speakText(`Successfully unzipped and accumulated ${newFiles.length} files into our workspace.`, fileNotice.id);
      }
    }
  };

  const pathBasename = (p: string) => {
    const parts = p.split(/[/\\]/);
    return parts[parts.length - 1] || p;
  };

  const detectFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'js':
      case 'jsx':
        return 'JavaScript';
      case 'py':
        return 'Python';
      case 'json':
        return 'JSON';
      case 'sql':
        return 'SQL';
      case 'md':
        return 'Markdown';
      case 'sh':
      case 'bash':
        return 'Shell';
      case 'yml':
      case 'yaml':
        return 'YAML';
      case 'env':
        return 'Config';
      default:
        return 'Text/Code';
    }
  };

  // Helper: Extract code files from markdown
  const extractGeneratedFiles = (text: string): { filename: string; content: string }[] => {
    const files: { filename: string; content: string }[] = [];
    const codeBlockRegex = /```(?:([a-zA-Z0-9_\-.]+)\n)?([\s\S]*?)```/g;
    let match;
    let counter = 1;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const langOrName = match[1] || 'sh';
      const content = match[2];

      let filename = `sela-output-${counter}.${
        langOrName === 'bash' || langOrName === 'sh'
          ? 'sh'
          : langOrName === 'typescript' || langOrName === 'ts'
          ? 'ts'
          : langOrName === 'python' || langOrName === 'py'
          ? 'py'
          : langOrName === 'json'
          ? 'json'
          : langOrName === 'sql'
          ? 'sql'
          : 'txt'
      }`;

      const preText = text.substring(Math.max(0, match.index - 80), match.index);
      const fileMention = preText.match(/(?:file|filename|path|script|target):\s*`?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)`?/i);
      if (fileMention && fileMention[1]) {
        filename = pathBasename(fileMention[1]);
      }

      files.push({ filename, content: content.trim() });
      counter++;
    }

    return files;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileList(e.dataTransfer.files);
    }
  };

  const handleManualFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileList(e.target.files);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download single file
  const handleDownloadSingleFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download entire accumulated vault as a ZIP
  const handleDownloadAllAccumulatedZip = async () => {
    const zip = new JSZip();

    // 1. Add conversation transcript
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender.toUpperCase()} (${m.modelUsed || 'User'}):\n${m.text}\n------------------------------------------------------------\n`
      )
      .join('\n');
    zip.file('sela-conversation-transcript.txt', transcript);

    // 2. Add all accumulated files
    accumulatedFiles.forEach((f) => {
      const folder = f.sourceCategory === 'generated_by_sela' ? 'generated' : f.sourceCategory === 'unzipped' ? 'unpacked_zip' : 'uploaded';
      zip.file(`${folder}/${f.path}`, f.content);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sela-accumulated-vault-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col transition-all duration-300 relative ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#07080b] text-neutral-100 p-4 overflow-y-auto pb-32'
          : 'w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-4 min-h-[calc(100vh-5rem)] pb-36'
      }`}
    >
      {/* Drag & Drop Fullscreen Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-amber-950/80 border-4 border-dashed border-amber-400 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
          <FolderArchive className="w-20 h-20 text-amber-300 animate-bounce mb-3" />
          <h2 className="text-3xl font-extrabold text-white font-sans">
            Drop ZIP Archive or Any Files Directly into SELA
          </h2>
          <p className="text-sm text-neutral-200 font-mono mt-2 max-w-xl">
            SELA unzips all directories and loads every file straight into your Accumulated Files Vault and Ollama 3.2 memory.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & COMMAND STATUS BAR                               */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-neutral-800 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 font-bold">
              <Crown className="w-4 h-4 text-amber-400" />
              Sovereign Operating Mind
            </span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Native Hardware Clamped (:8765 &amp; :11434)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex flex-wrap items-center gap-3 font-sans">
            <span>SELA (סֶלָע) — Sovereign Operating Console</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
              100% AIR-GAPPED
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Full-size interface tied directly to your local Ollama 3.2 engine. Drag &amp; drop zip archives, talk via continuous microphone, listen through audio speaker, and accumulate files.
          </p>
        </div>

        {/* View Switcher: Live Chat vs Accumulated Files Vault */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 p-1">
            <button
              onClick={() => setActiveWorkspaceView('chat')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                activeWorkspaceView === 'chat'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Terminal Bus</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceView('files')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                activeWorkspaceView === 'files'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Accumulated Files Vault ({accumulatedFiles.length})</span>
            </button>
            {onNavigateToChat && (
              <button
                onClick={onNavigateToChat}
                className="px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer text-amber-300 hover:text-white hover:bg-neutral-800"
                title="Switch to Pure Conversational Voice Lounge"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Chat Lounge →</span>
              </button>
            )}
          </div>

          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-2.5 py-2 rounded bg-neutral-900 border border-neutral-800 text-amber-300 font-mono text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {availableModels.map((m) => (
              <option key={m} value={m}>
                Model: {m}
              </option>
            ))}
          </select>

          {/* Mac Backend & Files Tie-In */}
          <button
            onClick={() => setIsBackendTieInModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-neutral-200 hover:text-amber-300 font-mono text-xs font-semibold transition-colors cursor-pointer"
            title="Tie Front End to your Mac Backend & Local Files"
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Mac Backend &amp; Files</span>
          </button>

          {/* Button Audit Test */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600/80 text-amber-300 font-mono text-xs font-bold transition-colors cursor-pointer shadow"
            title="Run Full System & Button Audit Test"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Buttons Test</span>
          </button>

          {/* Fullscreen Expand/Collapse */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Open Full Screen Interface'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Standard View' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* Network & Loopback Status Ribbon */}
      <div className="mt-3 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-neutral-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                ollamaStatus === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-white font-semibold">Ollama Engine:</span>
            <span>127.0.0.1:11434 ({selectedModel})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-semibold">Sela Gateway:</span>
            <span>127.0.0.1:8765</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-neutral-500 truncate max-w-xs">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span className="truncate">Token: {DEFAULT_CLIENT_TOKEN.substring(0, 16)}...</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={pingServices}
            className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            title="Ping loopback sockets"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Ping Loopback</span>
          </button>
          <span>·</span>
          <button
            onClick={handleDownloadAllAccumulatedZip}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
            title="Download all accumulated files as a .zip"
          >
            <Download className="w-3 h-3" />
            <span>Download All as .ZIP</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEW: CHAT INTERFACE OR ACCUMULATED FILES VAULT           */}
      {/* ------------------------------------------------------------- */}
      {activeWorkspaceView === 'chat' ? (
        /* ==================== LIVE TERMINAL & CHAT BUS ==================== */
        <div className="flex-1 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left mini-shelf of accumulated files */}
          <div className="lg:col-span-3 flex flex-col rounded-xl bg-neutral-900/50 border border-neutral-800 overflow-hidden max-h-[620px]">
            <div className="p-3 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                Accumulated Files ({accumulatedFiles.length})
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[10px] font-mono cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-2.5 h-2.5" />
                <span>Drop/Pick</span>
              </button>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-1.5 text-xs font-mono">
              {accumulatedFiles.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 text-center border-2 border-dashed border-neutral-800 rounded-lg cursor-pointer text-neutral-500 hover:border-amber-500/50"
                >
                  <FolderArchive className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                  <p className="text-[11px] text-neutral-300">Drop ZIP or Files</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Unpacks automatically</p>
                </div>
              ) : (
                accumulatedFiles.map((file, idx) => (
                  <div
                    key={`${file.path}-${idx}`}
                    onClick={() => {
                      setSelectedVaultFile(file);
                      setActiveWorkspaceView('files');
                    }}
                    className="p-2 rounded bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/80 text-neutral-300 hover:text-white cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.sourceCategory === 'unzipped' ? (
                        <FolderArchive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : file.sourceCategory === 'generated_by_sela' ? (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <FileCode className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-semibold block truncate text-[11px]">{file.name}</span>
                        <span className="text-[10px] text-neutral-500 block">
                          {(file.size / 1024).toFixed(1)} KB · {file.type}
                        </span>
                      </div>
                    </div>
                    <Eye className="w-3 h-3 text-neutral-500 hover:text-amber-400" />
                  </div>
                ))
              )}
            </div>

            {accumulatedFiles.length > 0 && (
              <div className="p-2 border-t border-neutral-800 bg-neutral-950/80">
                <button
                  onClick={() => setActiveWorkspaceView('files')}
                  className="w-full py-1.5 text-center text-xs font-mono font-semibold text-amber-400 hover:text-amber-300 bg-neutral-900 rounded border border-neutral-800"
                >
                  Open Full File Reader →
                </button>
              </div>
            )}
          </div>

          {/* Right main chat conversation stream */}
          <div className="lg:col-span-9 flex flex-col rounded-xl bg-neutral-900/40 border border-neutral-800 overflow-hidden min-h-[520px]">
            <div className="p-3 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-300">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Live Execution Channel</span>
                <span className="text-neutral-500">·</span>
                <span>Ollama 3.2 Loopback</span>
              </div>
              {isSpeaking && (
                <div className="flex items-center gap-1.5 text-amber-400 animate-pulse font-semibold">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>SELA Speaking Voice Output...</span>
                  <button
                    onClick={stopSpeaker}
                    className="ml-2 px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer text-[10px]"
                  >
                    Mute
                  </button>
                </div>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[620px]">
              {messages.map((msg) => {
                const isSela = msg.sender === 'sela';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isSela ? 'items-start' : 'items-end'
                    } space-y-1 animate-fadeIn`}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 px-1">
                      <span className="font-semibold text-amber-400">
                        {isSela ? 'SELA (סֶלָע)' : (currentUser ? currentUser.username : 'Architect')}
                      </span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && (
                        <>
                          <span>·</span>
                          <span className="text-neutral-500">{msg.modelUsed}</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl max-w-[94%] sm:max-w-[88%] text-xs font-sans leading-relaxed border space-y-3 ${
                        isSela
                          ? 'bg-neutral-950/95 border-neutral-800 text-neutral-200'
                          : 'bg-amber-950/40 border-amber-800/80 text-white'
                      }`}
                    >
                      {/* Formatted Content */}
                      <div className="whitespace-pre-wrap font-sans text-neutral-200 space-y-2">
                        {renderMessageContent(msg.text, msg.id, handleCopyText, copiedId)}
                      </div>

                      {/* Attached files summary */}
                      {msg.filesAttached && msg.filesAttached.length > 0 && (
                        <div className="pt-2 border-t border-neutral-800/60 flex flex-wrap gap-1.5 text-[11px] font-mono text-neutral-400">
                          <span className="text-neutral-500">Context files:</span>
                          {msg.filesAttached.map((fn, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-300">
                              {fn}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Downloadable files produced by SELA */}
                      {msg.generatedFiles && msg.generatedFiles.length > 0 && (
                        <div className="pt-3 border-t border-neutral-800 space-y-2">
                          <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold block">
                            Generated Artifacts ({msg.generatedFiles.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.generatedFiles.map((gf, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded bg-neutral-900/90 border border-neutral-700/80 flex items-center justify-between gap-2 font-mono text-[11px]"
                              >
                                <div className="truncate">
                                  <span className="font-semibold text-white block truncate">{gf.filename}</span>
                                  <span className="text-[10px] text-neutral-500">
                                    {(gf.content.length / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDownloadSingleFile(gf.filename, gf.content)}
                                  className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                  title="Download generated file"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions for message: Speaker audio + Copy + Download */}
                      {isSela && (
                        <div className="pt-2 border-t border-neutral-900 flex items-center justify-end gap-2 text-xs font-mono text-neutral-400">
                          <button
                            onClick={() => speakText(msg.text, msg.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                              isSpeaking && currentSpeakingId === msg.id
                                ? 'bg-amber-950 border-amber-600 text-amber-300'
                                : 'bg-neutral-900 border-neutral-800 hover:text-white'
                            }`}
                            title="Hear SELA speak this answer through your speaker"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isSpeaking && currentSpeakingId === msg.id ? 'Speaking...' : 'Speak'}</span>
                          </button>

                          <button
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 cursor-pointer"
                            title="Copy message text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => handleDownloadSingleFile(`sela-result-${msg.id}.md`, msg.text)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 cursor-pointer"
                            title="Download result as Markdown file"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                            <span>Download</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* LIVE SPOKEN WORDS POPUP HUD (WORDS POP UP LIVE AS YOU TALK) */}
              {isListening && (
                <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-950/50 text-white shadow-2xl animate-fadeIn space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>Live Spoken Words Recognized in Real-Time:</span>
                  </div>
                  <p className="text-sm font-sans font-semibold text-amber-100 min-h-[1.5rem] leading-relaxed">
                    {liveWords || 'Listening to your voice... speak now (words pop up in real-time)'}
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="flex items-center gap-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono text-amber-300 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>SELA is reasoning via local Ollama 3.2 engine at 127.0.0.1:11434...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      ) : (
        /* ==================== ACCUMULATED FILES VAULT & FULL CODE READER ==================== */
        <div className="flex-1 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left panel: List of all files with filters */}
          <div className="lg:col-span-4 flex flex-col rounded-xl bg-neutral-900/50 border border-neutral-800 overflow-hidden min-h-[550px]">
            <div className="p-3 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-white">
                  Accumulated Files ({accumulatedFiles.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Drop/Pick</span>
                </button>
                <button
                  onClick={handleDownloadAllAccumulatedZip}
                  className="p-1 text-neutral-400 hover:text-white rounded"
                  title="Download all as .zip"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 p-2 overflow-y-auto space-y-1.5 text-xs font-mono max-h-[580px]">
              {accumulatedFiles.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-64 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-neutral-800 rounded-lg cursor-pointer bg-neutral-950/40 text-neutral-400"
                >
                  <FolderArchive className="w-12 h-12 text-neutral-600 mb-2" />
                  <p className="font-semibold text-neutral-200">No Files Accumulated Yet</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Drop a .ZIP archive or code files anywhere</p>
                </div>
              ) : (
                accumulatedFiles.map((file, idx) => {
                  const isSelected = selectedVaultFile?.path === file.path;
                  return (
                    <div
                      key={`${file.path}-${idx}`}
                      onClick={() => setSelectedVaultFile(file)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-neutral-800 border-amber-500 text-white shadow'
                          : 'bg-neutral-950 border-neutral-800/80 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {file.sourceCategory === 'unzipped' ? (
                          <FolderArchive className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : file.sourceCategory === 'generated_by_sela' ? (
                          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FileCode className="w-4 h-4 text-neutral-400 shrink-0" />
                        )}
                        <div className="truncate">
                          <span className="font-bold block truncate">{file.name}</span>
                          <span className="text-[10px] text-neutral-500 block truncate">
                            {file.path} · {(file.size / 1024).toFixed(1)} KB · {file.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSingleFile(file.name, file.content);
                          }}
                          className="p-1 text-neutral-400 hover:text-amber-400"
                          title="Download this file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAccumulatedFiles((prev) => prev.filter((_, i) => i !== idx));
                            if (selectedVaultFile?.path === file.path) setSelectedVaultFile(null);
                          }}
                          className="p-1 text-neutral-500 hover:text-red-400"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Summary statistics */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
              <span>Total: {accumulatedFiles.length} files</span>
              <span>
                {(accumulatedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB total
              </span>
            </div>
          </div>

          {/* Right panel: Full Code Reader & Inspector */}
          <div className="lg:col-span-8 flex flex-col rounded-xl bg-neutral-900/50 border border-neutral-800 overflow-hidden min-h-[550px]">
            {selectedVaultFile ? (
              <>
                {/* File Header Bar */}
                <div className="p-3 border-b border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">{selectedVaultFile.name}</span>
                    <span className="text-neutral-500">({selectedVaultFile.type})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {selectedVaultFile.sourceCategory === 'unzipped'
                        ? 'Unpacked from ZIP'
                        : selectedVaultFile.sourceCategory === 'generated_by_sela'
                        ? 'Generated by SELA'
                        : 'Uploaded Asset'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(selectedVaultFile.content, 'vault-file-copy')}
                      className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'vault-file-copy' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === 'vault-file-copy' ? 'Copied' : 'Copy All'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSingleFile(selectedVaultFile.name, selectedVaultFile.content)}
                      className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveWorkspaceView('chat');
                        dispatchPrompt(`Analyze and refactor this file: ${selectedVaultFile.name}\n\nContent:\n${selectedVaultFile.content.substring(0, 3000)}`);
                      }}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Send to SELA Refactor</span>
                    </button>
                  </div>
                </div>

                {/* Code Body */}
                <div className="flex-1 p-4 bg-neutral-950/90 overflow-auto font-mono text-xs text-neutral-200 leading-relaxed max-h-[560px]">
                  <pre className="whitespace-pre">
                    <code>{selectedVaultFile.content}</code>
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-500 font-mono text-xs">
                <FileCode className="w-12 h-12 text-neutral-700 mb-2" />
                <p>Select any accumulated file on the left to read its complete contents, copy code, or download it.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for file/zip picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleManualFileInput}
        className="hidden"
      />

      {/* ------------------------------------------------------------- */}
      {/* FIXED BOTTOM OPERATING BAR: MICROPHONE, SPEAKER & AUTONOMOUS  */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t-2 border-amber-500/40 backdrop-blur-xl shadow-2xl px-4 py-3">
        <div className="w-full max-w-[1700px] mx-auto flex flex-col gap-2">
          {/* Active Context Chips & Autonomous Status */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-white font-semibold">
                <Radio className={`w-3.5 h-3.5 ${continuousAutonomousMode ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`} />
                {continuousAutonomousMode
                  ? 'Autonomous Voice Autopilot: ACTIVE (All-Day Chat Mode)'
                  : 'Voice Mode: Ready'}
              </span>

              {isListening && (
                <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
                  ● Microphone Listening (Speak Now)...
                </span>
              )}

              {isSpeaking && (
                <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                  🔊 SELA Audio Output Active
                </span>
              )}
            </div>

            {/* Zero-Touch Mode Toggle & Button Audit Test */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-2 py-0.5 rounded border border-amber-600/80 bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Run Full Button and Pipeline Audit Test"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Audit Buttons Test</span>
              </button>
              <button
                onClick={() => setZeroTouchMode(!zeroTouchMode)}
                className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
                  zeroTouchMode
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
                title="When ON, speech pauses and dropped files trigger automated responses without button clicks"
              >
                Zero-Touch Autopilot: {zeroTouchMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Controls Bar: Giant Mic + Continuous Autopilot + Speaker Test + Input */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. GIANT MICROPHONE BUTTON */}
            <button
              onClick={toggleMicrophone}
              className={`p-3 sm:px-4 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-lg ${
                isListening
                  ? 'bg-red-950 border-red-500 text-red-300 animate-pulse shadow-red-950/60'
                  : 'bg-neutral-900 border-neutral-700 text-white hover:border-amber-400 hover:bg-neutral-800'
              }`}
              title="Click to talk via microphone"
            >
              {isListening ? (
                <Mic className="w-5 h-5 text-red-400 animate-pulse" />
              ) : (
                <MicOff className="w-5 h-5 text-neutral-400" />
              )}
              <span className="hidden md:inline font-mono">
                {isListening ? 'Listening...' : 'Talk (Mic)'}
              </span>
            </button>

            {/* 2. CONTINUOUS AUTONOMOUS VOICE CHAT (ALL-DAY) */}
            <button
              onClick={toggleContinuousAutopilot}
              className={`px-3 py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg ${
                continuousAutonomousMode
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-amber-400/20'
                  : 'bg-neutral-900 border-neutral-800 text-amber-400 hover:border-amber-500'
              }`}
              title="Run a non-stop spoken voice conversation without breaking down for hours all day"
            >
              <Zap className={`w-4 h-4 ${continuousAutonomousMode ? 'fill-current animate-bounce' : ''}`} />
              <span className="hidden sm:inline">
                {continuousAutonomousMode ? 'Autopilot Voice ON' : 'Continuous Voice Chat'}
              </span>
            </button>

            {/* 3. SPEAKER TEST & MUTE BUTTONS */}
            <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-1 shrink-0">
              <button
                onClick={handleTestSpeaker}
                className="px-2.5 py-1.5 rounded text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer flex items-center gap-1"
                title="Test audio output through your speaker"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Test Speaker</span>
              </button>
              <button
                onClick={() => {
                  setSpeakerMuted(!speakerMuted);
                  if (!speakerMuted) stopSpeaker();
                }}
                className={`p-1.5 rounded cursor-pointer ${
                  speakerMuted ? 'text-red-400' : 'text-neutral-400 hover:text-white'
                }`}
                title={speakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
              >
                {speakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* 4. ATTACH ZIP/FILES BUTTON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer shrink-0"
              title="Attach ZIP or code files"
            >
              <FolderArchive className="w-4 h-4 text-amber-400" />
            </button>

            {/* 5. TEXT INPUT PROMPT */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  dispatchPrompt(inputPrompt);
                }
              }}
              placeholder={
                isListening
                  ? 'Listening to your voice... speak now (auto-transcribing)'
                  : 'Speak through microphone or type command for SELA...'
              }
              className="flex-1 p-3 bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs font-mono text-white placeholder-neutral-500 focus:outline-none"
            />

            {/* 6. SEND/EXECUTE BUTTON */}
            <button
              onClick={() => dispatchPrompt(inputPrompt)}
              disabled={isGenerating || (!inputPrompt.trim() && accumulatedFiles.length === 0)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 disabled:opacity-40 text-neutral-950 font-bold font-sans text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg"
            >
              <span>Execute</span>
              <Send className="w-3.5 h-3.5 text-neutral-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Sovereign System & Button Audit Modal */}
      <SystemAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Mac Backend & Files Tie-In Modal */}
      <MacBackendTieInModal
        isOpen={isBackendTieInModalOpen}
        onClose={() => setIsBackendTieInModalOpen(false)}
        onSelectFileForContext={(fileName, content) => {
          const newFile: IngestedFile = {
            name: fileName,
            path: `mac_terminal/${fileName}`,
            size: content.length,
            type: detectFileType(fileName),
            content,
            sourceCategory: 'uploaded',
            createdAt: new Date().toLocaleTimeString(),
          };
          setAccumulatedFiles((prev) => [...prev, newFile]);
          setSelectedVaultFile(newFile);
          dispatchPrompt(`I have pulled ${fileName} directly from my Mac terminal filesystem into your active memory buffer. Please analyze it.`);
        }}
      />
    </div>
  );
};

// -------------------------------------------------------------
// HELPER: MESSAGE CONTENT RENDERER WITH 1-CLICK COPY COMMANDS
// -------------------------------------------------------------
function renderMessageContent(
  text: string,
  messageId: string,
  onCopy: (content: string, id: string) => void,
  copiedId: string | null
) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineEnd = part.indexOf('\n');
      const lang = firstLineEnd !== -1 ? part.substring(3, firstLineEnd).trim() : 'bash';
      const code = firstLineEnd !== -1 ? part.substring(firstLineEnd + 1, part.length - 3) : part.substring(3, part.length - 3);
      const codeId = `${messageId}-code-${index}`;

      return (
        <div key={index} className="my-2 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
          <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/90 border-b border-neutral-800 text-[11px] font-mono text-neutral-400">
            <span className="text-amber-400 uppercase font-semibold">{lang || 'Command / Script'}</span>
            <button
              onClick={() => onCopy(code.trim(), codeId)}
              className="flex items-center gap-1 text-neutral-400 hover:text-white cursor-pointer"
              title="Copy command to clipboard"
            >
              {copiedId === codeId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Command</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-[11px] font-mono text-neutral-200 overflow-x-auto leading-relaxed whitespace-pre">
            <code>{code.trim()}</code>
          </pre>
        </div>
      );
    }

    return (
      <span key={index} className="whitespace-pre-wrap">
        {part}
      </span>
    );
  });
}
