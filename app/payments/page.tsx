'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PaymentForm } from '@/components/payments/payment-form'
import { PaymentHistory } from '@/components/payments/payment-history'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { motion } from 'framer-motion'
import { CreditCard, ArrowLeft, Wallet } from 'lucide-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js'
import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from '@/components/ui/wallet-button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    memo?: string;
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
        { id: '1', recipient: '7X8jbJdZh2Wi4cmM...', amount: 0.05, timestamp: new Date('2023-05-01T10:00:00'), memo: 'Coffee' },
        { id: '2', recipient: '3Fej7yNhJoHCmJ9X...', amount: 0.1, timestamp: new Date('2023-05-02T14:30:00'), memo: 'Lunch' },
        { id: '3', recipient: '9Qm5tKqoWqrFxAe7...', amount: 0.02, timestamp: new Date('2023-05-03T09:15:00'), memo: 'Tip' },
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

  const handlePayment = async (recipient: string, amount: number, memo: string) => {
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

      if (memo) {
        transaction.add(
          new TransactionInstruction({
            keys: [],
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: Buffer.from(memo, "utf-8"),
          })
        )
      }

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
        memo,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Link href="/" passHref>
            <Button className="mb-6 hover:bg-primary/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main
            </Button>
          </Link>
          <Card className="bg-white shadow-lg border-none">
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold mb-2">BARK Blink Payments</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Send quick and secure transactions on the Solana blockchain using BARK, SOL, or USDC.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        {connected ? (
          <Tabs defaultValue="send" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="send">Send Payment</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>
            <TabsContent value="send">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white shadow-lg border-none">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Send Payment</CardTitle>
                    <CardDescription>Choose your payment method and enter the recipient details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                      <RadioGroup
                        value={selectedPaymentMethod}
                        onValueChange={setSelectedPaymentMethod}
                        className="flex flex-wrap gap-6"
                      >
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center space-x-3">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Image src={method.icon} alt={method.name} width={24} height={24} />
                              </div>
                              <span className="font-medium">{method.name}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <PaymentForm onSubmit={handlePayment} isLoading={isLoading} selectedPaymentMethod={selectedPaymentMethod} />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            <TabsContent value="history">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <PaymentHistory transactions={transactions} isLoading={isLoading} />
              </motion.div>
            </TabsContent>
          </Tabs>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="bg-white shadow-lg border-none">
              <CardContent className="pt-10 pb-12">
                <Wallet className="w-16 h-16 mx-auto mb-6 text-primary/60" />
                <h3 className="text-2xl font-semibold mb-4">Connect Your Wallet</h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                  Please connect your wallet to access BARK Blink Payments and start making secure transactions.
                </p>
                <WalletButton />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}