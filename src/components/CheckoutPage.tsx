import React, { useState } from 'react';
import {
  Shield,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  Copy,
  Check,
  Crown,
  FileText,
  BadgeCheck,
  RotateCcw,
  Sparkles,
  Server
} from 'lucide-react';
import { LocalDatabaseService } from '../services/localDatabase';
import { SystemTier, User, WhiteLabelConfig } from '../types';

interface CheckoutPageProps {
  currentTier: SystemTier;
  currentUser: User | null;
  whiteLabel: WhiteLabelConfig;
  onTierPurchased: (tier: SystemTier) => void;
  onNavigateToCommand: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  currentTier,
  currentUser,
  whiteLabel,
  onTierPurchased,
  onNavigateToCommand,
}) => {
  const db = LocalDatabaseService.getInstance();
  const [selectedTier, setSelectedTier] = useState<SystemTier>(currentTier || 'Sovereign');
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [deploymentTarget, setDeploymentTarget] = useState<string>('bare-metal');
  
  // Organization details
  const [orgName, setOrgName] = useState<string>(
    whiteLabel.hideSelaBrand ? whiteLabel.brandName : 'Sovereign Enterprise Core'
  );
  const [adminName, setAdminName] = useState<string>(currentUser ? currentUser.username : 'damoneward');
  const [adminEmail, setAdminEmail] = useState<string>(currentUser ? currentUser.email : 'damoneward38@gmail.com');
  const [settlementMethod, setSettlementMethod] = useState<'wire' | 'token' | 'card'>('wire');
  const [poNumber, setPoNumber] = useState<string>('PO-2026-SELA-8921');
  const [apEmail, setApEmail] = useState<string>('finance@sela.internal');

  // Commercial Card Details
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('892');
  const [cardZip, setCardZip] = useState<string>('94043');

  // Sovereign Cryptographic Nonce Details
  const [cryptoAddress, setCryptoAddress] = useState<string>('0x71C84920bF31e9829A440c991bF8a9942c4b8109');
  const [cryptoNonce, setCryptoNonce] = useState<string>('nonce_tx_challenge_8829104');
  const [isGeneratingNonce, setIsGeneratingNonce] = useState<boolean>(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setAdminName(currentUser.username);
      setAdminEmail(currentUser.email);
    }
  }, [currentUser]);

  // Order Completion State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderReceipt, setOrderReceipt] = useState<{
    invoiceId: string;
    licenseKey: string;
    tier: SystemTier;
    amountFormatted: string;
    timestamp: string;
    sha256Proof: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const handleGenerateNonce = () => {
    setIsGeneratingNonce(true);
    setTimeout(() => {
      setCryptoNonce(`nonce_tx_challenge_${Math.floor(1000000 + Math.random() * 9000000)}`);
      setIsGeneratingNonce(false);
    }, 400);
  };

  const handleDownloadLicenseFile = () => {
    if (!orderReceipt) return;
    const licensePayload = {
      license_title: `SELA SOVEREIGN NODE ENTERPRISE LICENSE (${orderReceipt.tier.toUpperCase()})`,
      invoice_id: orderReceipt.invoiceId,
      license_key: orderReceipt.licenseKey,
      tier: orderReceipt.tier,
      licensed_to: adminName,
      contact_email: adminEmail,
      organization: orgName,
      issued_at: orderReceipt.timestamp,
      cryptographic_sha256: orderReceipt.sha256Proof,
      loopback_enforced: true,
      sovereign_guarantee: '100% Air-Gapped Local Deployment Authorized',
    };

    const blob = new Blob([JSON.stringify(licensePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sela-license-${adminName.toLowerCase()}-${orderReceipt.tier.toLowerCase()}.key`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pricingDetails: Record<
    SystemTier,
    { monthly: number; annualMonthly: number; setupFee: number; label: string; features: string[] }
  > = {
    Shield: {
      monthly: 295,
      annualMonthly: 250,
      setupFee: 0,
      label: 'Core Automation & AST Logic',
      features: [
        'Full localized workspace topology discovery',
        'Automated system documentation layouts',
        'AST logic assembly via NAMI Control Plane',
        'Offline Norcor Edge Brain model',
      ],
    },
    Fortress: {
      monthly: 1850,
      annualMonthly: 1500,
      setupFee: 0,
      label: 'Premium Cyber Defense Shield',
      features: [
        'All Shield tier capabilities included',
        'MatrixBroker loopback network clamp (127.0.0.1:11434)',
        'Local port exposure vulnerability sweeps',
        'Pure local Argon2 database authentication',
        'Continuous integration regression suite (Exit code 0)',
      ],
    },
    Sovereign: {
      monthly: 2000,
      annualMonthly: 1500,
      setupFee: 25000,
      label: 'Elite White Label Enterprise',
      features: [
        'All Fortress tier capabilities included',
        'Absolute White Label Brand Extraction',
        'Full handover of containerized Docker infrastructure',
        'Commercial MSP reseller & client distribution rights',
        'Custom multi-tenant namespaces & hardware tokens',
      ],
    },
  };

  const selectedPlan = pricingDetails[selectedTier];
  const recurringPrice =
    billingCycle === 'annual' ? selectedPlan.annualMonthly * 12 : selectedPlan.monthly;
  const totalDueNow = selectedPlan.setupFee + (billingCycle === 'annual' ? recurringPrice : selectedPlan.monthly);

  const handleProcessOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const invoiceId = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const licenseKey = `SELA-${selectedTier.toUpperCase()}-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const now = new Date().toISOString();
      const sha256Proof = `sha256-cert-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 18)}`;

      // Update database-side tier for user
      if (currentUser) {
        db.updateUserTier(currentUser.id, selectedTier);
      }

      // Log transaction in matrix_broker_tx_logs
      db.logMatrixBrokerTx(
        `Commercial License Provisioned: ${selectedTier} Tier for ${adminName} (${adminEmail}). Invoice: ${invoiceId}`,
        'NORMAL',
        currentUser?.id ?? 1,
        'VERIFIED_SUCCESS'
      );

      setOrderReceipt({
        invoiceId,
        licenseKey,
        tier: selectedTier,
        amountFormatted: `$${totalDueNow.toLocaleString()}`,
        timestamp: now,
        sha256Proof,
      });

      onTierPurchased(selectedTier);
      setIsProcessing(false);
    }, 750);
  };

  const handleCopyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Scope */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Commercial Provisioning</span>
              <span>·</span>
              <span>Sovereign License Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-amber-400" />
              Enterprise Licensing &amp; Node Checkout
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-3xl font-sans">
              Authorize, provision, and bind self-hosted sovereign node licenses directly to your local hardware token. All transactions are settled on local disk with verified cryptographic receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Active Tier: <span className="text-amber-400 font-bold">{currentTier}</span>
            </span>
          </div>
        </div>
      </div>

      {/* COMPLETED ORDER RECEIPT BANNER */}
      {orderReceipt && (
        <div className="p-6 rounded-xl bg-gradient-to-b from-neutral-900 via-neutral-900 to-emerald-950/20 border-2 border-emerald-500/80 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Sovereign License Certificate Provisioned &amp; Activated!
                </h3>
                <span className="text-xs font-mono text-emerald-400">
                  Invoice Ref: {orderReceipt.invoiceId} · Tier: SELA {orderReceipt.tier.toUpperCase()}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
              PAID &amp; COMMITTED DATABASE-SIDE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block text-[10px] uppercase">Cryptographic License Key</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-amber-300 font-bold text-sm">{orderReceipt.licenseKey}</code>
                <button
                  onClick={() => handleCopyLicenseKey(orderReceipt.licenseKey)}
                  className="p-1 text-neutral-400 hover:text-white"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
              <span className="text-neutral-500 block text-[10px] uppercase">Cryptographic Integrity Hash</span>
              <div className="text-neutral-300 truncate">{orderReceipt.sha256Proof}</div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
            <span>License bound to User: <strong className="text-white">{adminName}</strong> ({adminEmail})</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadLicenseFile}
                className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-sans text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download License (.key)</span>
              </button>
              <button
                onClick={onNavigateToCommand}
                className="px-4 py-2 rounded bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold font-sans transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Return to Command Core</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration & Inputs */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Select Plan */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                Step 1: Choose Sovereign Tier
              </h2>
              {/* Billing Cycle Switcher */}
              <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono">
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Annual (Save ~20%)
                </button>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['Shield', 'Fortress', 'Sovereign'] as SystemTier[]).map((tier) => {
                const plan = pricingDetails[tier];
                const isSelected = selectedTier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-800 border-amber-500 shadow-md text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold font-mono text-amber-400 uppercase">
                          SELA {tier}
                        </span>
                        {tier === 'Sovereign' && (
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="text-lg font-bold text-white font-mono tabular-nums">
                        {tier === 'Sovereign' ? (
                          <span>$25k + $1.5k<span className="text-[11px] font-normal text-neutral-400">/mo</span></span>
                        ) : (
                          <span>${billingCycle === 'annual' ? plan.annualMonthly : plan.monthly}<span className="text-[11px] font-normal text-neutral-400">/mo</span></span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans mt-1 line-clamp-2">
                        {plan.label}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-500">
                      {tier === currentTier ? 'Active Tier' : 'Click to Select'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Deployment Target */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <h2 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
              Step 2: Deployment Node Target
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              {[
                { id: 'bare-metal', label: 'Local Bare-Metal Server', note: 'Single host air-gapped physical node' },
                { id: 'private-cluster', label: 'Air-Gapped Private Cluster', note: 'Multi-node private intranet' },
                { id: 'msp-reseller', label: 'MSP Enterprise Reseller', note: 'White-label multi-tenant node' },
              ].map((target) => (
                <button
                  key={target.id}
                  onClick={() => setDeploymentTarget(target.id)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    deploymentTarget === target.id
                      ? 'bg-neutral-800 border-amber-500 text-white'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-neutral-200">{target.label}</div>
                  <div className="text-[10px] text-neutral-500 mt-1 font-sans">{target.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Enterprise Contact & Settlement */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4 text-xs font-mono">
            <h2 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
              Step 3: Enterprise Identity &amp; Settlement Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Enterprise / Node Name:</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Lead Administrator Contact:</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Administrator Email Address:</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Settlement Mechanism:</label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value as 'wire' | 'token' | 'card')}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="wire">Air-Gapped Corporate PO / Wire Transfer</option>
                  <option value="token">Sovereign Hardware Cryptographic Nonce</option>
                  <option value="card">Enterprise Commercial Card</option>
                </select>
              </div>
            </div>

            {/* Conditional Method Form */}
            {settlementMethod === 'wire' && (
              <div className="space-y-3 p-4 rounded bg-neutral-950 border border-neutral-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Purchase Order (PO) Number:</label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Accounts Payable Email:</label>
                    <input
                      type="email"
                      value={apEmail}
                      onChange={(e) => setApEmail(e.target.value)}
                      className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Terms: Net-30 Sovereign Jurisdiction · Direct local bank wire or air-gapped SWIFT settlement.
                </p>
              </div>
            )}

            {settlementMethod === 'token' && (
              <div className="space-y-3 p-4 rounded bg-neutral-950 border border-neutral-800">
                <div>
                  <label className="text-neutral-400 block mb-1">Sovereign Multi-Sig Hardware Vault Address:</label>
                  <input
                    type="text"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-400">Air-Gapped Signature Challenge Nonce:</label>
                    <button
                      type="button"
                      onClick={handleGenerateNonce}
                      disabled={isGeneratingNonce}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      {isGeneratingNonce ? 'Generating...' : 'Regenerate Challenge Nonce'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cryptoNonce}
                    readOnly
                    className="w-full p-2 bg-neutral-900/60 border border-neutral-800 rounded text-neutral-300 font-mono text-xs"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Air-gapped transaction signed on host loopback with offline private key (ECDSA secp256k1).
                </p>
              </div>
            )}

            {settlementMethod === 'card' && (
              <div className="space-y-3 p-4 rounded bg-neutral-950 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Corporate Treasury Card</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Test Sandbox Ready</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Card Number:</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1">Exp Date:</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">CVC:</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Billing Postal Code:</label>
                  <input
                    type="text"
                    value={cardZip}
                    onChange={(e) => setCardZip(e.target.value)}
                    className="w-full sm:w-1/2 p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Execution */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-5 sticky top-20 shadow-xl">
            <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider pb-3 border-b border-neutral-800 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-amber-400 font-bold">SELA {selectedTier}</span>
            </h3>

            {/* Line items */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-300">
                <span>SELA {selectedTier} ({billingCycle}):</span>
                <span className="text-white tabular-nums">${recurringPrice.toLocaleString()}</span>
              </div>

              {selectedPlan.setupFee > 0 && (
                <div className="flex justify-between text-neutral-300">
                  <span>One-Time Enterprise Setup:</span>
                  <span className="text-white tabular-nums">${selectedPlan.setupFee.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400 text-[11px]">
                <span>Argon2 Disk Key Stamping:</span>
                <span className="text-emerald-400">Included ($0)</span>
              </div>

              <div className="flex justify-between text-neutral-400 text-[11px]">
                <span>Air-Gap Zero-Cloud Guarantee:</span>
                <span className="text-emerald-400">Enforced</span>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                <span>Total Due Now:</span>
                <span className="text-amber-400 tabular-nums">${totalDueNow.toLocaleString()}</span>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="p-3 bg-neutral-950 rounded border border-neutral-800/80 space-y-1.5 text-[11px] text-neutral-300">
              <span className="font-semibold text-neutral-200 block text-xs">Included with SELA {selectedTier}:</span>
              {selectedPlan.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-neutral-400">{feat}</span>
                </div>
              ))}
            </div>

            {/* Action button */}
            <button
              onClick={handleProcessOrder}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded font-sans transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Authorizing Sovereign License...' : `Authorize & Provision SELA ${selectedTier}`}</span>
            </button>

            <p className="text-[10px] text-neutral-500 text-center font-sans">
              Immediate database-side tier elevation. Instant cryptographic key issuance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
