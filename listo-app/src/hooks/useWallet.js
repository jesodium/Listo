import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { ethers } from 'ethers';
import { USDC_FUJI, AVALANCHE_FUJI } from '../utils/avalanche';
import { ERC20_ABI } from '../utils/erc20';

export function useWallet() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const { client } = useSmartWallets();
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const [loading, setLoading] = useState(false);

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy'
  );

  // Strictly use Smart Wallet address. Ignore embedded wallet balance to prevent flicker.
  const displayAddress = client?.account?.address;

  const getBalance = useCallback(async () => {
    if (!displayAddress) return;
    
    try {
      const staticProvider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
      const contract = new ethers.Contract(USDC_FUJI.address, ERC20_ABI, staticProvider);
      
      const balance = await contract.balanceOf(displayAddress);
      const decimals = await contract.decimals();
      setUsdcBalance(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [displayAddress]);

  useEffect(() => {
    if (authenticated && displayAddress) {
      getBalance();
    }
  }, [authenticated, displayAddress, getBalance]);

  const sendUSDC = async (to, amount) => {
    if (!client) throw new Error('Smart Wallet no está lista');
    
    setLoading(true);
    try {
      if (embeddedWallet) {
        await embeddedWallet.switchChain(AVALANCHE_FUJI.chainId);
      }
      
      const staticProvider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
      const contract = new ethers.Contract(USDC_FUJI.address, ERC20_ABI, staticProvider);
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

      // 1. Check balance before attempting
      const balance = await contract.balanceOf(displayAddress);
      if (balance < parsedAmount) {
        throw new Error('Saldo insuficiente para realizar esta transferencia.');
      }

      const data = contract.interface.encodeFunctionData('transfer', [to, parsedAmount]);

      // Execute via Smart Wallet client -> hits Pimlico Paymaster
      const txHash = await client.sendTransaction({
        account: client.account,
        to: USDC_FUJI.address,
        data: data,
        value: 0n,
      });

      await getBalance();
      return txHash;
    } catch (error) {
      console.error('Transfer error:', error);
      
      // User-friendly error mapping
      if (error.message.includes('user rejected')) {
        throw new Error('La transacción fue cancelada por el usuario.');
      }
      if (error.message.includes('Saldo insuficiente')) {
        throw error;
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Error de conexión. Revisa tu internet e inténtalo de nuevo.');
      }
      
      throw new Error('Hubo un problema al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    authenticated,
    ready: ready && (authenticated ? !!client : true), // Force wait for client if authenticated
    user,
    wallet: client, // Expose smart wallet client
    address: displayAddress,
    usdcBalance,
    sendUSDC,
    refreshBalance: getBalance,
    loading,
  };
}
