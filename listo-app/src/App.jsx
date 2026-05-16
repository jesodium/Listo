import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './hooks/useWallet';
import { BalanceCard } from './components/BalanceCard';
import { SendFlow } from './components/SendFlow';
import { DebugPanel } from './components/DebugPanel';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  const { 
    login, 
    logout, 
    authenticated, 
    address, 
    usdcBalance, 
    sendUSDC, 
    loading,
    ready,
    wallet,
    refreshBalance
  } = useWallet();
  
  const [showSend, setShowSend] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('listo_username') || null);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('listo_avatar') || null);
  const [showSettings, setShowSettings] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState(() => localStorage.getItem('listo_currency') || 'MXN');
  const [registering, setRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState(null);
  const [transactions, setTransactions] = useState([]);

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
            localStorage.setItem('listo_username', data.username);
            if (data.avatar) localStorage.setItem('listo_avatar', data.avatar);
          }
        } catch (err) {
          console.error("Error checking user:", err);
        }
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
            // Also refresh balance whenever we get new transactions
            refreshBalance?.();
          }
        })
        .catch(console.error);
    }
  }, [username, refreshBalance]);

  useEffect(() => {
    fetchTransactions();
    // Poll for new transactions every 10 seconds
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-lg font-medium animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-4xl font-black text-primary mb-2 tracking-tighter italic">Listo</h1>
          <p className="text-gray-500 mb-8 font-medium">Pagos instantáneos sin fronteras</p>

          <button
            onClick={login}
            className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Empezar ahora
          </button>

          <p className="text-[10px] text-gray-400 mt-8 uppercase tracking-widest font-bold">
            Powered by Bankaool · Avalanche Fuji
          </p>
        </div>
      </div>
    );
  }

  const handleImageChange = (e, isSettings = false) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Imagen demasiado grande. Máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isSettings) {
        handleUpdateProfile(reader.result);
      } else {
        setAvatarInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (newAvatar) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatar: newAvatar })
      });
      if (!res.ok) throw new Error("Error al actualizar");
      localStorage.setItem('listo_avatar', newAvatar);
      setAvatar(newAvatar);
      alert("Perfil actualizado!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegisterUsername = async (e) => {
    e.preventDefault();
    const smartWalletAddress = wallet?.account?.address;
    
    if (!usernameInput || !smartWalletAddress) return;
    setRegistering(true);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: usernameInput, 
          wallet_address: smartWalletAddress,
          avatar: avatarInput 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      
      localStorage.setItem('listo_username', data.username);
      if (data.avatar) localStorage.setItem('listo_avatar', data.avatar);
      setUsername(data.username);
      setAvatar(data.avatar);
    } catch (err) {
      alert(err.message);
    } finally {
      setRegistering(false);
    }
  };

  // If authenticated but no username set, force them to pick one
  if (authenticated && wallet?.account?.address && !username) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-bold text-primary mb-2">Configura tu perfil</h2>
          <p className="text-sm text-gray-600 mb-6">Así es como tus amigos te verán.</p>
          
          <form onSubmit={handleRegisterUsername}>
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-accent">
                  {avatarInput ? (
                    <img src={avatarInput} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-3xl">📷</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, false)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <label className="text-xs text-gray-500 mt-2">Haz clic para subir foto</label>
            </div>

            <div className="relative mb-6 text-left">
              <span className="absolute left-4 top-3 text-gray-400 font-medium">@</span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                placeholder="maria123"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                maxLength={20}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={registering || usernameInput.length < 3}
              className="w-full bg-accent text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-md"
            >
              {registering ? 'Guardando...' : 'Confirmar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
      
      // Record transaction in backend
      try {
        await fetch(`${BACKEND_URL}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from_username: username,
            to_username: targetUsername,
            amount_usd: amount,
            fee_usd: 1.50,
            corridor: 'MX→CO', // Default for demo
            tx_hash: hash
          })
        });
        fetchTransactions();
      } catch (err) {
        console.error("Error recording transaction:", err);
      }

      alert(`¡Enviado a @${targetUsername}!`);
    } catch (error) {
      alert('Error en la transacción: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-4 relative shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Listo</h1>
          <div className="flex items-center gap-3 text-sm">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              {avatar ? (
                <img src={avatar} className="w-8 h-8 rounded-full border border-white/20 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">👤</div>
              )}
              <span className="font-medium">@{username}</span>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="absolute top-16 right-4 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 text-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary text-sm">Ajustes</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-2">
                  <img src={avatar || 'https://via.placeholder.com/64'} className="w-full h-full rounded-full object-cover border-2 border-accent/20" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">✏️</div>
                </div>
                <p className="text-[10px] text-gray-500">Cambiar foto</p>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-2">Moneda preferida</label>
                  <select 
                    value={preferredCurrency}
                    onChange={(e) => {
                      setPreferredCurrency(e.target.value);
                      localStorage.setItem('listo_currency', e.target.value);
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="MXN">🇲🇽 MXN - México</option>
                    <option value="COP">🇨🇴 COP - Colombia</option>
                    <option value="GTQ">🇬🇹 GTQ - Guatemala</option>
                    <option value="HNL">🇭🇳 HNL - Honduras</option>
                    <option value="PEN">🇵🇪 PEN - Perú</option>
                    <option value="CLP">🇨🇱 CLP - Chile</option>
                    <option value="ARS">🇦🇷 ARS - Argentina</option>
                    <option value="USD">🇺🇸 USD - Dólares</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    logout();
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full text-left py-2 px-2 text-red-500 hover:bg-red-50 rounded-lg transition text-xs font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <BalanceCard balance={parseFloat(usdcBalance)} preferredCurrency={preferredCurrency} />

        <button
          onClick={() => setShowSend(true)}
          disabled={loading}
          className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-accent/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Enviar dinero'}
        </button>

        {showSend && (
          <SendFlow 
            onSend={handleSend} 
            onCancel={() => setShowSend(false)} 
            onLookup={handleLookup}
            currentUsername={username}
          />
        )}

        {txHash && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            <p className="font-semibold">Transacción exitosa</p>
            <a 
              href={`https://testnet.snowtrace.io/tx/${txHash}`} 
              target="_blank" 
              rel="noreferrer"
              className="underline break-all"
            >
              Ver en Explorer
            </a>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">Historial</h2>
            <button 
              onClick={fetchTransactions}
              className="text-accent text-xs font-bold uppercase tracking-widest hover:opacity-80 transition"
            >
              Actualizar
            </button>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map(tx => {
                const isOutgoing = tx.from_username === username;
                const otherAvatar = isOutgoing ? tx.to_avatar : tx.from_avatar;
                
                return (
                  <a 
                    key={tx.id} 
                    href={`https://testnet.snowtrace.io/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition rounded-xl px-2 -mx-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${isOutgoing ? 'border-red-100' : 'border-green-100'}`}>
                          {otherAvatar ? (
                            <img src={otherAvatar} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${isOutgoing ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                              {isOutgoing ? '↗' : '↙'}
                            </div>
                          )}
                        </div>
                        {otherAvatar && (
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold ${isOutgoing ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                            {isOutgoing ? '↗' : '↙'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm">
                          {isOutgoing ? `@${tx.to_username}` : `@${tx.from_username}`}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {new Date(tx.timestamp).toLocaleDateString()} · {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-lg tracking-tighter ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
                        {isOutgoing ? '-' : '+'}${tx.amount_usd.toFixed(2)}
                      </p>
                      <p className="text-[9px] text-gray-300 font-mono font-bold uppercase tracking-tighter">USDC</p>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium italic">Sin transacciones aún</p>
              <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest font-bold">Tus pagos aparecerán aquí</p>
            </div>
          )}
        </div>
      </main>

      <DebugPanel />
    </div>
  );
}

export default App;
;
