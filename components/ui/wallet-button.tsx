'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

export function WalletButton() {
 const { wallet, connect, disconnect, connecting, connected, publicKey } = useWallet()
 const { setVisible } = useWalletModal()
 const [isLoading, setIsLoading] = useState(false)
 const [connectionError, setConnectionError] = useState<string | null>(null)
 const { toast } = useToast()

 useEffect(() => {
   if (connected) {
     setConnectionError(null)
   }
 }, [connected])

 const handleClick = useCallback(async () => {
   if (connecting || isLoading) return

   setIsLoading(true)
   setConnectionError(null)

   try {
     if (connected) {
       await disconnect()
       toast({
         title: "Wallet Disconnected",
         description: "Your wallet has been successfully disconnected.",
       })
     } else if (wallet) {
       await connect().catch((err) => {
         console.error('Connection error:', err)
         throw err
       })
     } else {
       setVisible(true)
       return
     }
   } catch (error) {
     console.error('Wallet action failed:', error)
     const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
     setConnectionError(errorMessage)
     toast({
       title: "Connection Error",
       description: errorMessage,
       variant: "destructive",
     })
   } finally {
     setIsLoading(false)
   }
 }, [connected, wallet, connect, disconnect, setVisible, toast, connecting])

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
         : connectionError
         ? 'Retry Connection'
         : 'Connect Wallet'
       }
     </span>
   </Button>
 )
}

