'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js'
import { FaInfoCircle, FaCopy, FaTwitter, FaPlus } from 'react-icons/fa'
import { WalletButton } from '@/components/ui/wallet-button'
import Preview from "@/components/preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const TokenPage: React.FC = () => {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { toast } = useToast()

  const [formState, setFormState] = useState({
    icon: 'https://raw.githubusercontent.com/barkprotocol/blink-as-a-service-dapp/main/app/public/icons/solana.png',
    label: '',
    percentage: 0,
    takeCommission: 'no',
    description: '',
    title: 'Your Title : )',
    mint: '',
  })

  const [uiState, setUiState] = useState({
    showPreview: true,
    loading: false,
    loadingText: 'Please Wait!',
    showForm: true,
    blinkLink: '',
    copied: false,
  })

  useEffect(() => {
    setUiState(prev => ({ ...prev, showPreview: true }))
  }, [formState.mint])

  useEffect(() => {
    if (formState.takeCommission === "no") {
      setFormState(prev => ({ ...prev, percentage: 0 }))
    }
  }, [formState.takeCommission])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormState(prev => ({ ...prev, takeCommission: value }))
  }

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(1, parseFloat(e.target.value) || 0)
    setFormState(prev => ({ ...prev, percentage: value }))
  }

  const validateForm = (): boolean => {
    if (!formState.label || !formState.description || !formState.mint) {
      toast({
        title: "Incomplete form",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) return

    setUiState(prev => ({ ...prev, loading: true, loadingText: 'Waiting for Transaction confirmation!' }))

    try {
      const connection = new Connection('https://stylish-dawn-film.solana-mainnet.quiknode.pro/e38b1fd65cb81a95ae5f3a2404b2e48ee6b0d458', 'confirmed')

      const recipientPubKey = new PublicKey("gEb7nD9yLkau1P4uyMdke9byJNrat61suH4vYiPUuiR")
      const amount = 0.01 * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: amount,
        })
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      console.log('Transaction sent:', signature)

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      })

      console.log('Transaction confirmed:', confirmation)

      const response = await fetch('/api/actions/generate-blink/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: formState.label,
          description: formState.description,
          wallet: publicKey.toString(),
          mint: formState.mint,
          commission: formState.takeCommission,
          percentage: formState.percentage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate blink')
      }

      const data = await response.json()
      setUiState(prev => ({ ...prev, blinkLink: data.blinkLink, showForm: false }))

      toast({
        title: "Blink Generated",
        description: "Your Blink has been successfully created!",
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: "There was an issue generating your blink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUiState(prev => ({ ...prev, loading: false }))
    }
  }

  const handlePreview = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) return

    setUiState(prev => ({ ...prev, loading: true, loadingText: 'Generating Blink Preview!' }))

    try {
      const response = await fetch('/api/actions/generate-blink/token?mint=' + formState.mint)

      if (!response.ok) {
        throw new Error('Failed to generate blink')
      }

      const data = await response.json()
      setFormState(prev => ({ ...prev, icon: data.icon, title: data.title }))
      setUiState(prev => ({ ...prev, showPreview: false }))
    } catch (err) {
      console.error(err)
      toast({
        title: "Invalid Mint Address",
        description: "Please check the mint address and try again",
        variant: "destructive",
      })
    } finally {
      setUiState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://dial.to/?action=solana-action:${uiState.blinkLink}`)
    setUiState(prev => ({ ...prev, copied: true }))
    setTimeout(() => setUiState(prev => ({ ...prev, copied: false })), 2000)
    toast({
      title: "Copied",
      description: "Blink link copied to clipboard",
    })
  }

  const handleTweet = () => {
    const tweetText = `Check out this Blink I just made @getblinkdotfun: https://dial.to/?action=solana-action:${uiState.blinkLink}`
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(twitterUrl, '_blank')
  }

  const handleNew = () => {
    setUiState(prev => ({ ...prev, showForm: true, blinkLink: '' }))
    setFormState({
      icon: 'https://raw.githubusercontent.com/barkprotocol/blink-as-a-service-dapp/main/app/public/icons/solana.png',
      label: '',
      percentage: 0,
      takeCommission: 'no',
      description: '',
      title: 'Your Title : )',
      mint: '',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatePresence>
        {uiState.loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <Loader2 className="animate-spin h-10 w-10 mb-4 mx-auto text-primary" />
              <p className="text-lg font-semibold">{uiState.loadingText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Customize Your Blink</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uiState.showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="mint">Mint Address</Label>
                  <Input
                    id="mint"
                    name="mint"
                    value={formState.mint}
                    onChange={handleInputChange}
                    placeholder="Enter mint address"
                    maxLength={45}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    name="label"
                    value={formState.label}
                    onChange={handleInputChange}
                    placeholder="Enter label"
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Take commission</Label>
                  <RadioGroup value={formState.takeCommission} onValueChange={handleRadioChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="commission-yes" />
                      <Label htmlFor="commission-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="commission-no" />
                      <Label htmlFor="commission-no">No</Label>
                    </div>
                  </RadioGroup>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0"
                    onClick={() => {
                      toast({
                        title: "Commission Info",
                        description: "If you opt to take a commission, the specified percentage of the total transaction amount will be credited to your wallet. Please note that the maximum commission percentage allowed is 1%.",
                      })
                    }}
                  >
                    <FaInfoCircle className="h-4 w-4" />
                    <span className="sr-only">Commission Information</span>
                  </Button>
                </div>
                {formState.takeCommission === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Commission Percentage</Label>
                    <Input
                      id="percentage"
                      name="percentage"
                      type="number"
                      value={formState.percentage}
                      onChange={handlePercentageChange}
                      placeholder="Enter commission percentage"
                      max={1}
                      min={0}
                      step={0.01}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formState.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    rows={3}
                    maxLength={143}
                  />
                </div>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {uiState.showForm && publicKey ? (
              <Button 
                onClick={uiState.showPreview ? handlePreview : handleSubmit} 
                disabled={!connected}
                className="w-full md:w-auto"
              >
                {uiState.showPreview ? 'Preview Blink' : 'Generate Blink'}
              </Button>
            ) : (
              uiState.showForm && <WalletButton />
            )}
          </CardFooter>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Blink Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Preview
              icon={formState.icon}
              label={formState.label || 'Your Label'}
              description={formState.description || 'Your Description shows up here, Keep it short and simple'}
              title={formState.title}
            />
          </CardContent>
        </Card>
      </div>
      <AnimatePresence>
        {uiState.blinkLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Your Blink Link</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 break-all">
                  <a 
                    href={`https://dial.to/?action=solana-action:${uiState.blinkLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline"
                  >
                    https://dial.to/?action=solana-action:{uiState.blinkLink}
                  </a>
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleCopy} className="flex items-center space-x-2">
                    <FaCopy />
                    <span>{uiState.copied ? 'Copied!' : 

 'Copy'}</span>
                  </Button>
                  <Button onClick={handleTweet} className="flex items-center space-x-2">
                    <FaTwitter />
                    <span>Tweet</span>
                  </Button>
                  {!uiState.showForm && (
                    <Button onClick={handleNew} className="flex items-center space-x-2">
                      <FaPlus />
                      <span>Create New</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TokenPage