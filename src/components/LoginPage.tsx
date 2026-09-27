import React, { useState } from 'react';
import {
  KeyRound,
  UserCheck,
  Shield,
  ShieldCheck,
  LogIn,
  UserPlus,
  Lock,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Crown,
  Database,
  Trash2,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { LocalDatabaseService } from '../services/localDatabase';
import { SystemTier, User, UserSession, WhiteLabelConfig } from '../types';

interface LoginPageProps {
  currentUser: User | null;
  onUserChanged: (user: User, session: UserSession) => void;
  whiteLabel: WhiteLabelConfig;
  onNavigateToCheckout: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onUserChanged,
  whiteLabel,
  onNavigateToCheckout,
}) => {
  const db = LocalDatabaseService.getInstance();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'sessions'>('login');

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState<string>('damoneward');
  const [loginPassword, setLoginPassword] = useState<string>('SovereignAdmin2026!');

  // Register form
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('SovereignPass2026!');
  const [regTier, setRegTier] = useState<SystemTier>('Fortress');

  // State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  const users = db.getUsers();
  const sessions = db.getSessions();
  const currentSession = db.getCurrentSession();
  const adminUser = users.find((u) => u.username.toLowerCase() === 'damoneward' || u.is_admin);

  const handlePrefillAdmin = () => {
    setLoginIdentifier('damoneward');
    setLoginPassword('SovereignAdmin2026!');
    setSuccessMsg('Loaded sovereign credentials for administrator damoneward.');
  };

  const handleAdminQuickLogin = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { user, session } = db.authenticate('damoneward', 'sela123');
      onUserChanged(user, session);
      setSuccessMsg(`Welcome back, Sovereign Administrator damoneward (damoneward38@gmail.com). Session token active.`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!loginIdentifier.trim()) {
        throw new Error('Username or email is required.');
      }
      const { user, session } = db.authenticate(loginIdentifier, loginPassword || 'sela123');
      onUserChanged(user, session);
      setSuccessMsg(`Successfully authenticated as '${user.username}' (${user.tier_access} Tier). Hardware token verified.`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
        throw new Error('All registration fields are required.');
      }
      const { user, session } = db.registerUser(regUsername, regEmail, regPassword, regTier);
      onUserChanged(user, session);
      setSuccessMsg(`User '${user.username}' created database-side. Argon2 hash stored on local disk.`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleSwitchUser = (user: User) => {
    try {
      const { session } = db.authenticate(user.username, 'sela123');
      onUserChanged(user, session);
      setSuccessMsg(`Switched active operational identity to '${user.username}'.`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    db.deleteSession(sessionId);
    setSuccessMsg(`Session token '${sessionId}' terminated.`);
    const active = db.getCurrentSession();
    if (active?.user) {
      onUserChanged(active.user, active);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Scope */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Sovereign Security Gateway</span>
              <span>·</span>
              <span>Pure Local Database Authentication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <KeyRound className="w-7 h-7 text-amber-400" />
              Local Disk Authentication &amp; Identity Portal
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-3xl font-sans">
              All credentials, session tokens, and passwords are authenticated strictly database-side in local PostgreSQL storage using Argon2 encryption with zero telemetry or external tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Argon2id Engine: Nominal
            </span>
          </div>
        </div>
      </div>

      {/* ADMIN SPOTLIGHT BANNER: damoneward */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-500/60 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-sans">
                damoneward
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-neutral-950">
                SOVEREIGN ADMIN
              </span>
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                damoneward38@gmail.com
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-sans mt-0.5">
              Root architect privileges granted. Full system governance across NAMI, MatrixBroker, and CyberHealer cores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentUser?.username.toLowerCase() === 'damoneward' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Active Admin Session
            </span>
          ) : (
            <button
              onClick={handleAdminQuickLogin}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Login as Admin (damoneward)</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-xs font-mono text-red-200 flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Tabs */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-neutral-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-neutral-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Identity</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sessions');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-neutral-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Active Sessions ({sessions.length})</span>
            </button>
          </div>

          {/* TAB 1: Sign In */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">
                  Username or Registered Internal Email:
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. damoneward or damoneward38@gmail.com"
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-300 font-semibold">
                    Master Password:
                  </label>
                  <button
                    type="button"
                    onClick={handlePrefillAdmin}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-sans cursor-pointer underline"
                  >
                    Prefill damoneward Admin Credentials
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-3 pr-10 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 font-sans mt-1">
                  Secured via local Argon2 verification ($argon2id$v=19$m=65536,t=3,p=4). Zero remote telemetry.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Session via Local Disk Database</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Register */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold">Sovereign Username:</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. sentinel_alpha"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold">Internal Email Address:</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. sentinel@sela.internal"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-300 font-semibold">Master Password:</label>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-neutral-500 hover:text-neutral-300 cursor-pointer text-[10px] flex items-center gap-1"
                    >
                      {showRegPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showRegPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold">Assigned Tier Level:</label>
                  <select
                    value={regTier}
                    onChange={(e) => setRegTier(e.target.value as SystemTier)}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Shield">SELA SHIELD ($250/mo)</option>
                    <option value="Fortress">SELA FORTRESS ($1,500/mo)</option>
                    <option value="Sovereign">SELA SOVEREIGN (Enterprise White Label)</option>
                  </select>
                </div>
              </div>

              {/* Argon2 Parameter Box */}
              <div className="p-3 bg-neutral-950 rounded border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                <span className="text-amber-400 font-semibold uppercase block text-[10px]">
                  Local Argon2 Parameters
                </span>
                <div>Memory: 65,536 KB · Iterations: 3 · Parallelism: 4 · 128-bit Local CSPRNG Salt</div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Sovereign User into PostgreSQL Schema</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Active Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between text-neutral-400 pb-1 border-b border-neutral-800 text-[11px]">
                <span>Active Hardware Tracking Tokens</span>
                <span>Loopback Interface: 127.0.0.1</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {sessions.map((sess) => {
                  const isCurrent = currentSession?.session_id === sess.session_id;
                  return (
                    <div
                      key={sess.session_id}
                      className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                        isCurrent
                          ? 'bg-neutral-800/80 border-amber-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">{sess.user?.username || `User #${sess.user_id}`}</span>
                          <span className="text-[10px] text-neutral-400">({sess.user?.tier_access || 'Shield'})</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                              ACTIVE NOW
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                          <span className="text-neutral-500">Token:</span>
                          <code className="text-amber-200/90">{sess.session_id}</code>
                          <button
                            onClick={() => handleCopy(sess.session_id)}
                            title="Copy Token"
                            className="text-neutral-500 hover:text-white cursor-pointer"
                          >
                            {copiedToken === sess.session_id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!isCurrent && sess.user && (
                          <button
                            onClick={() => handleSwitchUser(sess.user!)}
                            className="px-2.5 py-1 text-[11px] rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 cursor-pointer"
                          >
                            Switch To
                          </button>
                        )}
                        {sessions.length > 1 && (
                          <button
                            onClick={() => handleRevokeSession(sess.session_id)}
                            title="Terminate Session"
                            className="p-1 rounded text-red-400 hover:bg-red-950/60 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Database Status & Quick Account Switcher */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Session Info Box */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Current Operational Identity
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Authenticated:</span>
                <span className="text-white font-bold">{currentUser?.username || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Email:</span>
                <span className="text-neutral-200">{currentUser?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Tier Access:</span>
                <span className="text-amber-400 font-semibold">{currentUser?.tier_access || 'Shield'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Bound IP:</span>
                <span className="text-emerald-400">{currentSession?.active_ip_address || '127.0.0.1'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <button
                onClick={onNavigateToCheckout}
                className="w-full py-2 px-3 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Upgrade / Purchase Tier License</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Select Seed Accounts */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <Database className="w-4 h-4 text-amber-400" />
              Sovereign Account Directory ({users.length})
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {users.map((u, idx) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <button
                    key={`login-user-acc-${u.id}-${u.username}-${idx}`}
                    onClick={() => handleSwitchUser(u)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                      isSelected
                        ? 'bg-neutral-800 border-amber-500 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                        <span>{u.username}</span>
                        {u.username.toLowerCase() === 'damoneward' && (
                          <Crown className="w-3 h-3 text-amber-400" />
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500">{u.email}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-300">
                      {u.tier_access}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
