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
import { Loader2, Upload, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ConnectWalletButton } from '@/components/ui/connect-wallet-button'
import { motion } from 'framer-motion'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

export default function CreateNFTPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('standard')
  const [isTransferable, setIsTransferable] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
        description: "Please connect your wallet to create an NFT.",
        variant: "destructive",
      })
      return
    }

    if (!name || !description || !image) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and upload an image.",
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
      formData.append('isTransferable', isTransferable.toString())
      formData.append('image', image)
      formData.append('owner', publicKey.toBase58())

      const response = await fetch('/api/v1/nfts', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create NFT')
      }

      const data = await response.json()
      toast({
        title: "NFT Created",
        description: `Your NFT "${name}" has been created successfully!`,
      })
      router.push(`/nfts/${data.id}`)
    } catch (error) {
      console.error('Error creating NFT:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Create a New NFT</CardTitle>
            <CardDescription>Mint a unique digital asset on the Solana blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">NFT Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter a unique name for your NFT"
                    aria-describedby="name-description"
                  />
                  <p id="name-description" className="text-sm text-muted-foreground">
                    Choose a unique and descriptive name for your NFT.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Describe your NFT in detail"
                    rows={4}
                    aria-describedby="description-info"
                  />
                  <p id="description-info" className="text-sm text-muted-foreground">
                    Provide a detailed description of your NFT. This will be visible to potential buyers.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">NFT Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select NFT type" />
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
                  <Label htmlFor="image">NFT Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative aspect-square w-full max-w-sm mx-auto">
                        <Image
                          src={imagePreview}
                          alt="NFT preview"
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
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Upload className="h-12 w-12 text-gray-400 mb-4" />
                          <span className="text-sm text-gray-500">Click to upload image (max 5MB)</span>
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
                    Upload a JPEG, PNG, or GIF image (max 5MB) that represents your NFT.
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to create an NFT.</p>
                <ConnectWalletButton />
              </div>
            )}
          </CardContent>
          {connected && (
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                onClick={handleCreate}
                disabled={isLoading || !name || !description || !image}
                aria-label={isLoading ? "Creating NFT..." : "Create NFT"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create NFT
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

