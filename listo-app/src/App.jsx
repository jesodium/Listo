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
  const [registering, setRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  // Auto-register logic once connected
  useEffect(() => {
    if (authenticated && address && !username && !registering) {
      // Show registration UI
    }
  }, [authenticated, address, username, registering]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-lg">Cargando...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-primary mb-2">Listo</h1>
          <p className="text-gray-600 mb-8">Pagos transfronterizos instantáneos</p>

          <button
            onClick={login}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition"
          >
            Iniciar sesión
          </button>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Powered by Bankaool · Avalanche Fuji Testnet
          </p>
        </div>
      </div>
    );
  }

  const handleRegisterUsername = async (e) => {
    e.preventDefault();
    // Use the explicit Smart Wallet address for registration
    const smartWalletAddress = wallet?.account?.address;
    
    if (!usernameInput || !smartWalletAddress) return;
    setRegistering(true);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, wallet_address: smartWalletAddress })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      
      localStorage.setItem('listo_username', data.username);
      setUsername(data.username);
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
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold text-primary mb-2">Elige tu @usuario</h2>
          <p className="text-sm text-gray-600 mb-6">Así es como tus amigos te enviarán dinero.</p>
          
          <form onSubmit={handleRegisterUsername}>
            <div className="relative mb-6">
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
              className="w-full bg-accent text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {registering ? 'Guardando...' : 'Confirmar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSend = async ({ targetUsername, amount }) => {
    try {
      // 1. Lookup address
      const res = await fetch(`${BACKEND_URL}/api/lookup/${targetUsername}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Usuario no encontrado');
      
      const recipientAddress = data.wallet_address;

      // 2. Execute TX
      const hash = await sendUSDC(recipientAddress, amount);
      setTxHash(hash);
      setShowSend(false);
      alert(`Enviado a @${targetUsername}!`);
    } catch (error) {
      alert('Error en la transacción: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Listo</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">@{username}</span>
            <button
              onClick={() => {
                logout();
                localStorage.clear();
                window.location.reload();
              }}
              className="text-gray-400 hover:text-white ml-2"
              title="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <BalanceCard balance={parseFloat(usdcBalance)} />

        <button
          onClick={() => setShowSend(true)}
          disabled={loading}
          className="w-full bg-accent text-white py-4 rounded-xl font-semibold text-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Enviar dinero'}
        </button>

        {showSend && <SendFlow onSend={handleSend} onCancel={() => setShowSend(false)} />}

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
