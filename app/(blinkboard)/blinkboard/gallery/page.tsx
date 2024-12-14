'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider'
import { WalletButton } from '@/components/WalletButton'

const mockNFTs = [
  { id: 1, name: 'My NFT #1', image: '/placeholder.svg?height=200&width=200' },
  { id: 2, name: 'My NFT #2', image: '/placeholder.svg?height=200&width=200' },
  { id: 3, name: 'My NFT #3', image: '/placeholder.svg?height=200&width=200' },
]

export default function Gallery() {
  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My NFT Gallery</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNFTs.map((nft) => (
            <Card key={nft.id}>
              <CardHeader>
                <CardTitle>{nft.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover mb-4" />
                <Button className="w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SolanaWalletProvider>
  )
}