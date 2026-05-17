import { useWallets, usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

export function DebugPanel() {
  let wallets;
  let user;
  let authenticated;
  let ready;
  let smartWalletAddress;

  try {
    const w = useWallets();
    wallets = w.wallets;
  } catch {}
  try {
    const p = usePrivy();
    user = p.user;
    authenticated = p.authenticated;
    ready = p.ready;
  } catch {}
  try {
    const sw = useSmartWallets();
    smartWalletAddress = sw.client?.account?.address;
  } catch {}

  return (
    <div className="bg-surface rounded-3xl p-5 border border-muted/5 shadow-sm font-mono text-[10px] space-y-4">
      <div className="flex items-center justify-between border-b border-muted/5 pb-2 mb-2">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em]">Debug Info</p>
        <span className="text-accent font-bold">● System Active</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-background p-2 rounded-xl">
          <p className="text-muted mb-1">Status</p>
          <p className="text-primary font-bold">{ready ? 'READY' : 'LOADING'}</p>
        </div>
        <div className="bg-background p-2 rounded-xl">
          <p className="text-muted mb-1">Auth</p>
          <p className="text-primary font-bold">{authenticated ? 'YES' : 'NO'}</p>
        </div>
      </div>
      
      {smartWalletAddress && (
        <div className="bg-background p-3 rounded-xl border border-muted/5">
          <p className="text-yellow-500 font-bold mb-1 uppercase tracking-wider text-[9px]">Smart Wallet</p>
          <p className="text-primary break-all mb-2 leading-tight">{smartWalletAddress}</p>
          <a href={`https://testnet.snowtrace.io/address/${smartWalletAddress}`} target="_blank" rel="noreferrer" 
             className="text-accent font-bold underline decoration-accent/30">
            Ver en Snowtrace ↗
          </a>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-muted uppercase tracking-wider text-[9px] font-bold">Wallets Detected: {wallets?.length ?? 0}</p>
        {wallets?.map((w, i) => (
          <div key={i} className="bg-background p-3 rounded-xl border border-muted/5">
            <p className="text-primary font-bold mb-1">Embedded Wallet #{i+1}</p>
            <p className="text-muted break-all mb-1 leading-tight">{w.address || 'none'}</p>
            <div className="flex gap-3 text-muted">
              <span>{w.walletClientType || 'n/a'}</span>
              <span>Chain: {w.chainId || 'n/a'}</span>
            </div>
          </div>
        ))}
      </div>

      {user?.email && (
        <div className="bg-background p-3 rounded-xl border border-muted/5 flex justify-between">
          <span className="text-muted">Email</span>
          <span className="text-primary font-bold">{user.email.address}</span>
        </div>
      )}
    </div>
  );
}
