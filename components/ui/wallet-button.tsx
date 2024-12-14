'use client'

import React, { useCallback, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

export function WalletButton() {
  const { wallet, connect, disconnect, connecting, connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleClick = useCallback(async () => {
    setIsLoading(true)
    try {
      if (connected) {
        await disconnect()
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been successfully disconnected.",
        })
      } else if (wallet) {
        await connect()
      } else {
        setVisible(true)
      }
    } catch (error) {
      console.error('Wallet action failed:', error)
      toast({
        title: "Error",
        description: "Failed to connect or disconnect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [connected, wallet, connect, disconnect, setVisible, toast])

  return (
    <Button 
      onClick={handleClick}
      variant={connected ? "outline" : "default"}
      size="lg"
      className="flex items-center space-x-2 min-w-[180px] justify-center"
      disabled={connecting || isLoading}
    >
      {connecting || isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Wallet className="h-5 w-5" />
      )}
      <span>
        {connecting || isLoading
          ? 'Connecting...'
          : connected
          ? `${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}`
          : 'Connect Wallet'
        }
      </span>
    </Button>
  )
}

