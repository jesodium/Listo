import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { USDC_FUJI, AVALANCHE_FUJI } from '../utils/avalanche';
import { ERC20_ABI } from '../utils/erc20';

export function useWallet() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const [loading, setLoading] = useState(false);

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy'
  );

  const getBalance = useCallback(async () => {
    if (!embeddedWallet) return;
    
    try {
      // Always use static RPC for reads to avoid chain mismatch race conditions
      const staticProvider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
      const contract = new ethers.Contract(USDC_FUJI.address, ERC20_ABI, staticProvider);
      
      const balance = await contract.balanceOf(embeddedWallet.address);
      const decimals = await contract.decimals();
      setUsdcBalance(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [embeddedWallet]);

  useEffect(() => {
    if (authenticated && embeddedWallet) {
      getBalance();
    }
  }, [authenticated, embeddedWallet, getBalance]);

  const sendUSDC = async (to, amount) => {
    if (!embeddedWallet) throw new Error('No wallet connected');
    
    setLoading(true);
    try {
      await embeddedWallet.switchChain(AVALANCHE_FUJI.chainId);
      
      // Calculate amount with decimals
      const staticProvider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
      const contract = new ethers.Contract(USDC_FUJI.address, ERC20_ABI, staticProvider);
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

      // Encode the ERC20 transfer function call
      const data = contract.interface.encodeFunctionData('transfer', [to, parsedAmount]);

      // Execute without sponsor: true (User pays gas in AVAX)
      const txRequest = {
        to: USDC_FUJI.address,
        data: data,
        value: 0,
        chainId: AVALANCHE_FUJI.chainId,
      };

      const uiOptions = {
        header: 'Enviar USDC',
        description: 'Bankaool - Confirmar transacción',
        buttonText: 'Confirmar Envío',
      };

      const txResponse = await sendTransaction(txRequest, uiOptions);
      
      await getBalance();
      // txResponse is an object containing the transaction hash
      return txResponse.transactionHash;
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    authenticated,
    ready,
    user,
    wallet: embeddedWallet,
    address: embeddedWallet?.address,
    usdcBalance,
    sendUSDC,
    refreshBalance: getBalance,
    loading,
  };
}
