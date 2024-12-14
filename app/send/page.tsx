'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

interface Blink {
  id: string;
  name: string;
}

export default function SendBlinkPage() {
  const [selectedBlink, setSelectedBlink] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [blinks, setBlinks] = useState<Blink[]>([])
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (connected && publicKey) {
      fetchBlinks()
    }
  }, [connected, publicKey])

  const fetchBlinks = async () => {
    setIsLoading(true)
    try {
      // Simulated API call to fetch user's Blinks
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockBlinks: Blink[] = [
        { id: 'blink1', name: 'Awesome Blink' },
        { id: 'blink2', name: 'Cool Blink' },
        { id: 'blink3', name: 'Super Blink' },
      ]
      setBlinks(mockBlinks)
    } catch (error) {
      console.error('Error fetching Blinks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch your Blinks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to send a Blink.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Blink Sent",
        description: `Your Blink has been sent to ${recipient} successfully!`,
      })
      router.push('/my-blinks')
    } catch (error) {
      console.error('Error sending Blink:', error)
      toast({
        title: "Error",
        description: "Failed to send Blink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Send a Blink</CardTitle>
            <CardDescription>Transfer your Blink to another user on the Solana network</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blink">Select Blink</Label>
                  <Select value={selectedBlink} onValueChange={setSelectedBlink}>
                    <SelectTrigger id="blink">
                      <SelectValue placeholder="Choose a Blink" />
                    </SelectTrigger>
                    <SelectContent>
                      {blinks.map((blink) => (
                        <SelectItem key={blink.id} value={blink.id}>{blink.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter Solana address"
                    required
                  />
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to send a Blink.</p>
                <WalletButton />
              </div>
            )}
          </CardContent>
          {connected && (
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                onClick={handleSend}
                disabled={isLoading || !selectedBlink || !recipient}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Blink
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