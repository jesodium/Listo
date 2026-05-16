import { useState } from 'react';
import { useWallets, usePrivy } from '@privy-io/react-auth';

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  let wallets;
  let walletsReady;
  let user;
  let authenticated;
  let ready;
  try {
    const w = useWallets();
    wallets = w.wallets;
    walletsReady = w.ready;
  } catch {}
  try {
    const p = usePrivy();
    user = p.user;
    authenticated = p.authenticated;
    ready = p.ready;
  } catch {}

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-3 right-3 text-3xl bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center opacity-80 hover:opacity-100 z-50 shadow-lg"
      >
        🐛
      </button>

      {open && (
        <div className="fixed bottom-12 right-2 z-50 bg-gray-900 text-green-400 text-xs font-mono p-4 rounded-xl shadow-2xl max-w-xs w-full border border-gray-700 max-h-[70vh] overflow-y-auto">
          <p className="text-white font-semibold text-sm mb-3">Debug</p>
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-gray-500">✕</button>

          <div><span className="text-gray-500">ready </span>{String(ready)}</div>
          <div><span className="text-gray-500">auth </span>{String(authenticated)}</div>
          <div><span className="text-gray-500">wallets </span>{wallets?.length ?? 0}</div>

          {wallets?.map((w, i) => (
            <div key={i} className="border-t border-gray-700 pt-2 mt-2">
              <div className="break-all">addr: {w.address || 'none'}</div>
              <div>type: {w.walletClientType || 'n/a'}</div>
              <div>chain: {w.chainId || 'n/a'}</div>
              {w?.address && (
                <a href={`https://testnet.snowtrace.io/address/${w.address}`} target="_blank" rel="noreferrer" className="text-accent underline">
                  snowtrace ↗
                </a>
              )}
            </div>
          ))}

          {user?.email && <div className="border-t border-gray-700 pt-2 mt-2">email: {user.email.address}</div>}
          {user?.phone && <div>phone: {user.phone.number}</div>}

          {!wallets?.length && authenticated && (
            <div className="border-t border-gray-700 pt-2 mt-2 text-yellow-400">
              No wallets. Enable Embedded Wallets → EVM in Privy dashboard.
            </div>
          )}
        </div>
      )}
    </>
  );
}
