'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, AlertCircle } from 'lucide-react'
import { ImageUpload } from './image-upload'
import { NFTPreview } from './nft-preview'
import { Slider } from "@/components/ui/slider"
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

let TREASURY_WALLET: PublicKey | null = null
try {
  TREASURY_WALLET = new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || '')
} catch (error) {
  console.error('Invalid treasury wallet address:', error)
}

const CREATION_FEE_PERCENTAGE = 2
const SOLANA_CREATION_FEE = 0.00001 * LAMPORTS_PER_SOL // Adjust this value based on current Solana fees

interface CreateCNFTFormProps {
  setProgress: (progress: number) => void
}

export function CreateCNFTForm({ setProgress }: CreateCNFTFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { publicKey, signTransaction } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    // Load saved form data from local storage
    const savedFormData = localStorage.getItem('cnftFormData')
    if (savedFormData) {
      const { name, description, royaltyPercentage } = JSON.parse(savedFormData)
      setName(name)
      setDescription(description)
      setRoyaltyPercentage(royaltyPercentage)
    }
  }, [])

  useEffect(() => {
    // Save form data to local storage
    const formData = { name, description, royaltyPercentage }
    localStorage.setItem('cnftFormData', JSON.stringify(formData))

    // Update progress when form fields are filled
    const formProgress = 20 + (name ? 15 : 0) + (description ? 15 : 0) + (image ? 15 : 0) + (royaltyPercentage ? 15 : 0)
    setProgress(formProgress)

    // Calculate estimated cost
    const price = 1 // Assuming a base price of 1 SOL
    const creationFee = price * (CREATION_FEE_PERCENTAGE / 100)
    const totalFee = creationFee + SOLANA_CREATION_FEE / LAMPORTS_PER_SOL
    setEstimatedCost(totalFee)
  }, [name, description, image, royaltyPercentage, setProgress])

  const handleCreateCNFT = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a compressed NFT.",
        variant: "destructive",
      })
      return
    }

    if (!TREASURY_WALLET) {
      toast({
        title: "Configuration Error",
        description: "Treasury wallet is not properly configured. Please contact support.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Create a transaction to send fees to the treasury
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: estimatedCost * LAMPORTS_PER_SOL
        })
      )

      // Sign and send the transaction
      const signedTransaction = await signTransaction(transaction)
      // In a real-world scenario, you would send this transaction to the network
      // For this example, we'll just log it
      console.log('Signed transaction:', signedTransaction)

      // Call API to create CNFT
      const response = await fetch('/api/v1/cnft/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          image,
          royaltyPercentage,
          creatorAddress: publicKey.toString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create CNFT')
      }

      const cnftData = await response.json()

      toast({
        title: "Compressed NFT Created",
        description: `Successfully created compressed NFT: ${cnftData.name}`,
      })
      setName('')
      setDescription('')
      setImage(null)
      setRoyaltyPercentage(5)
      setProgress(100) // Set progress to 100% when CNFT is created
      localStorage.removeItem('cnftFormData') // Clear saved form data
    } catch (error) {
      console.error('Error creating compressed NFT:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create compressed NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmDialog(true)
  }

  if (!TREASURY_WALLET) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          Treasury wallet address is not set or is invalid. Please contact the administrator.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">NFT Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter NFT name"
          required
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter NFT description"
          required
          maxLength={1000}
        />
      </div>
      <ImageUpload onImageUpload={setImage} />
      {image && <NFTPreview name={name} description={description} image={image} royaltyPercentage={royaltyPercentage} />}
      <div className="space-y-2">
        <Label htmlFor="royalty">Royalty Percentage</Label>
        <Slider
          id="royalty"
          min={0}
          max={10}
          step={0.5}
          value={[royaltyPercentage]}
          onValueChange={(value) => setRoyaltyPercentage(value[0])}
        />
        <p className="text-sm text-muted-foreground">Current royalty: {royaltyPercentage}%</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Estimated Cost: {estimatedCost.toFixed(5)} SOL
        </p>
        <p className="text-sm text-muted-foreground">
          (Creation Fee: {CREATION_FEE_PERCENTAGE}% + {(SOLANA_CREATION_FEE / LAMPORTS_PER_SOL).toFixed(5)} SOL Solana network fee)
        </p>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !name || !description || !image}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Create Compressed NFT
          </>
        )}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm CNFT Creation</DialogTitle>
            <DialogDescription>
              Are you sure you want to create this Compressed NFT? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Royalty:</strong> {royaltyPercentage}%</p>
            <p><strong>Estimated Cost:</strong> {estimatedCost.toFixed(5)} SOL</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCNFT} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

