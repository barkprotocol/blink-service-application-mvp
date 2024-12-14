'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, RefreshCw, Zap } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

interface Blink {
  id: string
  name: string
  color: string
  size: number
  speed: number
  pattern: string
  glow: boolean
}

export default function BlinksPage() {
  const [blinks, setBlinks] = useState<Blink[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    if (connected) {
      fetchBlinks()
    }
  }, [connected])

  const fetchBlinks = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would fetch the actual Blinks from your backend
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulating API call
      const mockBlinks: Blink[] = [
        { id: '1', name: 'Red Fury', color: '#ff0000', size: 60, speed: 8, pattern: 'pulse', glow: true },
        { id: '2', name: 'Blue Calm', color: '#0000ff', size: 40, speed: 3, pattern: 'steady', glow: false },
        { id: '3', name: 'Green Flash', color: '#00ff00', size: 50, speed: 10, pattern: 'blink', glow: true },
      ]
      setBlinks(mockBlinks)
    } catch (error) {
      console.error('Error fetching Blinks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch Blinks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const activateBlink = async (blinkId: string) => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to activate a Blink.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this activation request to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulating API call
      toast({
        title: "Blink Activated",
        description: `Blink ${blinkId} has been successfully activated!`,
      })
    } catch (error) {
      console.error('Error activating Blink:', error)
      toast({
        title: "Error",
        description: "Failed to activate Blink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/" passHref>
        <Button variant="ghost" className="mb-4 hover:bg-primary/10">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main
        </Button>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Your Blinks</CardTitle>
            <CardDescription>View and manage your collection of Blinks</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : blinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blinks.map((blink) => (
                    <Card key={blink.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>{blink.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Color:</span>
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: blink.color }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Size:</span>
                            <span>{blink.size}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Speed:</span>
                            <span>{blink.speed}/10</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Pattern:</span>
                            <span className="capitalize">{blink.pattern}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Glow:</span>
                            <span>{blink.glow ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() => activateBlink(blink.id)}
                          disabled={isLoading}
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Activate Blink
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-lg text-muted-foreground">You don't have any Blinks yet.</p>
              )
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to view your Blinks.</p>
                <WalletButton />
              </div>
            )}
          </CardContent>
          {connected && (
            <CardFooter>
              <Button className="w-full" onClick={fetchBlinks} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Blinks
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  )
}