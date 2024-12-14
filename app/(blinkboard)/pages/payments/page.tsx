'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SolanaWalletProvider } from '@/components/providers/solana-wallet-provider'
import { WalletButton } from '@/components/ui/wallet-button'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from "@/components/ui/use-toast"
import { Loader2, DollarSign, CreditCard, Wallet } from 'lucide-react'
import SolanaPay from './solana-pay'
import Checkout from './checkout'

export default function PaymentsPage() {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const router = useRouter()
  const { connected } = useWallet()

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a payment.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      // Simulating a delay for payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowCheckout(true)
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-6 w-6 text-[#D0BFB4]" />
              Make a Payment
            </CardTitle>
            <CardDescription>Enter the amount and choose your payment method</CardDescription>
          </CardHeader>
          <CardContent>
            {!showCheckout ? (
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-5 w-5 text-[#D0BFB4]" aria-hidden="true" />
                    </div>
                    <Input
                      type="number"
                      name="amount"
                      id="amount"
                      className="block w-full rounded-md pl-10 pr-12"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <Checkout amount={parseFloat(amount)} />
            )}
          </CardContent>
        </Card>
        <div className="mt-8">
          <SolanaPay />
        </div>
      </div>
    </SolanaWalletProvider>
  )
}