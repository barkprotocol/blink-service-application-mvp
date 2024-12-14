'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Gift, ExternalLink } from 'lucide-react'
import { WalletButton } from '@/components/ui/wallet-button'
import Link from 'next/link'
import { Gift as GiftType } from '@/types/gift'

export default function GiftPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const { toast } = useToast()
  const [gifts, setGifts] = useState<GiftType[]>([
    { id: '1', name: 'Mystery Box', description: 'A surprise gift box!', type: 'Physical' },
    { id: '2', name: 'Gift Card', description: 'A gift card for your favorite store', type: 'Digital' },
    { id: '3', name: 'Charity Donation', description: 'Donate on behalf of someone', type: 'Donation' },
  ])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!connected) {
      router.push('/')
    }
  }, [connected, router])

  const handleSendGift = () => {
    toast({
      title: "Send Gift",
      description: "This feature is coming soon!",
    })
  }

  const filteredGifts = gifts.filter(gift => 
    gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet to Access Gifts</h1>
        <WalletButton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Gift Page</h1>
      <div className="flex justify-between mb-4">
        <div className="relative flex-grow mr-4">
          <Input 
            placeholder="Search Gifts" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleSendGift}>
          <Gift className="mr-2 h-4 w-4" /> Send Gift
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGifts.map((gift) => (
          <Card key={gift.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{gift.name}</h3>
              <p className="text-sm text-gray-600">{gift.description}</p>
              <Link href={`/gifts/${gift.id}`} passHref>
                <Button variant="link" className="mt-2 p-0">
                  View Details <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
