import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types/certificate';

declare global {
  interface Window {
    MyAlgoConnect: any;
    algorand: any;
  }
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    loading: false,
    error: null,
  });

  // Check for existing wallet connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      // Check if there's a stored wallet address
      const storedAddress = localStorage.getItem('peercertify_wallet_address');
      if (storedAddress) {
        setWalletState({
          connected: true,
          address: storedAddress,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.warn('Failed to check existing wallet connection:', error);
    }
  };

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Try MyAlgo Connect first
      if (typeof window !== 'undefined' && window.MyAlgoConnect) {
        try {
          const MyAlgoConnect = window.MyAlgoConnect;
          const myAlgoWallet = new MyAlgoConnect();
          
          const accounts = await myAlgoWallet.connect({
            shouldSelectOneAccount: true,
            openManager: false,
          });
          
          if (accounts.length > 0) {
            const address = accounts[0].address;
            localStorage.setItem('peercertify_wallet_address', address);
            
            setWalletState({
              connected: true,
              address,
              loading: false,
              error: null,
            });
            return address;
          }
        } catch (myAlgoError) {
          console.warn('MyAlgo connection failed:', myAlgoError);
        }
      }

      // Try Pera Wallet (if available)
      if (typeof window !== 'undefined' && window.algorand) {
        try {
          const accounts = await window.algorand.connect();
          if (accounts.length > 0) {
            const address = accounts[0];
            localStorage.setItem('peercertify_wallet_address', address);
            
            setWalletState({
              connected: true,
              address,
              loading: false,
              error: null,
            });
            return address;
          }
        } catch (peraError) {
          console.warn('Pera Wallet connection failed:', peraError);
        }
      }

      // Fallback to demo mode if no wallet is available
      console.warn('No Algorand wallet detected, using demo mode');
      const demoAddress = 'DEMO7XVFWK2JGHPQXNVQJDUMXC5NVGM6QJKM3HXLWMZPQJDUMXC5NVGM6Q';
      localStorage.setItem('peercertify_wallet_address', demoAddress);
      
      setWalletState({
        connected: true,
        address: demoAddress,
        loading: false,
        error: null,
      });
      return demoAddress;
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to connect wallet. Please ensure you have MyAlgo or Pera Wallet installed.',
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('peercertify_wallet_address');
    setWalletState({
      connected: false,
      address: null,
      loading: false,
      error: null,
    });
  }, []);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!walletState.connected || !walletState.address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Try MyAlgo signing
      if (typeof window !== 'undefined' && window.MyAlgoConnect) {
        const MyAlgoConnect = window.MyAlgoConnect;
        const myAlgoWallet = new MyAlgoConnect();
        
        const signedTxn = await myAlgoWallet.signTransaction(transaction);
        return signedTxn.blob;
      }

      // Try Pera Wallet signing
      if (typeof window !== 'undefined' && window.algorand) {
        const signedTxn = await window.algorand.signTransaction(transaction);
        return signedTxn;
      }

      throw new Error('No wallet available for signing');
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw error;
    }
  }, [walletState.connected, walletState.address]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    signTransaction,
  };
};