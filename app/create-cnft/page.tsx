'use client'

import React, { useState, useEffect } from 'react'
import { CreateCNFTForm } from '@/components/create/create-cnft-form'
import { WalletButton } from '@/components/ui/wallet-button'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HowItWorks } from '@/components/ui/nft/how-it-works'
import { ProgressCard } from '@/components/ui/nft/progress-card'
import { Features } from '@/components/ui/nft/features'
import { useRouter } from 'next/navigation'

export default function CreateCNFTPage() {
  const { connected, connecting } = useWallet()
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  const steps = ['Connect Wallet', 'Fill Details', 'Upload Image', 'Review', 'Create NFT']

  useEffect(() => {
    if (connected) {
      setProgress(20)
    } else {
      setProgress(0)
    }
  }, [connected])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/" passHref>
        <Button variant="ghost" className="mb-4 hover:bg-primary/10">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main
        </Button>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <Card className="bg-background shadow-lg border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create Your Compressed NFT
            </CardTitle>
            <CardDescription className="text-xl mt-2">
              Mint unique digital assets on Solana using the efficient Metaplex "Bubblegum" protocol
            </CardDescription>
          </CardHeader>
        </Card>

        <ProgressCard progress={progress} steps={steps} />
        <HowItWorks />
        <Features />

        <Card className="bg-background shadow-lg border-primary/10">
          <CardContent className="py-6">
            {connected ? (
              <CreateCNFTForm setProgress={setProgress} />
            ) : (
              <div className="text-center">
                <p className="mb-6 text-xl text-muted-foreground">
                  Please connect your wallet to create a compressed NFT.
                </p>
                <div className="flex justify-center">
                  <WalletButton />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <div className="h-24"></div>
    </div>
  )
}

