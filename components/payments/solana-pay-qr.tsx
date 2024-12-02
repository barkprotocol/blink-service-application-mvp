'use client'

import React, { useEffect, useState } from 'react'
import { createQR, encodeURL, TransferRequestURLFields, findReference, validateTransfer, FindReferenceError, ValidateTransferError } from "@solana/pay"
import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

interface SolanaPayQRProps {
  recipient: string
  amount: number
  reference: string
  label: string
  message: string
  memo: string
}

export const SolanaPayQR: React.FC<SolanaPayQRProps> = ({ recipient, amount, reference, label, message, memo }) => {
  const [qr, setQr] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | 'error'>('pending')
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    const generateQR = async () => {
      try {
        const recipientPublicKey = new PublicKey(recipient)
        const referencePublicKey = new PublicKey(reference)
        const urlParams: TransferRequestURLFields = {
          recipient: recipientPublicKey,
          amount,
          splToken: undefined, // We're using SOL, so this is undefined
          reference: referencePublicKey,
          label,
          message,
          memo
        }

        const url = encodeURL(urlParams)
        const qr = createQR(url, 512, 'transparent')
        setQr(await qr.getRawData('png'))

        // Start checking for transaction
        checkPaymentStatus(connection, referencePublicKey)
      } catch (error) {
        console.error('Error generating QR code:', error)
        toast({
          title: "Error",
          description: "Failed to generate QR code. Please check the recipient address and try again.",
          variant: "destructive",
        })
      }
    }

    generateQR()
  }, [recipient, amount, reference, label, message, memo])

  const checkPaymentStatus = async (connection: Connection, reference: PublicKey) => {
    try {
      const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' })
      await validateTransfer(connection, signatureInfo.signature, {
        recipient: new PublicKey(recipient),
        amount,
        splToken: undefined,
        reference,
      })
      setPaymentStatus('confirmed')
      toast({
        title: "Payment Confirmed",
        description: "The Solana Pay transaction has been confirmed.",
      })
    } catch (error) {
      if (error instanceof FindReferenceError) {
        // No transaction found yet, ignore this error
        setTimeout(() => checkPaymentStatus(connection, reference), 5000) // Check again in 5 seconds
      } else if (error instanceof ValidateTransferError) {
        // Transaction found, but it's invalid
        console.error('Transaction found but invalid:', error)
        setPaymentStatus('error')
        toast({
          title: "Payment Error",
          description: "The transaction was found but is invalid. Please check the details and try again.",
          variant: "destructive",
        })
      } else {
        // Unknown error
        console.error('Unknown error:', error)
        setPaymentStatus('error')
        toast({
          title: "Payment Error",
          description: "An unknown error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Solana Pay QR Code</CardTitle>
        <CardDescription>Scan this QR code to make a payment</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {qr ? (
          <img src={qr} alt="Solana Pay QR Code" className="w-64 h-64" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <div className="mt-4 text-center">
          <p>Amount: {amount} SOL</p>
          <p>Recipient: {recipient.slice(0, 4)}...{recipient.slice(-4)}</p>
          <p>Status: {paymentStatus}</p>
        </div>
      </CardContent>
    </Card>
  )
}

