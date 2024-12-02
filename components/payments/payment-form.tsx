'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Send, QrCode } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SolanaPayQR } from './solana-pay-qr'
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface PaymentFormProps {
  onSubmit: (recipient: string, amount: number, memo: string) => Promise<void>
  isLoading: boolean
  selectedPaymentMethod: string
}

export function PaymentForm({ onSubmit, isLoading, selectedPaymentMethod }: PaymentFormProps) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [qrReference] = useState(() => crypto.randomUUID())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (recipient && amount) {
      try {
        await onSubmit(recipient, parseFloat(amount), memo)
        setRecipient('')
        setAmount('')
        setMemo('')
      } catch (err) {
        setError('Failed to send payment. Please try again.')
      }
    }
  }

  return (
    <Card className="w-full bg-white shadow-lg border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Send Payment</CardTitle>
        <CardDescription>Enter the recipient's address and the amount to send</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-sm font-medium">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter Solana address"
              required
              className="font-mono bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Amount ({selectedPaymentMethod.toUpperCase()})</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              min="0.000001"
              step="0.000001"
              className="bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo" className="text-sm font-medium">Memo (optional)</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Enter a memo for this transaction"
              className="bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="qr-mode" checked={showQR} onCheckedChange={setShowQR} />
            <Label htmlFor="qr-mode">Generate Solana Pay QR Code</Label>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        {showQR ? (
          <SolanaPayQR
            recipient={recipient}
            amount={parseFloat(amount)}
            reference={qrReference}
            label="BARK Payment"
            message="Thanks for using BARK!"
            memo={memo}
          />
        ) : (
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            onClick={handleSubmit}
            disabled={isLoading || !recipient || !amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send Payment
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

