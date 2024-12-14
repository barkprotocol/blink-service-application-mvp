'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from 'lucide-react'
import { mintBlink } from '@/lib/programs/mint-blink'
import { useBlink } from '@/hooks/use-blink'
import { NFT_METADATA_API_URL } from '@/utils/constants'

export default function CreateBlinkPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey, wallet } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const { blink, updateBlink, resetBlink } = useBlink()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey || !wallet) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a Blink.",
        variant: "destructive",
      })
      return
    }

    if (!blink.text || !blink.bgColor || !blink.textColor) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Create metadata
      const metadataResponse = await fetch(NFT_METADATA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Blink: ${blink.text.slice(0, 20)}...`,
          description: blink.text,
          image: '', // We'll update this after minting
          attributes: [
            { trait_type: 'Font Size', value: blink.fontSize },
            { trait_type: 'Font Family', value: blink.fontFamily },
            { trait_type: 'Background Color', value: blink.bgColor },
            { trait_type: 'Text Color', value: blink.textColor },
            { trait_type: 'Animated', value: blink.isAnimated },
          ],
          solanaAddress: publicKey.toBase58(),
        }),
      })

      if (!metadataResponse.ok) {
        throw new Error('Failed to create NFT metadata')
      }

      const metadata = await metadataResponse.json()

      // Mint the Blink
      const result = await mintBlink(wallet, blink)

      // Update the metadata with the minted NFT's image URL
      await fetch(`${NFT_METADATA_API_URL}/${result.nftAddress}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: result.metadataUri,
        }),
      })

      toast({
        title: "Blink Created",
        description: `Your Blink has been created successfully! NFT address: ${result.nftAddress}`,
      })
      router.push(`/blinks/${result.nftAddress}`)
    } catch (error) {
      console.error('Error creating Blink:', error)
      toast({
        title: "Error",
        description: "Failed to create Blink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          updateBlink({ bgImage: event.target.result as string })
        }
      }
      reader.readAsDataURL(file)
    }
  }, [updateBlink])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create a New Blink</CardTitle>
          <CardDescription>Mint a unique digital asset on the Solana blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">Blink Text</Label>
              <Input
                id="text"
                value={blink.text}
                onChange={(e) => updateBlink({ text: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={blink.fontSize}
                onChange={(e) => updateBlink({ fontSize: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select value={blink.fontFamily} onValueChange={(value) => updateBlink({ fontFamily: value })}>
                <SelectTrigger id="fontFamily">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <Input
                id="bgColor"
                type="color"
                value={blink.bgColor}
                onChange={(e) => updateBlink({ bgColor: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Input
                id="textColor"
                type="color"
                value={blink.textColor}
                onChange={(e) => updateBlink({ textColor: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="animated"
                checked={blink.isAnimated}
                onCheckedChange={(checked) => updateBlink({ isAnimated: checked })}
              />
              <Label htmlFor="animated">Animated</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bgImage">Background Image (optional)</Label>
              <Input
                id="bgImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memo">Memo (optional)</Label>
              <Textarea
                id="memo"
                value={blink.memo}
                onChange={(e) => updateBlink({ memo: e.target.value })}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            onClick={handleCreate}
            disabled={isLoading || !connected}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create Blink
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}