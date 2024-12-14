'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PaymentForm } from '@/components/payments/payment-form'
import { PaymentHistory } from '@/components/payments/payment-history'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { motion } from 'framer-motion'
import { CreditCard, ArrowLeft } from 'lucide-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from '@/components/ui/wallet-button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// This would typically come from an environment variable
const SOLANA_RPC_URL = 'https://api.devnet.solana.com'

const paymentMethods = [
  { id: 'sol', name: 'SOL', icon: 'https://ucarecdn.com/8bcc4664-01b2-4a88-85bc-9ebce234f08b/sol.png' },
  { id: 'bark', name: 'BARK', icon: 'https://ucarecdn.com/8aa0180d-1112-4aea-8210-55b266c3fb44/bark.png' },
  { id: 'usdc', name: 'USDC', icon: 'https://ucarecdn.com/67e17a97-f3bd-46c0-8627-e13b8b939d26/-/preview/1000x1000/' },
]

export default function PaymentsPage() {
  const { connected, publicKey, sendTransaction } = useWallet()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    recipient: string;
    amount: number;
    timestamp: Date;
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('sol')

  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactions()
    }
  }, [connected, publicKey])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would fetch transactions from your backend or the Solana blockchain
      // For this example, we'll use mock data
      const mockTransactions = [
        { id: '1', recipient: '7X8jbJdZh2Wi4cmM...', amount: 0.05, timestamp: new Date('2023-05-01T10:00:00') },
        { id: '2', recipient: '3Fej7yNhJoHCmJ9X...', amount: 0.1, timestamp: new Date('2023-05-02T14:30:00') },
        { id: '3', recipient: '9Qm5tKqoWqrFxAe7...', amount: 0.02, timestamp: new Date('2023-05-03T09:15:00') },
      ]
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (recipient: string, amount: number) => {
    if (!connected || !publicKey || !sendTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a payment.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')
      const recipientPubkey = new PublicKey(recipient)
      const lamports = amount * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      )

      const { blockhash } = await connection.getRecentBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      const newTransaction = {
        id: signature,
        recipient,
        amount,
        timestamp: new Date(),
      }

      setTransactions([newTransaction, ...transactions])

      toast({
        title: "Payment sent",
        description: `Successfully sent ${amount} ${selectedPaymentMethod.toUpperCase()} to ${recipient}`,
      })
    } catch (error) {
      console.error('Error sending payment:', error)
      toast({
        title: "Error",
        description: "Failed to send payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" passHref>
            <Button variant="ghost" className="mb-4 hover:bg-primary/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main
            </Button>
          </Link>
          <Card className="bg-white shadow-md">
            <CardHeader className="text-center">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
              <CardTitle className="text-4xl font-bold mb-2">Payments</CardTitle>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Send quick and secure transactions on the Solana blockchain.
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <WalletButton />
            </CardContent>
          </Card>
        </motion.div>
        {connected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle>Send Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Select Payment Method</h2>
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                      className="flex flex-wrap gap-4"
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex items-center space-x-2 cursor-pointer">
                            <Image src={method.icon} alt={method.name} width={24} height={24} />
                            <span>{method.name}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <PaymentForm onSubmit={handlePayment} isLoading={isLoading} />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentHistory transactions={transactions} isLoading={isLoading} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="bg-white shadow-md">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground mb-4">
                  Please connect your wallet to access Solana Payments.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}