'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import * as token from '@solana/spl-token'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { SolanaWalletProvider } from '@/components/providers/solana-wallet-provider'
import { WalletButton } from '@/components/ui/wallet-button'
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from 'lucide-react'

//Addresses for Solana staking program and BARK token (BARK)
const STAKING_PROGRAM_ID = new PublicKey('StakingProgramAddressHere')
const BARK_TOKEN_MINT = new PublicKey('2NTvEssJ2i998V2cMGT4Fy3JhyFnAzHFonDo9dbAkVrg')

export default function Staking() {
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [stakedBalance, setStakedBalance] = useState<number | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (publicKey) {
      fetchBalances()
    }
  }, [publicKey, connection])

  const fetchBalances = async () => {
    if (!publicKey) return

    try {
      // Fetch staked balance
      const stakedAccount = await token.getAssociatedTokenAddress(
        BARK_TOKEN_MINT,
        STAKING_PROGRAM_ID,
        true
      )
      const stakedAccountInfo = await connection.getTokenAccountBalance(stakedAccount)
      setStakedBalance(Number(stakedAccountInfo.value.uiAmount))

      // Fetch wallet balance
      const walletAccount = await token.getAssociatedTokenAddress(
        BARK_TOKEN_MINT,
        publicKey
      )
      const walletAccountInfo = await connection.getTokenAccountBalance(walletAccount)
      setWalletBalance(Number(walletAccountInfo.value.uiAmount))
    } catch (err) {
      console.error('Error fetching balances:', err)
      setError('Failed to fetch balances. Please try again.')
    }
  }

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake tokens.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const amount = parseFloat(stakeAmount) * Math.pow(10, 9) // Assuming 9 decimals for BARK token

      // Create stake instruction
      const stakeInstruction = await token.createTransferInstruction(
        await token.getAssociatedTokenAddress(BARK_TOKEN_MINT, publicKey),
        await token.getAssociatedTokenAddress(BARK_TOKEN_MINT, STAKING_PROGRAM_ID, true),
        publicKey,
        amount
      )

      const transaction = new Transaction().add(stakeInstruction)
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(signature, 'confirmed')

      toast({
        title: "Staking successful",
        description: `You have staked ${stakeAmount} BARK tokens.`,
      })

      setStakeAmount('')
      fetchBalances()
    } catch (err) {
      console.error('Error staking:', err)
      setError('Failed to stake tokens. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to unstake tokens.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const amount = parseFloat(unstakeAmount) * Math.pow(10, 9) // Assuming 9 decimals for BARK token

      // Create unstake instruction
      const unstakeInstruction = await token.createTransferInstruction(
        await token.getAssociatedTokenAddress(BARK_TOKEN_MINT, STAKING_PROGRAM_ID, true),
        await token.getAssociatedTokenAddress(BARK_TOKEN_MINT, publicKey),
        STAKING_PROGRAM_ID,
        amount
      )

      const transaction = new Transaction().add(unstakeInstruction)
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(signature, 'confirmed')

      toast({
        title: "Unstaking successful",
        description: `You have unstaked ${unstakeAmount} BARK tokens.`,
      })

      setUnstakeAmount('')
      fetchBalances()
    } catch (err) {
      console.error('Error unstaking:', err)
      setError('Failed to unstake tokens. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Staking</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stake BARK</CardTitle>
              <CardDescription>Stake your BARK tokens to earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStake} className="space-y-4">
                <div>
                  <Label htmlFor="stakeAmount">Amount to Stake</Label>
                  <Input 
                    id="stakeAmount" 
                    type="number" 
                    value={stakeAmount} 
                    onChange={(e) => setStakeAmount(e.target.value)} 
                    required 
                    min="0"
                    step="0.000000001"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Stake'}
                </Button>
              </form>
              {walletBalance !== null ? (
                <p className="mt-2 text-sm text-gray-600">Available balance: {walletBalance.toFixed(9)} BARK</p>
              ) : (
                <Skeleton className="h-4 w-32 mt-2" />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Unstake BARK</CardTitle>
              <CardDescription>Withdraw your staked BARK tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUnstake} className="space-y-4">
                <div>
                  <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
                  <Input 
                    id="unstakeAmount" 
                    type="number" 
                    value={unstakeAmount} 
                    onChange={(e) => setUnstakeAmount(e.target.value)} 
                    required 
                    min="0"
                    step="0.000000001"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Unstake'}
                </Button>
              </form>
              {stakedBalance !== null ? (
                <p className="mt-2 text-sm text-gray-600">Staked balance: {stakedBalance.toFixed(9)} BARK</p>
              ) : (
                <Skeleton className="h-4 w-32 mt-2" />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 flex justify-center">
          <WalletButton />
        </div>
      </div>
    </SolanaWalletProvider>
  )
}