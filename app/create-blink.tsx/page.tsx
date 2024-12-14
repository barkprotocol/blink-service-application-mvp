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
import { Loader2, Upload, ArrowLeft, ImageIcon, X, LinkIcon, Gift, CreditCard, Share2, Send, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

export default function CreateBlinkPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('standard')
  const [purpose, setPurpose] = useState('gift')
  const [isTransferable, setIsTransferable] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const router = useRouter()

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or GIF image.",
          variant: "destructive",
        })
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [toast])

  const handleRemoveImage = useCallback(() => {
    setImage(null)
    setImagePreview(null)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a Blink.",
        variant: "destructive",
      })
      return
    }

    if (!name || !description || !image || !purpose || (purpose === 'payment' && !amount)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('type', type)
      formData.append('purpose', purpose)
      formData.append('isTransferable', isTransferable.toString())
      formData.append('image', image)
      formData.append('owner', publicKey.toBase58())
      if (amount) formData.append('amount', amount)
      if (recipient) formData.append('recipient', recipient)

      const response = await fetch('/api/v1/blinks', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create Blink')
      }

      const data = await response.json()
      setGeneratedLink(`https://app.barkprotocol.net/blinks/${data.id}`)
      toast({
        title: "Blink Created",
        description: `Your Blink "${name}" has been created successfully!`,
      })
    } catch (error) {
      console.error('Error creating Blink:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create Blink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    toast({
      title: "Link Copied",
      description: "The Blink link has been copied to your clipboard.",
    })
  }

  const shareToPlatform = (platform: string) => {
    let url = ''
    switch (platform) {
      case 'x':
        url = `https://x.com/intent/tweet?text=Check%20out%20my%20new%20Blink!&url=${encodeURIComponent(generatedLink)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=Check%20out%20my%20new%20Blink!`
        break
      case 'discord':
        // Discord doesn't have a direct share URL, so we'll copy the message to clipboard
        navigator.clipboard.writeText(`Check out my new Blink! ${generatedLink}`)
        toast({
          title: "Copied to Clipboard",
          description: "Message copied. Paste it in your Discord chat.",
        })
        return
    }
    if (url) window.open(url, '_blank')
  }

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
      >
        <Card className="bg-background shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Create a New Blink</CardTitle>
            <CardDescription>Create a versatile link for gifts, NFTs, payments, or Blinks on Solana</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Blink Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter a unique name for your Blink"
                    aria-describedby="name-description"
                  />
                  <p id="name-description" className="text-sm text-muted-foreground">
                    Choose a unique and descriptive name for your Blink.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Describe your Blink in detail"
                    rows={4}
                    aria-describedby="description-info"
                  />
                  <p id="description-info" className="text-sm text-muted-foreground">
                    Provide a detailed description of your Blink. This will be visible to recipients.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Blink Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="Select Blink purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="blink">Create Blink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {purpose === 'payment' && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      placeholder="Enter payment amount"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient (Optional)</Label>
                  <Input
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter recipient's address or username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Blink Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select Blink type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="limited">Limited Edition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="transferable"
                    checked={isTransferable}
                    onCheckedChange={setIsTransferable}
                  />
                  <Label htmlFor="transferable">Transferable</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Blink Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative aspect-square w-full max-w-sm mx-auto">
                        <Image
                          src={imagePreview}
                          alt="Blink preview"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }}
                          className="rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Label htmlFor="image" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center h-64 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                          <span className="text-sm text-muted-foreground">Click to upload image (max 5MB)</span>
                        </div>
                        <Input
                          id="image"
                          type="file"
                          onChange={handleImageChange}
                          accept={ALLOWED_FILE_TYPES.join(',')}
                          className="hidden"
                          aria-describedby="image-info"
                        />
                      </Label>
                    )}
                  </div>
                  <p id="image-info" className="text-sm text-muted-foreground">
                    Upload a JPEG, PNG, or GIF image (max 5MB) that represents your Blink.
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to create a Blink.</p>
                <WalletButton />
              </div>
            )}
          </CardContent>
          {connected && (
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                onClick={handleCreate}
                disabled={isLoading || !name || !description || !image}
                aria-label={isLoading ? "Creating Blink..." : "Create Blink"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Create Blink Link
                  </>
                )}
              </Button>
              {generatedLink && (
                <div className="w-full space-y-4">
                  <Input value={generatedLink} readOnly />
                  <div className="flex flex-wrap justify-between gap-2">
                    <Button onClick={copyToClipboard}>
                      Copy Link
                    </Button>
                    <Button onClick={() => shareToPlatform('x')}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share on X
                    </Button>
                    <Button onClick={() => shareToPlatform('facebook')}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share on Facebook
                    </Button>
                    <Button onClick={() => shareToPlatform('telegram')}>
                      <Send className="mr-2 h-4 w-4" />
                      Share on Telegram
                    </Button>
                    <Button onClick={() => shareToPlatform('discord')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Copy for Discord
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

