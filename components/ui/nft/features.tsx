import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet, FileText, Image, Eye, Zap, Sparkles } from 'lucide-react'

export function Features() {
  const features = [
    { icon: Wallet, text: "Easy Solana wallet connection", description: "Connect your Solana wallet with just a few clicks" },
    { icon: FileText, text: "Simple NFT details input", description: "Easily input and manage your NFT metadata" },
    { icon: Image, text: "Seamless image upload", description: "Upload and preview your NFT images effortlessly" },
    { icon: Eye, text: "Instant NFT preview", description: "See how your NFT will look in real-time" },
    { icon: Zap, text: "Quick minting with Metaplex protocol", description: "Mint your NFTs quickly using the Metaplex protocol" },
    { icon: Sparkles, text: "Create Blinks for versatile digital assets", description: "Design and mint versatile Blink digital assets" },
  ]

  return (
    <Card className="bg-background shadow-lg border-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Features</CardTitle>
        <CardDescription className="text-lg mt-2">
          Discover the powerful features that make creating NFTs a breeze
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 p-4 bg-secondary rounded-lg transition-all duration-300 hover:bg-primary/10 hover:text-primary text-center">
              <feature.icon className="h-10 w-10 text-primary mb-2" />
              <span className="text-lg font-semibold">{feature.text}</span>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

