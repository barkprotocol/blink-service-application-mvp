import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet, Upload, Cog, Sparkles } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: Wallet,
      title: "Connect & Prepare",
      description: "Link your Solana wallet and prepare your NFT's metadata, including name, description, and attributes.",
    },
    {
      icon: Upload,
      title: "Upload Assets",
      description: "Upload your digital asset (image, video, or audio) to Arweave for permanent, decentralized storage.",
    },
    {
      icon: Cog,
      title: "Configure Minting",
      description: "Choose between standard NFT or compressed NFT (cNFT). Set royalties and other minting options.",
    },
    {
      icon: Sparkles,
      title: "Mint & Receive",
      description: "Review details, sign the transaction, and receive your newly minted NFT in your connected wallet.",
    },
  ]

  return (
    <div className="space-y-6 my-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <CardDescription className="text-xl max-w-2xl mx-auto">
          Follow these simple steps to create and mint your own NFT on the Solana blockchain
        </CardDescription>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <Card 
            key={index} 
            className="bg-background shadow-lg border-primary/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

