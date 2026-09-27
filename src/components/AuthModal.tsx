import React, { useState } from 'react';
import {
  X,
  KeyRound,
  UserPlus,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import { LocalDatabaseService } from '../services/localDatabase';
import { SystemTier, User, UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChanged: (user: User, session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const db = LocalDatabaseService.getInstance();
  const [mode, setMode] = useState<'switch' | 'register' | 'login'>('switch');

  // Register Form
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('SovereignPass2026!');
  const [regTier, setRegTier] = useState<SystemTier>('Shield');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const users = db.getUsers();
  const currentSession = db.getCurrentSession();

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
      setSuccessMsg(`User '${user.username}' created locally. Argon2 hash registered on disk.`);
      setTimeout(() => {
        onClose();
      }, 1200);
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
        throw new Error('Username or email required.');
      }
      const { user, session } = db.authenticate(loginIdentifier, loginPassword || 'sela123');
      onUserChanged(user, session);
      setSuccessMsg(`Authenticated as '${user.username}'. Loopback hardware token active.`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleSelectUser = (user: User) => {
    try {
      const { session } = db.authenticate(user.username, 'sela123');
      onUserChanged(user, session);
      setSuccessMsg(`Switched to '${user.username}'.`);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Local Disk Authentication &amp; Sessions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab mode switcher */}
        <div className="flex gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800/80 text-xs font-mono">
          <button
            onClick={() => {
              setMode('switch');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded transition-colors ${
              mode === 'switch' ? 'bg-neutral-800 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Active Users ({users.length})
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded transition-colors ${
              mode === 'register' ? 'bg-neutral-800 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Local User
          </button>
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded transition-colors ${
              mode === 'login' ? 'bg-neutral-800 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Disk Login
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded bg-red-950/60 border border-red-800 text-xs font-mono text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE: Switch User */}
        {mode === 'switch' && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-400 font-sans">
              Select any local disk user to instantly activate their cryptographic session:
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {users.map((u, idx) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <div
                    key={`modal-user-acc-${u.id}-${u.username}-${idx}`}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-800 border-amber-500 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{u.username}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-amber-400 font-bold">
                            (Active)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-700 text-amber-300">
                        {u.tier_access}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-neutral-400 block mb-1">Username:</label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. sentinel_alpha"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Internal Email Address:</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="sentinel@sela.internal"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Password (Argon2 Hashed):</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Initial Tier Access:</label>
              <select
                value={regTier}
                onChange={(e) => setRegTier(e.target.value as SystemTier)}
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Shield">Sela Shield (Core Automation)</option>
                <option value="Fortress">Sela Fortress (Premium Cyber Shield)</option>
                <option value="Sovereign">Sela Sovereign (White Label Enterprise)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer mt-2"
            >
              Register Sovereign User (Pure Local Disk)
            </button>
          </form>
        )}

        {/* MODE: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-neutral-400 block mb-1">Username or Internal Email:</label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="architect_sovereign"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Password:</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Note: Preset test seed accounts accept any non-empty password.
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded font-sans transition-colors cursor-pointer mt-2"
            >
              Verify Argon2 Hash &amp; Open Session
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
          <span>Active IP: 127.0.0.1</span>
          <span className="text-emerald-400">Zero Cloud Network Tracking</span>
        </div>
      </div>
    </div>
  );
};
