'use client'

import React, { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"......
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, AlertCircle } from 'lucide-react'
import { ImageUpload } from './image-upload'
import { NFTPreview } from './nft-preview'
import { Slider } from "@/components/ui/slider"
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useConfirmTransaction } from '@/hooks/use-confirm-transaction'
import { mintCNFT } from '@/utils/nft/mint-cnft'


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
  const [isMinting, setIsMinting] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [collectionAddress, setCollectionAddress] = useState<string>('')
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  const { confirmTransaction, isConfirming } = useConfirmTransaction()

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
    const formData = { name, description, royaltyPercentage, collectionAddress }
    localStorage.setItem('cnftFormData', JSON.stringify(formData))

    // Update progress when form fields are filled
    const formProgress = 20 + (name ? 15 : 0) + (description ? 15 : 0) + (image ? 15 : 0) + (royaltyPercentage ? 15 : 0) + (collectionAddress ? 20 : 0);
    setProgress(Math.min(formProgress, 100));

    // Calculate estimated cost
    const price = 1 // Assuming a base price of 1 SOL
    const creationFee = price * (CREATION_FEE_PERCENTAGE / 100)
    const totalFee = creationFee + SOLANA_CREATION_FEE / LAMPORTS_PER_SOL
    setEstimatedCost(totalFee)
  }, [name, description, image, royaltyPercentage, collectionAddress, setProgress])

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
      // Check balance
      const balance = await connection.getBalance(publicKey)
      if (balance < estimatedCost * LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance to create CNFT")
      }

      // Create a transaction to send fees to the treasury
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: estimatedCost * LAMPORTS_PER_SOL
        })
      )

      // Confirm the transaction
      const signature = await confirmTransaction(transaction, publicKey, "CNFT Creation Fee")
      if (!signature) {
        throw new Error("Transaction was not confirmed")
      }

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
          signature, // Include the transaction signature
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

  const isValidSolanaAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleConfirmMint = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint the CNFT.",
        variant: "destructive",
      })
      return
    }

    if (collectionAddress && !isValidSolanaAddress(collectionAddress)) {
      toast({
        title: "Invalid Collection Address",
        description: "Please enter a valid Solana address for the collection.",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true)
    try {
      const mintResult = await mintCNFT({
        name,
        description,
        image,
        royaltyPercentage,
        creatorAddress: publicKey.toString(),
        recipientAddress: recipientAddress || publicKey.toString(), // Use connected wallet if no recipient specified
        collectionAddress: collectionAddress || null,
      })

      toast({
        title: "CNFT Minted Successfully",
        description: `Your CNFT has been minted with address: ${mintResult.mintAddress}`,
      })
      setProgress(100)
      // Reset form or navigate to a success page
    } catch (error) {
      console.error('Error minting CNFT:', error)
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint CNFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
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
        <Label htmlFor="recipientAddress">Recipient Address (optional)</Label>
        <Input
          id="recipientAddress"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter recipient's wallet address"
        />
        <p className="text-sm text-muted-foreground">Leave empty to mint to your connected wallet</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="collectionAddress">Collection Address (optional)</Label>
        <Input
          id="collectionAddress"
          value={collectionAddress}
          onChange={(e) => setCollectionAddress(e.target.value)}
          placeholder="Enter collection address"
        />
        <p className="text-sm text-muted-foreground">Leave empty if not part of a collection</p>
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
        disabled={isLoading || isConfirming || !name || !description || !image}
      >
        {isLoading || isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isConfirming ? 'Confirming...' : 'Creating...'}
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
            <p><strong>Recipient:</strong> {recipientAddress || 'Connected Wallet'}</p>
            <p><strong>Collection:</strong> {collectionAddress || 'Not part of a collection'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmMint} disabled={isLoading || isMinting}>
              {isMinting ? 'Minting...' : 'Confirm Mint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

