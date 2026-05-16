import { usePrivy, useWallets } from '@privy-io/react-auth';

export function useWallet() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy'
  );

  return {
    login,
    logout,
    authenticated,
    user,
    wallet: embeddedWallet,
    address: embeddedWallet?.address,
  };
}
