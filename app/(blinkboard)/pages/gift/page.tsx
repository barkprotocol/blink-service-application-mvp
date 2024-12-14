'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider'
import { WalletButton } from '@/components/WalletButton'

const giftTypes = ['BARK Tokens', 'NFT', 'Merch Blink']

export default function Gift() {
  const [recipient, setRecipient] = useState('')
  const [giftType, setGiftType] = useState(giftTypes[0])
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement gift sending logic here
    console.log('Sending gift:', { recipient, giftType, amount, message })
    alert('Gift sent successfully!')
  }

  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Send a Gift</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendGift} className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="giftType">Gift Type</Label>
                <Select value={giftType} onValueChange={setGiftType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gift type" />
                  </SelectTrigger>
                  <SelectContent>
                    {giftTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Send Gift</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SolanaWalletProvider>
  )
}