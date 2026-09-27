import React from 'react';
import {
  Shield,
  ShieldAlert,
  Cpu,
  Lock,
  Terminal,
  Database,
  Sliders,
  User as UserIcon,
  Hammer,
  CreditCard,
  KeyRound,
  Crown,
  Sparkles,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { SystemTier, User, WhiteLabelConfig } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTier: SystemTier;
  currentUser: User | null;
  whiteLabel: WhiteLabelConfig;
  onOpenAuthModal: () => void;
  onOpenTierModal: () => void;
  onOpenAuditModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentTier,
  currentUser,
  whiteLabel,
  onOpenAuthModal,
  onOpenTierModal,
  onOpenAuditModal,
}) => {
  const brandTitle = whiteLabel.hideSelaBrand
    ? whiteLabel.brandName || 'Sovereign Fortress'
    : 'Sela סֶלָע';

  const navItems = [
    { id: 'overview', label: 'Command Core', icon: Cpu },
    { id: 'sela-chat', label: 'SELA Live Chat', icon: MessageSquare },
    { id: 'sela', label: 'SELA Core (Ollama)', icon: Sparkles },
    { id: 'builder', label: 'App Builder', icon: Hammer },
    { id: 'nami', label: 'NAMI Control', icon: Sliders },
    { id: 'matrixbroker', label: 'MatrixBroker', icon: Lock },
    { id: 'cyberhealer', label: 'CyberHealer', icon: Terminal },
    { id: 'blueprints', label: 'Blueprints & DB', icon: Database },
    { id: 'checkout', label: 'Checkout', icon: CreditCard },
    { id: 'login', label: 'Identity & Login', icon: KeyRound },
  ];

  const isAdmin = currentUser?.username.toLowerCase() === 'damoneward' || !!currentUser?.is_admin;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors font-sans">
              {brandTitle}
            </span>
          </button>
          {!whiteLabel.hideSelaBrand && (
            <span className="hidden sm:inline-block text-xs font-mono text-neutral-500 pl-2 border-l border-neutral-800">
              Air-Gapped Node
            </span>
          )}
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-neutral-800 text-amber-300 font-semibold shadow-inner'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Button Audit Test */}
          {onOpenAuditModal && (
            <button
              onClick={onOpenAuditModal}
              title="Run System and Button Audit Test"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-600/80 rounded hover:bg-amber-900/60 transition-all cursor-pointer whitespace-nowrap font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Audit Test</span>
            </button>
          )}

          {/* Checkout CTA */}
          <button
            onClick={() => setActiveTab('checkout')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === 'checkout'
                ? 'bg-amber-400 text-neutral-950 font-bold border-amber-300'
                : 'text-amber-300 bg-amber-950/40 border-amber-800/80 hover:bg-amber-900/40'
            }`}
          >
            <CreditCard className="w-3 h-3" />
            <span>Licensing</span>
          </button>

          {/* Tier indicator / switch trigger */}
          <button
            onClick={onOpenTierModal}
            title="Click to view or switch Commercial Paywall Tier"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-neutral-300 bg-neutral-900 border border-neutral-700/60 rounded hover:border-amber-500/50 hover:bg-neutral-800/80 transition-all cursor-pointer whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-300">{currentTier}</span>
          </button>

          {/* User profile / session trigger */}
          <button
            onClick={() => setActiveTab('login')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap border ${
              isAdmin
                ? 'bg-amber-950/60 text-amber-300 border-amber-600/80 hover:bg-amber-900/60'
                : 'text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border-neutral-700/40'
            }`}
          >
            {isAdmin ? (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="max-w-[110px] truncate text-left font-mono">
              {currentUser ? currentUser.username : 'damoneward'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar for small screens */}
      <div className="flex lg:hidden overflow-x-auto py-2 px-3 border-t border-neutral-900 bg-neutral-950 gap-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
                isActive ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

