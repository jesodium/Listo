import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from './hooks/useWallet';
import { useUI } from './components/UIProvider';
import { BalanceCard } from './components/BalanceCard';
import { SendFlow } from './components/SendFlow';
import { DebugPanel } from './components/DebugPanel';
import ArrowUpRight from './assets/icons/arrow-up-right.svg';
import ArrowDownLeft from './assets/icons/arrow-down-left.svg';
import PlusIcon from './assets/icons/plus.svg';
import HistoryIcon from './assets/icons/history.svg';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const CURRENCIES = [
  { code: 'MXN', iso: 'mx', name: 'México' },
  { code: 'COP', iso: 'co', name: 'Colombia' },
  { code: 'GTQ', iso: 'gt', name: 'Guatemala' },
  { code: 'HNL', iso: 'hn', name: 'Honduras' },
  { code: 'PEN', iso: 'pe', name: 'Perú' },
  { code: 'CLP', iso: 'cl', name: 'Chile' },
  { code: 'ARS', iso: 'ar', name: 'Argentina' },
];

const FlagIcon = ({ iso }) => <span className={`fi fi-${iso} rounded`} style={{ fontSize: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />;



const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
};

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
  const { showToast, showAlert } = useUI();

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
  const [tab, setTab] = useState('home');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('listo_dark_mode', darkMode);
  }, [darkMode]);

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
          if (Array.isArray(data)) { setTransactions(data); refreshBalance?.(); }
        })
        .catch(console.error);
    }
  }, [username, refreshBalance]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  // Loading
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-[18px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0D0D24, #1A1A42)' }}
          >
            <span className="text-accent font-black text-2xl tracking-tighter">L</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // Welcome / Auth
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        {/* Hero area */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 text-center pt-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260, delay: 0.05 }}
            className="w-[88px] h-[88px] rounded-[26px] flex items-center justify-center mb-8"
            style={{
              background: 'linear-gradient(145deg, #0D0D24 0%, #1A1A42 100%)',
              boxShadow: '0 20px 40px rgba(13,13,36,0.28), 0 4px 12px rgba(0,201,167,0.2)',
            }}
          >
            <span className="font-black text-4xl tracking-tighter" style={{ color: '#00C9A7' }}>L</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-5xl font-black tracking-tight mb-3" style={{ color: 'var(--primary)' }}>Listo</h1>
            <p className="font-medium mb-12 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
              Pagos instantáneos sin fronteras. Tu dinero, tu cuenta, sin complicaciones.
            </p>
          </motion.div>

          <motion.div
            className="w-full max-w-sm space-y-2.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {[
              { t: 'Envía en segundos', d: 'A cualquier parte de Latam', n: '01' },
              { t: 'Sin comisiones ocultas', d: 'Tipo de cambio transparente', n: '02' },
              { t: 'Protegido y seguro', d: 'Tu dinero siempre seguro', n: '03' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center gap-3.5 rounded-2xl p-4 text-left"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs"
                  style={{ background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>
                  {f.n}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{f.t}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{f.d}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="px-6 pb-10 pt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <button
            onClick={login}
            className="w-full py-4 rounded-2xl font-bold text-base text-white active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #0D0D24 0%, #1A1A42 100%)',
              boxShadow: '0 12px 28px rgba(13,13,36,0.28)',
            }}
          >
            Empezar ahora
          </button>
          <p className="text-[10px] mt-4 text-center font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--muted)', opacity: 0.5 }}>
            Powered by Bankaool
          </p>
        </motion.div>
      </div>
    );
  }

  // Onboarding handlers
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
      if (updates.avatar !== undefined) {
        localStorage.setItem('listo_avatar', updates.avatar);
        setAvatar(updates.avatar);
      }
      if (updates.display_name !== undefined) {
        localStorage.setItem('listo_display_name', updates.display_name);
        setDisplayName(updates.display_name);
      }
      showToast('Perfil actualizado', 'success');
    } catch (err) { showToast(err.message, 'error'); }
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
          display_name: usernameInput
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

  // Onboarding flow
  if (authenticated && wallet?.account?.address && !username) {
    return (
      <div className="min-h-screen flex flex-col p-6" style={{ background: 'var(--background)' }}>
        <div className="pt-4 mb-8">
          <div className="flex gap-1.5 mb-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: '#00C9A7' }}
                  animate={{ width: i < onbStep ? '100%' : '0%' }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>Paso {onbStep} de 2</p>
        </div>

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={onbStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex-1 flex flex-col"
            >
              {onbStep === 1 && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--primary)' }}>Elige tu usuario</h2>
                  <p className="mb-8" style={{ color: 'var(--muted)' }}>Así te encontrarán tus contactos.</p>
                  <div className="relative mb-3 rounded-2xl" style={{ background: 'var(--surface)', border: '2px solid transparent', outline: 'none' }}>
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-xl" style={{ color: 'var(--muted)' }}>@</span>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                      placeholder="maria123"
                      maxLength={20}
                      autoFocus
                      className="w-full pl-11 pr-4 py-5 bg-transparent rounded-2xl focus:outline-none font-bold text-lg"
                      style={{ color: 'var(--primary)' }}
                    />
                  </div>
                  <p className="text-xs px-1" style={{ color: 'var(--muted)' }}>Mínimo 3 caracteres. Solo letras, números y _</p>
                </div>
              )}

              {onbStep === 2 && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--primary)' }}>Sube tu foto</h2>
                  <p className="mb-8" style={{ color: 'var(--muted)' }}>Opcional, ayuda a tus contactos a reconocerte.</p>
                  <div className="flex justify-center mb-6">
                    <label className="relative cursor-pointer group">
                      <div className="w-36 h-36 rounded-full overflow-hidden" style={{ border: '4px solid var(--surface)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
                        {avatarInput ? (
                          <img src={avatarInput} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl font-black" style={{ background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>
                            {usernameInput[0]?.toUpperCase() || '+'}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full flex items-center justify-center group-active:scale-95 transition-transform"
                        style={{ background: '#00C9A7', boxShadow: '0 4px 12px rgba(0,201,167,0.4)' }}>
                        <img src={PlusIcon} className="w-5 h-5 invert" alt="" />
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} className="hidden" />
                    </label>
                  </div>
                  <p className="text-center text-sm font-bold" style={{ color: 'var(--primary)' }}>{usernameInput ? `@${usernameInput}` : ''}</p>
                  <AnimatePresence>
                    {onbError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 px-4 py-3 rounded-xl text-sm font-semibold text-center"
                        style={{ background: 'rgba(255,77,106,0.1)', color: '#FF4D6A' }}
                      >
                        {onbError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-4 flex gap-3">
          {onbStep > 1 && (
            <button
              onClick={() => setOnbStep(onbStep - 1)}
              className="px-6 py-4 rounded-2xl font-bold active:scale-95 transition-transform"
              style={{ background: 'var(--surface)', color: 'var(--primary)' }}
            >
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
            className="flex-1 py-4 rounded-2xl font-bold text-white disabled:opacity-40 active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #0D0D24, #1A1A42)', boxShadow: '0 8px 24px rgba(13,13,26,0.2)' }}
          >
            {registering ? 'Guardando...' : onbStep === 2 ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      </div>
    );
  }

  // Main app
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
      showToast('¡Dinero enviado con éxito!', 'success');
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
      showToast('Error en la transacción: ' + error.message, 'error');
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'request' || action === 'add') {
      showAlert({
        title: 'Próximamente',
        message: 'Esta función estará disponible en la siguiente fase de Listo. ¡Gracias por tu paciencia!',
        confirmText: 'Entendido'
      });
    }
  };

  const NAV_ITEMS = [
    { key: 'home', label: 'Inicio', icon: <NavHome /> },
    { key: 'activity', label: 'Actividad', icon: <NavActivity /> },
    { key: 'contacts', label: 'Contactos', icon: <NavContacts /> },
    { key: 'settings', label: 'Ajustes', icon: <NavSettings /> },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-5 pt-safe-top" style={{
        background: 'var(--background)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-[1.5px]" style={{ ringColor: 'var(--border)' }}>
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black" style={{ background: 'rgba(0,201,167,0.12)', color: '#00C9A7' }}>
                  {username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>{greeting},</p>
              <p className="font-bold text-sm leading-tight" style={{ color: 'var(--primary)' }}>{displayName || `@${username}`}</p>
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center relative active:scale-90 transition-transform"
            style={{ background: 'var(--surface)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--primary)' }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2" style={{ background: '#00C9A7', ringColor: 'var(--surface)' }} />
          </button>
        </div>
        {/* Bottom border */}
        <div className="h-px" style={{ background: 'var(--border)' }} />
      </header>

      <main className="px-5 pt-5 space-y-5 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-5"
          >
            {tab === 'home' && (
              <>
                <BalanceCard balance={parseFloat(usdcBalance) + demoBalance} preferredCurrency={preferredCurrency} />

                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { key: 'send', label: 'Enviar', icon: ArrowUpRight, onClick: () => setShowSend(true) },
                    { key: 'receive', label: 'Recibir', icon: ArrowDownLeft, onClick: () => setShowReceive(true) },
                    { key: 'request', label: 'Cobrar', icon: HistoryIcon, onClick: () => handleQuickAction('request') },
                    { key: 'add', label: 'Agregar', icon: PlusIcon, onClick: () => handleQuickAction('add') },
                  ].map((a, i) => (
                    <motion.button
                      key={a.key}
                      onClick={a.onClick}
                      whileTap={{ scale: 0.92 }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-card"
                        style={{ background: '#FAF9F6' }}
                      >
                        <img
                          src={a.icon}
                          className="w-5 h-5"
                          style={{ filter: 'brightness(0)', opacity: 0.8 }}
                          alt=""
                        />
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--primary)' }}>{a.label}</span>
                    </motion.button>
                  ))}
                </div>

                {txHash && (
                  <motion.a
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl p-4 active:scale-[0.99] transition-transform"
                    style={{ background: 'rgba(0,201,167,0.08)', border: '1px solid rgba(0,201,167,0.2)' }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,201,167,0.15)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#00C9A7' }}>Transacción exitosa</p>
                      <p className="text-xs" style={{ color: 'rgba(0,201,167,0.7)' }}>Ver comprobante en la red →</p>
                    </div>
                  </motion.a>
                )}

                <TransactionList transactions={transactions.slice(0, 5)} username={username} onViewAll={() => setTab('activity')} />
              </>
            )}

            {tab === 'activity' && (
              <div className="pt-1">
                <h1 className="text-[28px] font-black tracking-tight mb-1" style={{ color: 'var(--primary)' }}>Actividad</h1>
                <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Historial completo de movimientos</p>
                <TransactionList transactions={transactions} username={username} full />
              </div>
            )}

            {tab === 'contacts' && (
              <div className="pt-1">
                <h1 className="text-[28px] font-black tracking-tight mb-1" style={{ color: 'var(--primary)' }}>Contactos</h1>
                <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Personas con las que has movido dinero</p>
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
        <div className="mx-4 mb-4 rounded-[24px] flex justify-around py-2 shadow-sheet" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {NAV_ITEMS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 relative active:scale-90 transition-transform"
            >
              {tab === t.key && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-2 inset-y-0 rounded-2xl"
                  style={{ background: 'rgba(0,201,167,0.1)' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 380, mass: 0.6 }}
                />
              )}
              <div className="relative z-10" style={{ color: tab === t.key ? '#00C9A7' : 'var(--muted)' }}>
                {t.icon}
              </div>
              <span className="relative z-10 text-[10px] font-bold" style={{ color: tab === t.key ? '#00C9A7' : 'var(--muted)' }}>
                {t.label}
              </span>
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
            currentBalance={parseFloat(usdcBalance) + demoBalance}
            preferredCurrency={preferredCurrency}
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

// -------- Receive Funds --------
function ReceiveFunds({ walletAddress, username, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0"
        style={{ background: 'rgba(8,8,20,0.7)', backdropFilter: 'blur(8px)' }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 34, stiffness: 340, mass: 0.7 }}
        className="relative w-full max-w-[480px] flex flex-col rounded-t-[32px] overflow-hidden"
        style={{ background: 'var(--surface)', boxShadow: '0 -24px 64px rgba(8,8,20,0.28)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        <div className="px-6 pb-10 pt-2">
          <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--primary)' }}>Recibir dinero</h2>
          <p className="text-sm mb-7" style={{ color: 'var(--muted)' }}>Muestra este código para recibir pagos.</p>

          <div className="rounded-3xl p-8 flex flex-col items-center gap-5 mb-6" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="rounded-2xl overflow-hidden p-3 bg-white">
              <QRCodeSVG value={walletAddress} size={180} level="H" includeMargin={false} />
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--muted)' }}>Tu ID de Listo</p>
              <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>@{username}</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="w-full py-4 rounded-2xl font-bold active:scale-[0.98] transition-transform"
            style={{ background: 'var(--surface2)', color: 'var(--muted)' }}
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// -------- Transaction list --------
function TransactionList({ transactions, username, full = false, onViewAll }) {
  const groups = useMemo(() => groupByDay(transactions), [transactions]);
  const keys = Object.keys(groups);

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl p-10 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--muted)' }} strokeWidth="2"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
        </div>
        <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Sin movimientos aún</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Tus pagos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!full && (
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--primary)' }}>Movimientos recientes</h2>
          <button onClick={onViewAll} className="text-xs font-bold active:scale-95 transition-transform" style={{ color: '#00C9A7' }}>Ver todo →</button>
        </div>
      )}

      {keys.map(day => (
        <div key={day}>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2 px-1" style={{ color: 'var(--muted)' }}>{day}</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {groups[day].map((tx, idx) => {
              const isOutgoing = tx.from_username === username;
              const otherUser = isOutgoing ? tx.to_username : tx.from_username;
              const otherAvatar = isOutgoing ? tx.to_avatar : tx.from_avatar;
              const otherDisplayName = isOutgoing ? tx.to_display_name : tx.from_display_name;
              return (
                <motion.a
                  key={tx.id}
                  href={`https://testnet.snowtrace.io/tx/${tx.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  whileTap={{ backgroundColor: 'var(--surface2)' }}
                  className="flex items-center gap-3 p-4 active:opacity-80 transition-opacity"
                  style={{ borderBottom: idx < groups[day].length - 1 ? '1px solid var(--border)' : undefined }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                      {otherAvatar ? (
                        <img src={otherAvatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black" style={{ background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>
                          {otherUser?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-2"
                      style={{
                        background: isOutgoing ? '#FF4D6A' : '#00C9A7',
                        ringColor: 'var(--surface)',
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        {isOutgoing ? <path d="M7 17L17 7M17 7H8M17 7v9" /> : <path d="M17 7L7 17M7 17h9M7 17V8" />}
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--primary)' }}>{otherDisplayName || `@${otherUser}`}</p>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                      {isOutgoing ? 'Enviado' : 'Recibido'} · {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-base tabular" style={{ color: isOutgoing ? 'var(--primary)' : '#00C9A7' }}>
                      {isOutgoing ? '−' : '+'}${tx.amount_usd.toFixed(2)}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// -------- Contacts --------
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
    return list.filter(c => c.username.toLowerCase().includes(s) || c.display_name?.toLowerCase().includes(s));
  }, [transactions, username, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contacto..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none font-bold text-sm placeholder:opacity-40"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--primary)',
          }}
        />
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-3xl p-10 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>No se encontraron contactos</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{search ? 'Intenta con otro nombre' : 'Envía tu primer pago para empezar'}</p>
          {!search && (
            <button
              onClick={() => onSend()}
              className="mt-4 px-5 py-2.5 rounded-full font-bold text-sm text-white active:scale-95 transition-transform"
              style={{ background: '#00C9A7', boxShadow: '0 6px 16px rgba(0,201,167,0.3)' }}
            >
              Enviar dinero
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {contacts.map((c, idx) => (
            <button
              key={c.username}
              onClick={() => onSend(c)}
              className="w-full flex items-center gap-3 p-4 active:opacity-70 transition-opacity text-left"
              style={{ borderBottom: idx < contacts.length - 1 ? '1px solid var(--border)' : undefined }}
            >
              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--surface2)' }}>
                {c.avatar ? (
                  <img src={c.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black" style={{ background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>
                    {c.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--primary)' }}>{c.display_name || `@${c.username}`}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Toca para enviar</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)', opacity: 0.4 }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// -------- Settings --------
function SettingsTab({ username, displayName, avatar, preferredCurrency, setPreferredCurrency, darkMode, setDarkMode, onUpdateProfile, onImageChange, onLogout }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName || '');

  const handleNameBlur = () => {
    setEditingName(false);
    if (nameInput !== displayName) onUpdateProfile({ display_name: nameInput });
  };

  return (
    <div className="pt-1 space-y-4">
      <h1 className="text-[28px] font-black tracking-tight" style={{ color: 'var(--primary)' }}>Ajustes</h1>

      {/* Profile card */}
      <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <label className="relative cursor-pointer group flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            {avatar ? (
              <img src={avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-xl" style={{ background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>
                {username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-2" style={{ background: '#00C9A7', ringColor: 'var(--surface)' }}>
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
              className="w-full rounded-lg px-2 py-1 font-bold focus:outline-none text-sm"
              style={{ background: 'var(--surface2)', border: '1.5px solid #00C9A7', color: 'var(--primary)' }}
            />
          ) : (
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setEditingName(true)}>
              <p className="font-bold truncate" style={{ color: displayName ? 'var(--primary)' : '#00C9A7' }}>
                {displayName || 'Establecer nombre'}
              </p>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                className="opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--muted)' }} strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          )}
          <p className="text-xs" style={{ color: 'var(--muted)' }}>@{username}</p>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl p-5 space-y-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {/* Dark mode */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Modo Oscuro</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Cambia la apariencia de la app</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-12 h-6.5 rounded-full relative transition-colors duration-200 flex-shrink-0"
            style={{ background: darkMode ? '#00C9A7' : 'var(--surface2)', border: '1.5px solid var(--border)' }}
          >
            <motion.div
              animate={{ x: darkMode ? 22 : 2 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300, mass: 0.5 }}
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>

        <div className="h-px" style={{ background: 'var(--border)' }} />

        {/* Currency */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>Moneda preferida</p>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setPreferredCurrency(c.code)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95"
                style={preferredCurrency === c.code
                  ? { background: 'rgba(0,201,167,0.1)', outline: '1.5px solid rgba(0,201,167,0.4)' }
                  : { background: 'var(--surface2)' }
                }
              >
                <FlagIcon iso={c.iso} />
                <span className="text-[10px] font-bold" style={{ color: preferredCurrency === c.code ? '#00C9A7' : 'var(--muted)' }}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* More options */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {[
          { label: 'Seguridad', hint: 'Próximamente' },
          { label: 'Notificaciones', hint: 'Próximamente' },
          { label: 'Soporte', hint: 'Próximamente' },
          { label: 'Términos y privacidad', hint: '' },
        ].map((r, i, arr) => (
          <button
            key={r.label}
            className="w-full flex items-center justify-between p-4 active:opacity-60 transition-opacity"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <span className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>{r.label}</span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--muted)' }}>
              {r.hint}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          </button>
        ))}
      </div>

      <DebugPanel />

      <button
        onClick={onLogout}
        className="w-full py-4 rounded-2xl font-bold active:scale-[0.98] transition-transform"
        style={{ background: 'rgba(255,77,106,0.08)', color: '#FF4D6A', border: '1px solid rgba(255,77,106,0.15)' }}
      >
        Cerrar sesión
      </button>

      <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] pt-1 pb-4" style={{ color: 'var(--muted)', opacity: 0.4 }}>
        Listo v1
      </p>
    </div>
  );
}

// Nav icons
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
function NavHome() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>); }
function NavActivity() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>); }
function NavContacts() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" /><circle cx="17" cy="9" r="2.5" /><path d="M22 19c0-2.5-2-4.5-4.5-4.5" /></svg>); }
function NavSettings() { return (<svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>); }

export default App;
