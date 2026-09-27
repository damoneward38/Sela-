/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SystemOverview } from './components/SystemOverview';
import { NamiControlPlane } from './components/NamiControlPlane';
import { MatrixBroker } from './components/MatrixBroker';
import { AutonomousDeployment } from './components/AutonomousDeployment';
import { HardenedBlueprints } from './components/HardenedBlueprints';
import { PaywallWhiteLabel } from './components/PaywallWhiteLabel';
import { AppBuilderBlueprint } from './components/AppBuilderBlueprint';
import { SelaWorkspace } from './components/SelaWorkspace';
import { SelaLiveChat } from './components/SelaLiveChat';
import { SystemAuditModal } from './components/SystemAuditModal';
import { LoginPage } from './components/LoginPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AuthModal } from './components/AuthModal';
import { LocalDatabaseService } from './services/localDatabase';
import { SystemTier, User, UserSession, WhiteLabelConfig } from './types';

const INITIAL_WHITE_LABEL: WhiteLabelConfig = {
  enabled: false,
  brandName: 'Sela Sovereign Core',
  subTitle: 'Private Enterprise Cyber Fortress',
  accentTheme: 'amber',
  tenantPrefix: 'sela-enterprise-node',
  hideSelaBrand: false,
  customDockerTag: 'sela/sovereign-node:latest',
  corporateDomain: 'sela.internal',
};

export default function App() {
  const db = LocalDatabaseService.getInstance();
  const [activeTab, setActiveTab] = useState<string>('sela-chat');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [currentTier, setCurrentTier] = useState<SystemTier>('Sovereign');
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>(INITIAL_WHITE_LABEL);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load session from disk/localStorage
  useEffect(() => {
    const session = db.getCurrentSession();
    if (session) {
      setCurrentSession(session);
      if (session.user) {
        setCurrentUser(session.user);
        setCurrentTier(session.user.tier_access);
      }
    } else {
      const users = db.getUsers();
      if (users.length > 0) {
        setCurrentUser(users[0]);
        setCurrentTier(users[0].tier_access);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUserChanged = (user: User, session: UserSession) => {
    setCurrentUser(user);
    setCurrentSession(session);
    setCurrentTier(user.tier_access);
    showToast(`Switched active local session to: ${user.username} (${user.tier_access} Tier)`);
  };

  const handleSelectTier = (tier: SystemTier) => {
    setCurrentTier(tier);
    if (currentUser) {
      db.updateUserTier(currentUser.id, tier);
      setCurrentUser((prev) => (prev ? { ...prev, tier_access: tier } : null));
    }
    showToast(`Membership Tier updated to: ${tier}`);
  };

  const handleUpdateWhiteLabel = (config: Partial<WhiteLabelConfig>) => {
    setWhiteLabel((prev) => ({ ...prev, ...config }));
    showToast('White Label configuration updated.');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTier={currentTier}
        currentUser={currentUser}
        whiteLabel={whiteLabel}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenTierModal={() => setActiveTab('tiers')}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-neutral-900 border border-amber-500/60 text-amber-300 text-xs font-mono shadow-2xl animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'overview' && (
          <SystemOverview
            onNavigate={(tab) => setActiveTab(tab)}
            currentTier={currentTier}
            currentUser={currentUser}
            whiteLabel={whiteLabel}
          />
        )}

        {activeTab === 'sela-chat' && (
          <SelaLiveChat
            currentUser={currentUser}
            onOpenFullConsole={() => setActiveTab('sela')}
          />
        )}

        {activeTab === 'sela' && (
          <SelaWorkspace
            currentUser={currentUser}
            whiteLabel={whiteLabel}
            onNavigateToChat={() => setActiveTab('sela-chat')}
          />
        )}

        {activeTab === 'builder' && <AppBuilderBlueprint whiteLabel={whiteLabel} />}

        {activeTab === 'nami' && <NamiControlPlane />}

        {activeTab === 'matrixbroker' && (
          <MatrixBroker
            currentUser={currentUser}
            onUserChange={() => {
              const session = db.getCurrentSession();
              if (session?.user) {
                setCurrentUser(session.user);
                setCurrentTier(session.user.tier_access);
              }
            }}
          />
        )}

        {activeTab === 'cyberhealer' && <AutonomousDeployment />}

        {activeTab === 'blueprints' && <HardenedBlueprints />}

        {activeTab === 'tiers' && (
          <PaywallWhiteLabel
            currentTier={currentTier}
            onSelectTier={handleSelectTier}
            currentUser={currentUser}
            whiteLabel={whiteLabel}
            onUpdateWhiteLabel={handleUpdateWhiteLabel}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage
            currentTier={currentTier}
            currentUser={currentUser}
            whiteLabel={whiteLabel}
            onTierPurchased={(tier) => {
              handleSelectTier(tier);
              showToast(`SELA ${tier} license activated and verified!`);
            }}
            onNavigateToCommand={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            currentUser={currentUser}
            onUserChanged={handleUserChanged}
            whiteLabel={whiteLabel}
            onNavigateToCheckout={() => setActiveTab('checkout')}
          />
        )}
      </main>

      {/* Pure Local Disk Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={handleUserChanged}
      />

      {/* Sovereign System & Button Audit Modal */}
      <SystemAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsAuditModalOpen(false);
        }}
      />

      {/* Sovereign Air-Gapped Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 px-4 sm:px-6 lg:px-8 text-neutral-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-semibold">
              {whiteLabel.hideSelaBrand ? whiteLabel.brandName : 'Sela (סֶלָע)'}
            </span>
            <span>·</span>
            <span>Zero-Cloud Sovereign Node</span>
            <span>·</span>
            <span className="text-emerald-500">100% Air-Gapped</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Loopback: 127.0.0.1:11434</span>
            <span>·</span>
            <span>Active Session: {currentSession?.session_id.substring(0, 16)}...</span>
            <span>·</span>
            <span>Exit Code: 0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
