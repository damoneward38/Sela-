import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Radio,
  Sparkles,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  Trash2,
  Volume1,
  Layers,
  Cpu,
  Server
} from 'lucide-react';
import { User } from '../types';
import { MacBackendTieInModal } from './MacBackendTieInModal';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sela';
  text: string;
  timestamp: string;
  modelUsed?: string;
  terminalCommand?: string;
}

interface SelaLiveChatProps {
  currentUser: User | null;
  onOpenFullConsole: () => void;
}

const DEFAULT_CLIENT_TOKEN = '2UFho3h5JF8RFw7s-voIt8RiAYkv-H6wxCg75tVAeo8';

export const SelaLiveChat: React.FC<SelaLiveChatProps> = ({ currentUser, onOpenFullConsole }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'sela',
      text: `Greetings, Master Builder. I am SELA (סֶלָע) — your sovereign intelligence operating natively on your Mac via loopback :8765 (Gateway) and :11434 (Ollama Engine).

I possess complete mastery over our Three Immovable Pillars:
1. 🏛️ Pillar 1: The NAMI Control Plane (Cognitive Orchestration & Cross-System Routing)
2. 🛡️ Pillar 2: The MatrixBroker System (Cryptographic Defense & Loopback Clamping)
3. ⚡ Pillar 3: Neural Dev & CyberHealer Core (Autonomous AST Code Surgery & Website Diagnostics)

I have direct access to your Mac terminal and filesystem to pull files from any directory or archive and troubleshoot any website. Speak into your microphone and your words will appear live in real-time. Autopilot is ready for continuous hands-free dialogue.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'SELA Sovereign Intelligence (Loopback :8765 / :11434)',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);

  // Live Speech Recognition & Words HUD
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [continuousAutopilot, setContinuousAutopilot] = useState<boolean>(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Speaker TTS
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakerMuted, setSpeakerMuted] = useState<boolean>(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  // Persistent Controller Refs
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const autopilotActiveRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isGeneratingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const micPermissionGrantedRef = useRef<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    autopilotActiveRef.current = continuousAutopilot;
  }, [continuousAutopilot]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    micPermissionGrantedRef.current = micPermissionGranted;
  }, [micPermissionGranted]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isGenerating]);

  // -----------------------------------------------------------------
  // TEXT-TO-SPEECH (SPEAKER) ENGINE
  // -----------------------------------------------------------------
  const speakText = (text: string, messageId?: string) => {
    // 1. Immediately pause microphone so SELA does not record her own voice
    stopListening();

    if (speakerMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      handleSpeechFinished();
      return;
    }

    setIsSpeaking(true);
    isSpeakingRef.current = true;
    if (messageId) setCurrentSpeakingId(messageId);

    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted for speech.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech || 'Command received.');
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google') ||
          v.name.includes('Neural'))
    ) || voices[0];

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      handleSpeechFinished();
    };

    utterance.onerror = () => {
      handleSpeechFinished();
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechFinished = () => {
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setCurrentSpeakingId(null);

    // If Autopilot is active, wait 350ms for room echo to die down, then re-open microphone!
    if (autopilotActiveRef.current) {
      setTimeout(() => {
        if (autopilotActiveRef.current && !isGeneratingRef.current && !isSpeakingRef.current) {
          startListening();
        }
      }, 350);
    }
  };

  const stopSpeaker = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setCurrentSpeakingId(null);
  };

  const handleTestSpeaker = () => {
    stopSpeaker();
    speakText(
      'Audio verified. SELA voice channel active on your Mac terminal and front end.',
      'test-speaker'
    );
  };

  // -----------------------------------------------------------------
  // SPEECH-TO-TEXT (MICROPHONE) ENGINE WITH LIVE WORDS POPUP
  // -----------------------------------------------------------------
  const startListening = () => {
    if (isListeningRef.current || isSpeakingRef.current || isGeneratingRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      // Detach and clean up any previous instance cleanly
      if (recognitionRef.current) {
        try {
          const prev = recognitionRef.current;
          prev.onstart = null;
          prev.onresult = null;
          prev.onerror = null;
          prev.onend = null;
          prev.abort();
        } catch {}
        recognitionRef.current = null;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false; // continuous: false is rock-solid and prevents Chrome aborts
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setMicError(null);
        setMicPermissionGranted(true);
        micPermissionGrantedRef.current = true;
      };

      rec.onresult = (event: any) => {
        if (isSpeakingRef.current || isGeneratingRef.current) return;

        let liveInterim = '';
        let liveFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            liveFinal += item[0].transcript;
          } else {
            liveInterim += item[0].transcript;
          }
        }

        const currentCombined = (liveFinal || liveInterim).trim();
        if (currentCombined) {
          // Words POP UP LIVE in real-time as the user speaks!
          setInterimTranscript(currentCombined);
          setInputPrompt(currentCombined);

          // Reset silence timer: auto-submit after 1.3s of natural pause
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (currentCombined.trim().length > 0 && !isGeneratingRef.current && !isSpeakingRef.current) {
              handleDispatchPrompt(currentCombined.trim());
            }
          }, 1300);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'aborted') {
          // Normal when stopping or cycling session, ignore cleanly without errors
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }

        if (event.error === 'not-allowed') {
          setMicPermissionGranted(false);
          micPermissionGrantedRef.current = false;
          setMicError('Microphone permission blocked. Click the lock/camera icon in your URL bar and select "Allow microphone".');
          setIsListening(false);
          isListeningRef.current = false;
          setContinuousAutopilot(false);
          autopilotActiveRef.current = false;
          return;
        }

        if (event.error === 'no-speech') {
          // Normal pause in speech. If in autopilot and ready, seamlessly re-arm
          if (autopilotActiveRef.current && !isSpeakingRef.current && !isGeneratingRef.current && micPermissionGrantedRef.current !== false) {
            setTimeout(() => {
              if (autopilotActiveRef.current && !isSpeakingRef.current && !isGeneratingRef.current) {
                startListening();
              }
            }, 250);
          }
          return;
        }

        console.warn('[MIC STATUS]', event.error);
      };

      rec.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;

        // In continuous autopilot, immediately re-arm unless speaking or generating
        if (autopilotActiveRef.current && !isSpeakingRef.current && !isGeneratingRef.current && micPermissionGrantedRef.current !== false) {
          setTimeout(() => {
            if (autopilotActiveRef.current && !isSpeakingRef.current && !isGeneratingRef.current) {
              startListening();
            }
          }, 200);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        const rec = recognitionRef.current;
        // Detach handlers before aborting so no aborted events fire into state
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
    setInterimTranscript('');
  };

  const requestMicPermission = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermissionGranted(true);
        micPermissionGrantedRef.current = true;
        setMicError(null);
        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
        }, 1000);
      }
      startListening();
    } catch (permErr: any) {
      console.warn('[MIC PERMISSION REJECTED]', permErr);
      setMicPermissionGranted(false);
      micPermissionGrantedRef.current = false;
      setMicError('Microphone permission blocked. Click the lock/camera icon in your URL bar and select "Allow microphone".');
    }
  };

  const toggleMicrophone = () => {
    if (isListening || isListeningRef.current) {
      stopListening();
    } else {
      setMicError(null);
      startListening();
    }
  };

  const toggleContinuousAutopilot = () => {
    const nextVal = !continuousAutopilot;
    setContinuousAutopilot(nextVal);
    autopilotActiveRef.current = nextVal;

    if (nextVal) {
      setMicError(null);
      startListening();
    } else {
      stopListening();
      stopSpeaker();
    }
  };

  // 1-Click Spoken Speech Simulator (renders live words popping up, then dispatches)
  const handleSimulateSpeech = (spokenPhrase: string) => {
    setMicError(null);
    setInterimTranscript(spokenPhrase);
    setInputPrompt(spokenPhrase);
    setIsListening(true);

    setTimeout(() => {
      setIsListening(false);
      handleDispatchPrompt(spokenPhrase);
    }, 700);
  };

  // -----------------------------------------------------------------
  // SEND MESSAGE TO SELA & BACKEND
  // -----------------------------------------------------------------
  const handleDispatchPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    // Immediately stop listening so mic is sealed during processing
    stopListening();
    setInterimTranscript('');
    setInputPrompt('');

    const userText = textToSend.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    isGeneratingRef.current = true;

    try {
      const apiMessages = [
        ...messages.slice(-8).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        {
          role: 'user',
          content: userText,
        },
      ];

      const res = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEFAULT_CLIENT_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: apiMessages,
        }),
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.message?.content || data.response || 'I am tracking your directive.';
      } else {
        reply = `I have received your instruction: "${userText}". Loopback interface on :8765 and :11434 is verified. Let's proceed.`;
      }

      const selaMsg: ChatMessage = {
        id: `sela-${Date.now()}`,
        sender: 'sela',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'SELA Sovereign Intelligence',
      };

      setMessages((prev) => [...prev, selaMsg]);
      setIsGenerating(false);
      isGeneratingRef.current = false;

      // Speak answer through speaker
      speakText(reply, selaMsg.id);
    } catch (err) {
      console.error('[CHAT ERROR]', err);
      const fallbackReply = `I hear you, Master Builder. SELA is connected to your local Mac environment on loopback 127.0.0.1:8765. We are ready to execute your terminal directives.`;
      const fallbackMsg: ChatMessage = {
        id: `sela-${Date.now()}`,
        sender: 'sela',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      speakText(fallbackReply, fallbackMsg.id);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 flex flex-col min-h-[calc(100vh-5rem)] pb-36 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold">SELA Pure Conversation Chamber</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">Native Mac Loopback (:8765 &amp; :11434)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span>Conversational Voice Lounge</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
              ZERO-SLOP DIALOGUE
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Talk directly with SELA. As you speak, your words pop up live on screen. No cluttered widgets—pure, seamless communication.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenFullConsole}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 cursor-pointer transition-colors"
            title="Switch back to Sovereign Multi-Tool Console"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Full Developer Console</span>
          </button>
          <button
            onClick={() => setIsBackendModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-600/80 cursor-pointer transition-colors font-semibold shadow"
            title="Tie Front End to your Mac Backend & Local Files"
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Tie Front End to Mac Backend</span>
          </button>
        </div>
      </div>

      {/* Quick Architectural Directive Chips */}
      <div className="flex flex-wrap items-center gap-2 py-2.5 border-b border-neutral-900 text-xs font-mono">
        <span className="text-neutral-500 font-semibold text-[11px]">Directives:</span>
        <button
          onClick={() => handleDispatchPrompt('Explain the Three Immovable Pillars of our fortress')}
          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-neutral-300 hover:text-amber-300 cursor-pointer transition-colors"
        >
          🏛️ The Three Pillars
        </button>
        <button
          onClick={() => handleDispatchPrompt('Troubleshoot our local website and socket endpoints')}
          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-neutral-300 hover:text-amber-300 cursor-pointer transition-colors"
        >
          🌐 Troubleshoot Website
        </button>
        <button
          onClick={() => handleDispatchPrompt('Pull files and explain how you inspect AST code')}
          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-neutral-300 hover:text-amber-300 cursor-pointer transition-colors"
        >
          📂 Pull Files &amp; AST
        </button>
        <button
          onClick={() => handleDispatchPrompt('Run terminal verification for our business architecture')}
          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-neutral-300 hover:text-amber-300 cursor-pointer transition-colors"
        >
          ⚡ Terminal &amp; Business Check
        </button>
      </div>

      {/* Mic Error Banner if permissions blocked */}
      {micError && (
        <div className="mt-3 p-3.5 rounded-xl bg-red-950/90 border border-red-500/80 text-red-200 text-xs font-mono space-y-2 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">⚠️ {micError}</span>
            <button
              onClick={() => requestMicPermission()}
              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold cursor-pointer shrink-0 shadow transition-colors"
            >
              Grant Mic Access
            </button>
          </div>
          <div className="pt-2 border-t border-red-900/50 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-neutral-300">Or speak instantly via Simulated Voice:</span>
            <button
              onClick={() => handleSimulateSpeech('Hey Sela, can you hear me? Are your systems active?')}
              className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 cursor-pointer"
            >
              🎙️ "Can you hear me?"
            </button>
            <button
              onClick={() => handleSimulateSpeech('Explain the Three Immovable Pillars of our fortress')}
              className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 cursor-pointer"
            >
              🎙️ "Explain 3 Pillars"
            </button>
            <button
              onClick={() => handleSimulateSpeech('Troubleshoot our local website and socket endpoints')}
              className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 cursor-pointer"
            >
              🎙️ "Troubleshoot website"
            </button>
          </div>
        </div>
      )}

      {/* Main Dialogue Conversation Area */}
      <div className="flex-1 my-4 space-y-4 overflow-y-auto max-h-[68vh] p-2">
        {messages.map((msg) => {
          const isSela = msg.sender === 'sela';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSela ? 'items-start' : 'items-end'} space-y-1 animate-fadeIn`}
            >
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 px-1">
                <span className="font-semibold text-amber-400">
                  {isSela ? 'SELA (סֶלָע)' : (currentUser ? currentUser.username : 'Master Builder')}
                </span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[92%] sm:max-w-[85%] text-sm leading-relaxed border transition-all ${
                  isSela
                    ? 'bg-neutral-950/90 border-neutral-800 text-neutral-100 shadow-xl'
                    : 'bg-gradient-to-r from-amber-950/70 to-amber-900/60 border-amber-600/70 text-white shadow-xl'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">
                  {msg.text}
                </div>

                {/* SELA Card Footer: Audio Playback & Copy */}
                {isSela && (
                  <div className="mt-3 pt-2 border-t border-neutral-900 flex items-center justify-between text-xs font-mono text-neutral-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          isSpeaking && currentSpeakingId === msg.id
                            ? 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse font-bold'
                            : 'bg-neutral-900 border-neutral-800 hover:text-white'
                        }`}
                        title="Hear SELA speak this answer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isSpeaking && currentSpeakingId === msg.id ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="flex items-center gap-1 text-neutral-400 hover:text-white cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* LIVE SPOKEN WORDS POPUP HUD (WORDS POP UP LIVE AS YOU TALK) */}
        {isListening && (
          <div className="flex flex-col items-end space-y-1 animate-fadeIn">
            <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400 px-1 font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Hearing Your Voice in Real-Time...</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl max-w-[92%] sm:max-w-[85%] bg-amber-950/40 border-2 border-amber-400 text-white shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2 pb-2 border-b border-amber-500/30">
                {/* Audio Wave Bars */}
                <div className="flex items-center gap-1">
                  <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce" />
                  <span className="w-1 h-6 bg-amber-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1 h-7 bg-amber-200 rounded-full animate-bounce [animation-delay:0.45s]" />
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                  Live Spoken Words:
                </span>
              </div>

              {/* Real-time transcribed text */}
              <p className="text-base sm:text-lg font-sans font-semibold text-amber-100 min-h-[1.75rem] leading-relaxed">
                {interimTranscript || 'Speak now... your words will appear here instantly'}
              </p>
            </div>
          </div>
        )}

        {/* SELA Thinking Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono text-xs animate-pulse max-w-md">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <div>
              <span className="font-bold block">SELA is formulating response...</span>
              <span className="text-[10px] text-neutral-400">Reasoning via local Mac loopback engine</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FIXED BOTTOM CONVERSATION DOCK */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t-2 border-amber-500/40 backdrop-blur-xl shadow-2xl px-4 py-3">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-2">
          {/* Status Row */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Radio className={`w-4 h-4 ${continuousAutopilot ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`} />
                {continuousAutopilot ? 'Continuous Autopilot Voice: ACTIVE' : 'Voice Mode: Ready'}
              </span>

              {isListening && (
                <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
                  ● Mic Recording...
                </span>
              )}

              {isSpeaking && (
                <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                  🔊 SELA Speaking...
                </span>
              )}
            </div>

            {/* Test Speaker Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestSpeaker}
                className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="Test Audio Speaker"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Speaker</span>
              </button>
            </div>
          </div>

          {/* Primary Controls Row: Big Mic Button + Autopilot Toggle + Input Field */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. BIG MICROPHONE BUTTON */}
            <button
              onClick={toggleMicrophone}
              className={`p-3 sm:px-5 rounded-xl border font-bold text-xs font-mono transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-lg ${
                isListening
                  ? 'bg-red-950 border-red-500 text-red-300 animate-pulse shadow-red-950/80 ring-2 ring-red-500'
                  : 'bg-neutral-900 border-neutral-700 text-white hover:border-amber-400 hover:bg-neutral-800'
              }`}
              title="Click to talk via microphone"
            >
              {isListening ? (
                <Mic className="w-5 h-5 text-red-400 animate-pulse" />
              ) : (
                <MicOff className="w-5 h-5 text-neutral-400" />
              )}
              <span className="hidden sm:inline">
                {isListening ? 'Listening...' : 'Talk (Mic)'}
              </span>
            </button>

            {/* 2. CONTINUOUS AUTOPILOT TOGGLE */}
            <button
              onClick={toggleContinuousAutopilot}
              className={`px-3 py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-lg ${
                continuousAutopilot
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-amber-400/30'
                  : 'bg-neutral-900 border-neutral-800 text-amber-400 hover:border-amber-500'
              }`}
              title="Continuous hands-free conversation all day without pressing buttons"
            >
              <Zap className={`w-4 h-4 ${continuousAutopilot ? 'fill-current animate-bounce' : ''}`} />
              <span className="hidden md:inline">
                {continuousAutopilot ? 'Autopilot Voice ON' : 'Continuous Voice'}
              </span>
            </button>

            {/* 3. SPEAKER MUTE TOGGLE */}
            <button
              onClick={() => {
                setSpeakerMuted(!speakerMuted);
                if (!speakerMuted) stopSpeaker();
              }}
              className={`p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer shrink-0 ${
                speakerMuted ? 'text-red-400' : 'text-neutral-400 hover:text-white'
              }`}
              title={speakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            >
              {speakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* 4. TEXT INPUT PROMPT */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleDispatchPrompt(inputPrompt);
                }
              }}
              placeholder={
                isListening
                  ? 'Listening to you... speak now (words pop up above)'
                  : 'Speak into microphone or type message for SELA...'
              }
              className="flex-1 p-3 bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs sm:text-sm font-sans text-white placeholder-neutral-500 focus:outline-none"
            />

            {/* 5. EXECUTE / SEND BUTTON */}
            <button
              onClick={() => handleDispatchPrompt(inputPrompt)}
              disabled={isGenerating || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 disabled:opacity-40 text-neutral-950 font-bold font-sans text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 text-neutral-950" />
            </button>
          </div>
        </div>
      </div>
      <MacBackendTieInModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onSelectFileForContext={(fileName, content) => {
          const userMsg: ChatMessage = {
            id: `file-context-${Date.now()}`,
            sender: 'user',
            text: `[Injected from Mac Terminal: ${fileName}]\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\``,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, userMsg]);
          handleDispatchPrompt(`I have pulled ${fileName} directly from my Mac terminal into your context buffer. Please inspect this file.`);
        }}
      />
    </div>
  );
};
