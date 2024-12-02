'use client'

import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from 'lucide-react'

export function ConnectWalletButton() {
  const { wallet, connect, disconnect, connecting, connected } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = React.useCallback(async () => {
    if (connected) {
      await disconnect()
    } else if (wallet) {
      try {
        await connect()
      } catch (error) {
        console.error('Failed to connect:', error)
      }
    } else {
      setVisible(true)
    }
  }, [connected, wallet, connect, disconnect, setVisible])

  return (
    <Button 
      onClick={handleClick}
      variant="default"
      size="lg"
      className="flex items-center space-x-1"
      disabled={connecting}
    >
      {connecting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Wallet className="h-5 w-5" />
      )}
      <span>
        {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect Wallet'}
      </span>
    </Button>
  )
}

