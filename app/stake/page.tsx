'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, LockIcon, UnlockIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'
import { Progress } from "@/components/ui/progress"

export default function StakePage() {
  const [stakedAmount, setStakedAmount] = useState(0)
  const [availableAmount, setAvailableAmount] = useState(1000) // Example initial balance
  const [rewardAmount, setRewardAmount] = useState(0)
  const [stakeInput, setStakeInput] = useState('')
  const [unstakeInput, setUnstakeInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    if (connected && publicKey) {
      // In a real application, you would fetch the actual staked amount, available balance, and rewards from your backend or blockchain
      // For this example, we'll use mock data
      setStakedAmount(500)
      setAvailableAmount(1000)
      setRewardAmount(50)
    }
  }, [connected, publicKey])

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake BARK tokens.",
        variant: "destructive",
      })
      return
    }

    const amount = parseFloat(stakeInput)
    if (isNaN(amount) || amount <= 0 || amount > availableAmount) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stake.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this stake request to your backend or directly to the blockchain
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating API call
      setStakedAmount(stakedAmount + amount)
      setAvailableAmount(availableAmount - amount)
      setStakeInput('')
      toast({
        title: "Stake Successful",
        description: `Successfully staked ${amount} BARK tokens.`,
      })
    } catch (error) {
      console.error('Error staking:', error)
      toast({
        title: "Error",
        description: "Failed to stake tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to unstake BARK tokens.",
        variant: "destructive",
      })
      return
    }

    const amount = parseFloat(unstakeInput)
    if (isNaN(amount) || amount <= 0 || amount > stakedAmount) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to unstake.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this unstake request to your backend or directly to the blockchain
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating API call
      setStakedAmount(stakedAmount - amount)
      setAvailableAmount(availableAmount + amount)
      setUnstakeInput('')
      toast({
        title: "Unstake Successful",
        description: `Successfully unstaked ${amount} BARK tokens.`,
      })
    } catch (error) {
      console.error('Error unstaking:', error)
      toast({
        title: "Error",
        description: "Failed to unstake tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim rewards.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this claim request to your backend or directly to the blockchain
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating API call
      setAvailableAmount(availableAmount + rewardAmount)
      setRewardAmount(0)
      toast({
        title: "Rewards Claimed",
        description: `Successfully claimed ${rewardAmount} BARK tokens.`,
      })
    } catch (error) {
      console.error('Error claiming rewards:', error)
      toast({
        title: "Error",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" passHref>
            <Button variant="ghost" className="mb-6 hover:bg-primary/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main
            </Button>
          </Link>
          <Card className="bg-white shadow-lg border-none">
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <LockIcon className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold mb-2">BARK Token Staking</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Stake your BARK tokens to earn rewards and participate in the BARK Blink ecosystem governance.
              </CardDescription>
            </CardHeader>
            {!connected && (
              <CardContent className="flex justify-center pt-6">
                <WalletButton />
              </CardContent>
            )}
          </Card>
        </motion.div>

        {connected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white shadow-lg border-none h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Stake BARK Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStake} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stakeAmount">Amount to Stake</Label>
                      <Input
                        id="stakeAmount"
                        type="number"
                        placeholder="Enter amount to stake"
                        value={stakeInput}
                        onChange={(e) => setStakeInput(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Staking...
                        </>
                      ) : (
                        <>
                          <LockIcon className="mr-2 h-4 w-4" />
                          Stake BARK
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Available to stake: {availableAmount.toFixed(2)} BARK
                  </p>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white shadow-lg border-none h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Unstake BARK Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUnstake} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
                      <Input
                        id="unstakeAmount"
                        type="number"
                        placeholder="Enter amount to unstake"
                        value={unstakeInput}
                        onChange={(e) => setUnstakeInput(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unstaking...
                        </>
                      ) : (
                        <>
                          <UnlockIcon className="mr-2 h-4 w-4" />
                          Unstake BARK
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Currently staked: {stakedAmount.toFixed(2)} BARK
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}

        {connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-white shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Staking Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Total Staked</h3>
                  <Progress value={(stakedAmount / (stakedAmount + availableAmount)) * 100} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {stakedAmount.toFixed(2)} / {(stakedAmount + availableAmount).toFixed(2)} BARK
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Rewards Earned</h3>
                  <p className="text-3xl font-bold">{rewardAmount.toFixed(2)} BARK</p>
                  <Button onClick={handleClaimRewards} className="mt-4" disabled={isLoading || rewardAmount === 0}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <TrendingUpIcon className="mr-2 h-4 w-4" />
                        Claim Rewards
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}