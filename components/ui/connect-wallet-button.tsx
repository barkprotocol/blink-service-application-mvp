'use client'

import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from "@/components/ui/button"
import { Wallet } from 'lucide-react'

export const ConnectWalletButton: React.FC = () => {
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
      className="bg-[#D0BFB4] text-gray-900 hover:bg-[#C0AFA4] transition-colors flex items-center space-x-2 px-4 py-2 rounded-full"
      disabled={connecting}
    >
      <Wallet className="h-5 w-5" />
      <span>
        {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect Wallet'}
      </span>
    </Button>
  )
}