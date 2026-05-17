import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from './hooks/useWallet';
import { BalanceCard } from './components/BalanceCard';
import { SendFlow } from './components/SendFlow';
import { DebugPanel } from './components/DebugPanel';
import ArrowUpRight from './assets/icons/arrow-up-right.svg';
import ArrowDownLeft from './assets/icons/arrow-down-left.svg';
import PlusIcon from './assets/icons/plus.svg';
import HistoryIcon from './assets/icons/history.svg';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const CURRENCIES = [
  { code: 'MXN', flag: '🇲🇽', name: 'México' },
  { code: 'COP', flag: '🇨🇴', name: 'Colombia' },
  { code: 'GTQ', flag: '🇬🇹', name: 'Guatemala' },
  { code: 'HNL', flag: '🇭🇳', name: 'Honduras' },
  { code: 'PEN', flag: '🇵🇪', name: 'Perú' },
  { code: 'CLP', flag: '🇨🇱', name: 'Chile' },
  { code: 'ARS', flag: '🇦🇷', name: 'Argentina' },
  { code: 'USD', flag: '🇺🇸', name: 'Dólares' },
];

function groupByDay(transactions) {
  const groups = {};
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  transactions.forEach(tx => {
    const d = new Date(tx.timestamp); const dk = new Date(d); dk.setHours(0,0,0,0);
    let label;
    if (dk.getTime() === today.getTime()) label = 'Hoy';
    else if (dk.getTime() === yesterday.getTime()) label = 'Ayer';
    else label = dk.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    (groups[label] ||= []).push(tx);
  });
  return groups;
}

function App() {
  const { login, logout, authenticated, usdcBalance, sendUSDC, loading, ready, wallet, refreshBalance } = useWallet();

  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('listo_username') || null);
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('listo_display_name') || null);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('listo_avatar') || null);
  const [preferredCurrency, setPreferredCurrency] = useState(() => localStorage.getItem('listo_currency') || 'MXN');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('listo_dark_mode') === 'true');
  const [demoBalance, setDemoBalance] = useState(() => parseFloat(localStorage.getItem('listo_demo_balance') || '0'));
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState('home'); // home | activity | contacts | settings

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('listo_dark_mode', darkMode);
  }, [darkMode]);

  // Onboarding multi-step
  const [onbStep, setOnbStep] = useState(1);
  const [usernameInput, setUsernameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [onbError, setOnbError] = useState(null);

  useEffect(() => {
    async function checkUser() {
      const addr = wallet?.account?.address;
      if (authenticated && addr && !username) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/user/${addr}`);
          if (res.ok) {
            const data = await res.json();
            setUsername(data.username);
            setAvatar(data.avatar);
            setDisplayName(data.display_name);
            localStorage.setItem('listo_username', data.username);
            if (data.avatar) localStorage.setItem('listo_avatar', data.avatar);
            if (data.display_name) localStorage.setItem('listo_display_name', data.display_name);
          }
        } catch (err) { console.error(err); }
      }
    }
    checkUser();
  }, [authenticated, wallet?.account?.address, username]);

  const fetchTransactions = useCallback(() => {
    if (username) {
      fetch(`${BACKEND_URL}/api/transactions/${username}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTransactions(data);
            refreshBalance?.();
          }
        })
        .catch(console.error);
    }
  }, [username, refreshBalance]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  // ------- Loading -------
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-accent font-black text-xl">L</span>
          </div>
          <p className="text-muted text-sm font-medium animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  // ------- Welcome -------
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
            <span className="text-accent font-black text-3xl tracking-tighter">L</span>
          </div>
          <h1 className="text-5xl font-black text-primary mb-3 tracking-tight">Listo</h1>
          <p className="text-muted mb-12 font-medium max-w-xs">
            Pagos instantáneos sin fronteras. Tu dinero, tu cuenta, sin complicaciones.
          </p>

          <div className="w-full max-w-sm space-y-3">
            {[
              { t: 'Envía en segundos', d: 'A cualquier parte de Latam' },
              { t: 'Sin comisiones ocultas', d: 'Tipo de cambio transparente' },
              { t: 'Protegido por Bankaool', d: 'Tu dinero está seguro' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface rounded-2xl p-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent font-black">{i+1}</div>
                <div>
                  <p className="font-bold text-primary text-sm">{f.t}</p>
                  <p className="text-xs text-muted">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={login}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 active:scale-[0.98] transition"
          >
            Empezar ahora
          </button>
          <p className="text-[10px] text-muted/60 mt-4 text-center uppercase tracking-[0.15em] font-bold">
            Powered by Bankaool · Red Avalanche
          </p>
        </div>
      </div>
    );
  }

  // ------- Onboarding image -------
  const handleImageChange = (e, isSettings = false) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Imagen demasiado grande. Máximo 2MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isSettings) handleUpdateProfile({ avatar: reader.result });
      else setAvatarInput(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (updates) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ...updates })
      });
      if (!res.ok) throw new Error("Error al actualizar");
      const data = await res.json();
      if (updates.avatar !== undefined) {
        localStorage.setItem('listo_avatar', updates.avatar);
        setAvatar(updates.avatar);
      }
      if (updates.display_name !== undefined) {
        localStorage.setItem('listo_display_name', updates.display_name);
        setDisplayName(updates.display_name);
      }
    } catch (err) { alert(err.message); }
  };

  const handleRegisterUsername = async () => {
    const smartWalletAddress = wallet?.account?.address;
    if (!usernameInput || !smartWalletAddress) return;
    setRegistering(true);
    setOnbError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: usernameInput, 
          wallet_address: smartWalletAddress, 
          avatar: avatarInput,
          display_name: usernameInput // Default to username
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      localStorage.setItem('listo_username', data.username);
      if (data.avatar) localStorage.setItem('listo_avatar', data.avatar);
      if (data.display_name) localStorage.setItem('listo_display_name', data.display_name);
      setUsername(data.username);
      setAvatar(data.avatar);
      setDisplayName(data.display_name);
    } catch (err) {
      setOnbError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  // ------- Onboarding flow -------
  if (authenticated && wallet?.account?.address && !username) {
    const totalSteps = 2;
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        <div className="pt-4 mb-8">
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < onbStep ? 'bg-accent' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em]">Paso {onbStep} de {totalSteps}</p>
        </div>

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={onbStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {onbStep === 1 && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-3xl font-black text-primary tracking-tight mb-2">Elige tu usuario</h2>
                  <p className="text-muted mb-8">Así te encontrarán tus contactos para enviarte dinero.</p>

                  <div className="relative mb-3 rounded-2xl bg-surface border-2 border-transparent focus-within:border-accent transition shadow-sm">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold text-xl">@</span>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                      placeholder="maria123"
                      maxLength={20}
                      autoFocus
                      className="w-full pl-11 pr-4 py-5 bg-transparent rounded-2xl focus:outline-none font-bold text-primary text-lg"
                    />
                  </div>
                  <p className="text-xs text-muted px-1">Mínimo 3 caracteres. Solo letras, números y _</p>
                </div>
              )}

              {onbStep === 2 && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-3xl font-black text-primary tracking-tight mb-2">Sube tu foto</h2>
                  <p className="text-muted mb-8">Ayuda a tus contactos a reconocerte. Opcional.</p>

                  <div className="flex justify-center mb-6">
                    <label className="relative cursor-pointer group">
                      <div className="w-40 h-40 rounded-full overflow-hidden bg-surface border-4 border-surface shadow-xl flex items-center justify-center">
                        {avatarInput ? (
                          <img src={avatarInput} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-accent-soft flex items-center justify-center text-accent text-5xl font-black">
                            {usernameInput[0]?.toUpperCase() || '+'}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 w-11 h-11 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 group-active:scale-95 transition">
                        <img src={PlusIcon} className="w-5 h-5 invert" alt="" />
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} className="hidden" />
                    </label>
                  </div>

                  <p className="text-center text-sm text-primary font-bold">{usernameInput ? `@${usernameInput}` : ''}</p>

                  {onbError && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold text-center">
                      {onbError}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-4 flex gap-3">
          {onbStep > 1 && (
            <button onClick={() => setOnbStep(onbStep - 1)} className="px-6 py-4 rounded-2xl bg-gray-100 text-primary font-bold active:scale-95 transition">
              Atrás
            </button>
          )}
          <button
            onClick={() => {
              if (onbStep === 1) {
                if (usernameInput.length < 3) return;
                setOnbStep(2);
              } else {
                handleRegisterUsername();
              }
            }}
            disabled={(onbStep === 1 && usernameInput.length < 3) || registering}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold disabled:opacity-40 active:scale-[0.98] transition"
          >
            {registering ? 'Guardando...' : onbStep === 2 ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      </div>
    );
  }

  // ------- Main app -------
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  const handleLookup = async (targetUsername) => {
    const res = await fetch(`${BACKEND_URL}/api/lookup/${targetUsername}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Usuario no encontrado');
    return data;
  };

  const handleSend = async ({ targetUsername, amount, recipientAddress }) => {
    try {
      const hash = await sendUSDC(recipientAddress, amount);
      setTxHash(hash);
      setShowSend(false);
      try {
        await fetch(`${BACKEND_URL}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from_username: username, to_username: targetUsername,
            amount_usd: amount, fee_usd: 1.50, corridor: 'MX→CO', tx_hash: hash
          })
        });
        fetchTransactions();
      } catch (err) { console.error(err); }
    } catch (error) {
      alert('Error en la transacción: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl px-5 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-surface shadow-sm ring-2 ring-surface">
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-accent-soft flex items-center justify-center text-accent font-black">
                  {username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] text-muted font-semibold">{greeting},</p>
              <p className="font-bold text-primary text-sm leading-tight">{displayName || `@${username}`}</p>
            </div>
          </div>
          <button className="w-11 h-11 rounded-full bg-surface shadow-sm flex items-center justify-center active:scale-95 transition relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full ring-2 ring-surface" />
          </button>
        </div>
      </header>

      <main className="px-5 space-y-5 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="space-y-5"
          >
            {tab === 'home' && (
              <>
                <BalanceCard balance={parseFloat(usdcBalance) + demoBalance} preferredCurrency={preferredCurrency} />

                {/* Quick actions */}
                <div className="flex justify-between gap-2">
                  {[
                    { key: 'send', label: 'Enviar', icon: ArrowUpRight, onClick: () => setShowSend(true) },
                    { key: 'receive', label: 'Recibir', icon: ArrowDownLeft, onClick: () => setShowReceive(true) },
                    { key: 'request', label: 'Cobrar', icon: HistoryIcon, onClick: () => alert('Próximamente') },
                    { key: 'add', label: 'Agregar', icon: PlusIcon, onClick: () => alert('Próximamente') },
                  ].map(a => (
                    <button key={a.key} onClick={a.onClick}
                      className="flex-1 flex flex-col items-center gap-2 active:scale-95 transition">
                      <div className="w-14 h-14 rounded-2xl bg-surface shadow-sm flex items-center justify-center">
                        <img src={a.icon} className="w-5 h-5 dark:invert" style={darkMode ? {} : { filter: 'invert(10%) sepia(13%) saturate(2618%) hue-rotate(202deg) brightness(96%) contrast(95%)' }} alt="" />
                      </div>
                      <span className="text-[11px] font-bold text-primary">{a.label}</span>
                    </button>
                  ))}
                </div>

                {txHash && (
                  <a href={`https://testnet.snowtrace.io/tx/${txHash}`} target="_blank" rel="noreferrer"
                    className="block bg-accent-soft border border-accent/20 rounded-2xl p-4 text-sm active:scale-[0.99] transition">
                    <p className="font-bold text-accent mb-0.5">✓ Transacción exitosa</p>
                    <p className="text-xs text-accent/80">Ver comprobante en la red →</p>
                  </a>
                )}

                <TransactionList transactions={transactions.slice(0, 5)} username={username} onViewAll={() => setTab('activity')} />
              </>
            )}

            {tab === 'activity' && (
              <div className="pt-2">
                <h1 className="text-3xl font-black text-primary tracking-tight mb-1">Actividad</h1>
                <p className="text-muted text-sm mb-5">Historial completo de movimientos</p>
                <TransactionList transactions={transactions} username={username} full />
              </div>
            )}

            {tab === 'contacts' && (
              <div className="pt-2">
                <h1 className="text-3xl font-black text-primary tracking-tight mb-1">Contactos</h1>
                <p className="text-muted text-sm mb-5">Personas con las que has movido dinero</p>
                <ContactsList transactions={transactions} username={username} onSend={(c) => {
                  setSelectedContact(c);
                  setShowSend(true);
                }} />
              </div>
            )}

            {tab === 'settings' && (
              <SettingsTab
                username={username}
                displayName={displayName}
                avatar={avatar}
                preferredCurrency={preferredCurrency}
                setPreferredCurrency={(c) => { setPreferredCurrency(c); localStorage.setItem('listo_currency', c); }}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onUpdateProfile={handleUpdateProfile}
                onImageChange={(e) => handleImageChange(e, true)}
                onLogout={() => { logout(); localStorage.clear(); window.location.reload(); }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[480px]">
        <div className="mx-3 mb-3 bg-surface rounded-3xl shadow-[0_10px_40px_-10px_rgba(26,26,46,0.25)] flex justify-around py-2.5 border border-muted/10">
          {[
            { key: 'home', label: 'Inicio', icon: <NavHome /> },
            { key: 'activity', label: 'Actividad', icon: <NavActivity /> },
            { key: 'contacts', label: 'Contactos', icon: <NavContacts /> },
            { key: 'settings', label: 'Ajustes', icon: <NavSettings /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-1 active:scale-95 transition ${tab === t.key ? 'text-primary' : 'text-muted'}`}>
              <div className={`w-10 h-7 rounded-full flex items-center justify-center transition ${tab === t.key ? 'bg-accent-soft' : ''}`}>
                {t.icon}
              </div>
              <span className={`text-[10px] font-bold ${tab === t.key ? 'text-primary' : 'text-muted'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {showSend && (
          <SendFlow 
            onSend={handleSend} 
            onCancel={() => { setShowSend(false); setSelectedContact(null); }} 
            onLookup={handleLookup} 
            currentUsername={username}
            initialRecipient={selectedContact}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceive && (
          <ReceiveFunds walletAddress={wallet?.account?.address} username={username} onCancel={() => setShowReceive(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ------- Receive Funds -------
function ReceiveFunds({ walletAddress, username, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }} className="relative w-full max-w-[480px] min-h-[540px] bg-background rounded-t-[32px] p-6 pb-8 shadow-2xl flex flex-col">
        <div className="w-12 h-1.5 bg-muted/20 rounded-full mx-auto mb-6" />
        <h2 className="text-2xl font-black text-primary mb-2">Recibir dinero</h2>
        <p className="text-muted text-sm mb-6">Muestra este código para recibir dinero.</p>

        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 mb-6 shadow-sm border border-muted/5">
            <QRCodeSVG value={walletAddress} size={200} level="H" includeMargin={false} />
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#888'}}>Tu ID de Listo</p>
              <p className="text-xl font-black" style={{color:'#111'}}>@{username}</p>
            </div>
          </div>
        </div>

        <button onClick={onCancel} className="w-full py-4 text-muted font-bold active:scale-95 transition">
          Cerrar
        </button>
      </motion.div>
    </div>
  );
}

// ------- Transaction list -------
function TransactionList({ transactions, username, full = false, onViewAll }) {
  const groups = useMemo(() => groupByDay(transactions), [transactions]);
  const keys = Object.keys(groups);

  if (transactions.length === 0) {
    return (
      <div className="bg-surface rounded-3xl p-8 text-center border border-muted/5">
        <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted" strokeWidth="2"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
        </div>
        <p className="text-primary font-bold text-sm">Sin movimientos aún</p>
        <p className="text-muted text-xs mt-1">Tus pagos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!full && (
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-black text-primary tracking-tight">Movimientos recientes</h2>
          <button onClick={onViewAll} className="text-xs font-bold text-accent active:scale-95 transition">Ver todo</button>
        </div>
      )}

      {keys.map(day => (
        <div key={day}>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] mb-2 px-1">{day}</p>
          <div className="bg-surface rounded-3xl overflow-hidden border border-muted/5">
            {groups[day].map((tx, idx) => {
              const isOutgoing = tx.from_username === username;
              const otherUser = isOutgoing ? tx.to_username : tx.from_username;
              const otherAvatar = isOutgoing ? tx.to_avatar : tx.from_avatar;
              const otherDisplayName = isOutgoing ? tx.to_display_name : tx.from_display_name;
              return (
                <a key={tx.id} href={`https://testnet.snowtrace.io/tx/${tx.tx_hash}`} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-3 p-4 active:bg-background transition ${idx < groups[day].length - 1 ? 'border-b border-muted/5' : ''}`}>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-background">
                      {otherAvatar ? (
                        <img src={otherAvatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-accent-soft flex items-center justify-center text-accent font-black">
                          {otherUser?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-surface ${isOutgoing ? 'bg-danger' : 'bg-accent'} shadow-sm`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        {isOutgoing ? <path d="M7 17L17 7M17 7H8M17 7v9" /> : <path d="M17 7L7 17M7 17h9M7 17V8" />}
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary text-sm truncate">{otherDisplayName || `@${otherUser}`}</p>
                    <p className="text-[11px] text-muted font-medium">
                      {isOutgoing ? 'Enviado' : 'Recibido'} · {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-base tabular ${isOutgoing ? 'text-primary' : 'text-accent'}`}>
                      {isOutgoing ? '−' : '+'}${tx.amount_usd.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">USDC</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ------- Contacts -------
function ContactsList({ transactions, username, onSend }) {
  const [search, setSearch] = useState('');
  
  const contacts = useMemo(() => {
    const map = new Map();
    transactions.forEach(tx => {
      const isOut = tx.from_username === username;
      const other = isOut ? tx.to_username : tx.from_username;
      const av = isOut ? tx.to_avatar : tx.from_avatar;
      const dn = isOut ? tx.to_display_name : tx.from_display_name;
      const wa = isOut ? tx.to_wallet_address : tx.from_wallet_address;
      if (!map.has(other)) map.set(other, { username: other, avatar: av, display_name: dn, wallet_address: wa });
    });
    const list = Array.from(map.values());
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(c => 
      c.username.toLowerCase().includes(s) || 
      c.display_name?.toLowerCase().includes(s)
    );
  }, [transactions, username, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contacto..."
          className="w-full pl-11 pr-4 py-3.5 bg-surface rounded-2xl border border-muted/5 focus:outline-none focus:border-accent shadow-sm font-bold text-sm text-primary placeholder:text-muted/40"
        />
      </div>

      {contacts.length === 0 ? (
        <div className="bg-surface rounded-3xl p-8 text-center border border-muted/5">
          <p className="text-primary font-bold text-sm">No se encontraron contactos</p>
          <p className="text-muted text-xs mt-1">{search ? 'Intenta con otro nombre' : 'Envía tu primer pago para empezar'}</p>
          {!search && (
            <button onClick={() => onSend()} className="mt-4 bg-accent text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-accent/30 active:scale-95 transition">
              Enviar dinero
            </button>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-3xl overflow-hidden border border-muted/5">
          {contacts.map((c, idx) => (
            <button key={c.username} onClick={() => onSend(c)}
              className={`w-full flex items-center gap-3 p-4 active:bg-background transition ${idx < contacts.length - 1 ? 'border-b border-muted/5' : ''}`}>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-background">
                {c.avatar ? (
                  <img src={c.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-accent-soft flex items-center justify-center text-accent font-black">
                    {c.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-primary text-sm truncate">{c.display_name || `@${c.username}`}</p>
                <p className="text-[11px] text-muted">Toca para enviar</p>
              </div>
              <img src={ArrowUpRight} className="w-4 h-4 opacity-40 dark:invert" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ------- Settings -------
function SettingsTab({ username, displayName, avatar, preferredCurrency, setPreferredCurrency, darkMode, setDarkMode, onUpdateProfile, onImageChange, onLogout }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName || '');

  const handleNameBlur = () => {
    setEditingName(false);
    if (nameInput !== displayName) {
      onUpdateProfile({ display_name: nameInput });
    }
  };

  return (
    <div className="pt-2 space-y-5">
      <h1 className="text-3xl font-black text-primary tracking-tight">Ajustes</h1>

      <div className="bg-surface rounded-3xl p-5 flex items-center gap-4 border border-muted/5 shadow-sm">
        <label className="relative cursor-pointer group">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-background">
            {avatar ? (
              <img src={avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-accent-soft flex items-center justify-center text-accent font-black text-xl">
                {username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center ring-2 ring-surface">
            <img src={PlusIcon} className="w-3 h-3 invert" alt="" />
          </div>
          <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
        </label>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              className="w-full bg-background border border-accent rounded-lg px-2 py-1 font-bold text-primary focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingName(true)}>
              <p className={`font-bold truncate ${displayName ? 'text-primary' : 'text-accent'}`}>
                {displayName || 'Establecer nombre'}
              </p>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                className={`transition-opacity ${displayName ? 'text-muted opacity-0 group-hover:opacity-100' : 'text-accent opacity-100'}`} 
                strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          )}
          <p className="text-xs text-muted">@{username}</p>
        </div>
      </div>

      <div className="bg-surface rounded-3xl p-5 border border-muted/5 shadow-sm space-y-4">
        <div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] mb-3">Preferencia</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-primary text-sm">Modo Oscuro</p>
              <p className="text-xs text-muted">Cambia la apariencia de la app</p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-7 rounded-full transition-colors relative ${darkMode ? 'bg-accent' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${darkMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] mb-3">Moneda preferida</p>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map(c => (
              <button key={c.code} onClick={() => setPreferredCurrency(c.code)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl transition active:scale-95 ${preferredCurrency === c.code ? 'bg-accent-soft ring-2 ring-accent' : 'bg-background'}`}>
                <span className="text-xl leading-none">{c.flag}</span>
                <span className={`text-[10px] font-bold ${preferredCurrency === c.code ? 'text-accent' : 'text-muted'}`}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-3xl divide-y divide-muted/5 border border-muted/5 shadow-sm overflow-hidden">
        <Row label="Seguridad" hint="Próximamente" />
        <Row label="Notificaciones" hint="Próximamente" />
        <Row label="Soporte" hint="Próximamente" />
        <Row label="Términos y privacidad" hint="" />
      </div>

      <DebugPanel />

      <button onClick={onLogout}
        className="w-full bg-surface text-danger py-4 rounded-3xl font-bold border border-muted/5 shadow-sm active:scale-[0.98] transition">
        Cerrar sesión
      </button>

      <p className="text-center text-[10px] text-muted/60 font-bold uppercase tracking-[0.15em] pt-2">
        Listo · Red Avalanche
      </p>
    </div>
  );
}

function Row({ label, hint }) {
  return (
    <button className="w-full flex items-center justify-between p-4 active:bg-background transition">
      <span className="font-semibold text-primary text-sm">{label}</span>
      <span className="text-xs text-muted">{hint} ›</span>
    </button>
  );
}

// ------- Nav icons -------
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
function NavHome() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>); }
function NavActivity() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>); }
function NavContacts() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" /><circle cx="17" cy="9" r="2.5" /><path d="M22 19c0-2.5-2-4.5-4.5-4.5" /></svg>); }
function NavSettings() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>); }

export default App;
