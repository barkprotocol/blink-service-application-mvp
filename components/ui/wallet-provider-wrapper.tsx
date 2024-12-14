'use client'

import React, { FC, ReactNode, useMemo, useCallback } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { useToast } from "@/components/ui/use-toast"

// Import styles
require('@solana/wallet-adapter-react-ui/styles.css')

const WalletProviderWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  )

  const { toast } = useToast()

  const onError = useCallback((error: Error) => {
    console.error('Wallet error:', error);
    let description = 'An unexpected error occurred. Please try again or use a different wallet.';

    if (error.name === 'WalletNotReadyError') {
      description = 'Wallet is not ready. Please check if your wallet extension is installed and unlocked.';
    } else if (error.name === 'WalletConnectionError') {
      description = 'Failed to connect to the wallet. Please try again or use a different wallet.';
    } else if (error.name === 'WalletDisconnectedError') {
      description = 'Wallet disconnected. Please try reconnecting.';
    } else if (error.name === 'WalletTimeoutError') {
      description = 'Wallet connection timed out. Please try again.';
    }

    toast({
      title: "Wallet Error",
      description: description,
      variant: "destructive",
    });
  }, [toast]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        onError={onError} 
        autoConnect={false}
        localStorageKey="walletAdapter"
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletProviderWrapper

