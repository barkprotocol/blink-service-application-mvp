'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SolanaWalletProvider } from '@/components/providers/solana-wallet-provider'
import { WalletButton } from '@/components/ui/wallet-button'

export default function MintNFT() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implement minting logic here
    console.log('Minting NFT:', { name, description, image })
    alert('NFT minted successfully!')
    router.push('/nft/gallery')
  }

  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Mint New NFT</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMint} className="space-y-4">
              <div>
                <Label htmlFor="name">NFT Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="image">Upload Image</Label>
                <Input id="image" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} required />
              </div>
              <Button type="submit">Mint NFT</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SolanaWalletProvider>
  )
}