import { useState, useEffect } from 'react';
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
    wallet
  } = useWallet();
  
  const [showSend, setShowSend] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('listo_username') || null);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('listo_avatar') || null);
  const [showSettings, setShowSettings] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState(null);

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

              <div className="pt-2 border-t border-gray-100">
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
        <BalanceCard balance={parseFloat(usdcBalance)} />

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
          <h2 className="text-lg font-semibold text-primary mb-3">Historial</h2>
          <p className="text-gray-500 text-sm">Sin transacciones aún</p>
        </div>
      </main>

      <DebugPanel />
    </div>
  );
}

export default App;
;
