'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey } from '@metaplex-foundation/umi'
import { getAssetWithProof, verifyCreator, unverifyCreator } from '@metaplex-foundation/mpl-bubblegum'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { WalletButton } from '@/components/ui/wallet-button'

export default function VerifyCreatorPage() {
  const [assetId, setAssetId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey, signTransaction, signMessage } = useWallet()
  const { toast } = useToast()

  const handleVerifyCreator = async (verify: boolean) => {
    if (!connected || !publicKey || !signTransaction || !signMessage) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to verify or unverify a creator.",
        variant: "destructive",
      })
      return
    }

    if (!assetId) {
      toast({
        title: "Missing Asset ID",
        description: "Please enter the Asset ID of the Compressed NFT.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const umi = createUmi('https://api.mainnet-beta.solana.com')
        .use({
          install(umi) {
            return {
              signTransaction: signTransaction,
              signMessage: signMessage,
            }
          },
        })

      const assetWithProof = await getAssetWithProof(umi, publicKey(assetId), { truncateCanopy: true })
      
      if (verify) {
        await verifyCreator(umi, { ...assetWithProof, creator: umi.identity.publicKey }).sendAndConfirm(umi)
        toast({
          title: "Creator Verified",
          description: `Successfully verified creator for Asset ID: ${assetId}`,
        })
      } else {
        await unverifyCreator(umi, { ...assetWithProof, creator: umi.identity.publicKey }).sendAndConfirm(umi)
        toast({
          title: "Creator Unverified",
          description: `Successfully unverified creator for Asset ID: ${assetId}`,
        })
      }
    } catch (error) {
      console.error('Error verifying/unverifying creator:', error)
      toast({
        title: "Error",
        description: `Failed to ${verify ? 'verify' : 'unverify'} creator. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Verify/Unverify Creator</CardTitle>
          <CardDescription>
            Verify or unverify a creator for a Compressed NFT using the Bubblegum protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assetId">Compressed NFT Asset ID</Label>
                <Input
                  id="assetId"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  placeholder="Enter Asset ID"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleVerifyCreator(true)}
                  disabled={isLoading || !assetId}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Verify Creator
                </Button>
                <Button
                  onClick={() => handleVerifyCreator(false)}
                  disabled={isLoading || !assetId}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Unverify Creator
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to verify or unverify a creator.</p>
              <WalletButton />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

