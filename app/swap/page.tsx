'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Jupiter, RouteInfo } from '@jup-ag/core'
import { TOKEN_LIST_URL } from '@jup-ag/core'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowDown, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

const BARK_TOKEN: Token = {
  address: '2NTvEssJ2i998V2cMGT4Fy3JhyFnAzHFonDo9dbAkVrg',
  symbol: 'BARK',
  name: 'BARK',
  decimals: 9,
  logoURI: 'https://ucarecdn.com/8aa0180d-1112-4aea-8210-55b266c3fb44/bark.png',
}

export default function SwapPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [fromToken, setFromToken] = useState<string>('')
  const [toToken, setToToken] = useState<string>('')
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  const router = useRouter()

  const jupiter = useMemo(() => {
    if (!connection || !publicKey) return null
    return Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
      user: publicKey,
    })
  }, [connection, publicKey])

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(TOKEN_LIST_URL['mainnet-beta'])
        const tokenList: Token[] = await response.json()
        
        // Add BARK token to the list
        const updatedTokenList = [BARK_TOKEN, ...tokenList]
        
        // Ensure SOL and USDC are at the top of the list
        const sortedTokens = updatedTokenList.sort((a, b) => {
          if (a.symbol === 'SOL') return -1
          if (b.symbol === 'SOL') return 1
          if (a.symbol === 'USDC') return -1
          if (b.symbol === 'USDC') return 1
          return 0
        })

        setTokens(sortedTokens)
        
        // Set default tokens
        setFromToken(sortedTokens.find(t => t.symbol === 'SOL')!.address)
        setToToken(sortedTokens.find(t => t.symbol === 'USDC')!.address)
      } catch (error) {
        console.error('Error fetching token list:', error)
        toast({
          title: "Error",
          description: "Failed to fetch token list. Please try again.",
          variant: "destructive",
        })
      }
    }
    fetchTokens()
  }, [])

  useEffect(() => {
    if (fromAmount && fromToken && toToken && jupiter) {
      fetchRoutes()
    }
  }, [fromAmount, fromToken, toToken, jupiter])

  const fetchRoutes = async () => {
    if (!jupiter) return
    setIsLoading(true)
    try {
      const routesResponse = await jupiter.computeRoutes({
        inputMint: new PublicKey(fromToken),
        outputMint: new PublicKey(toToken),
        amount: parseFloat(fromAmount) * (10 ** tokens.find(t => t.address === fromToken)!.decimals),
        slippageBps: 50,
      })
      setRoutes(routesResponse.routesInfos)
      if (routesResponse.routesInfos.length > 0) {
        setToAmount((routesResponse.routesInfos[0].outAmount / (10 ** tokens.find(t => t.address === toToken)!.decimals)).toFixed(6))
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch swap routes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!connected || !publicKey || !jupiter || routes.length === 0) {
      toast({
        title: "Error",
        description: "Please connect your wallet and ensure routes are available.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { transactions } = await jupiter.exchange({
        routeInfo: routes[0],
      })

      const { setupTransaction, swapTransaction, cleanupTransaction } = transactions

      if (setupTransaction) {
        const signedSetupTransaction = await signTransaction!(setupTransaction)
        const setupTxId = await connection.sendRawTransaction(signedSetupTransaction.serialize())
        await connection.confirmTransaction(setupTxId, 'confirmed')
      }

      const signedSwapTransaction = await signTransaction!(swapTransaction)
      const swapTxId = await connection.sendRawTransaction(signedSwapTransaction.serialize())
      await connection.confirmTransaction(swapTxId, 'confirmed')

      if (cleanupTransaction) {
        const signedCleanupTransaction = await signTransaction!(cleanupTransaction)
        const cleanupTxId = await connection.sendRawTransaction(signedCleanupTransaction.serialize())
        await connection.confirmTransaction(cleanupTxId, 'confirmed')
      }

      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${fromAmount} ${tokens.find(t => t.address === fromToken)?.symbol} for ${toAmount} ${tokens.find(t => t.address === toToken)?.symbol}`,
      })
      setFromAmount('')
      setToAmount('')
    } catch (error) {
      console.error('Error performing swap:', error)
      toast({
        title: "Error",
        description: "Failed to perform swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    setToAmount('')
  }

  const handleTokenSwitch = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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
            <CardTitle className="text-3xl font-bold">Swap Tokens</CardTitle>
            <CardDescription>Exchange tokens within the BARK BLINK ecosystem using Jupiter</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSwap(); }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fromToken">From</Label>
                  <div className="flex space-x-2">
                    <Select value={fromToken} onValueChange={setFromToken}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.address} value={token.address}>
                            <div className="flex items-center">
                              <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 mr-2" />
                              {token.symbol}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="fromAmount"
                      type="number"
                      placeholder="0.00"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button type="button" variant="outline" size="icon" onClick={handleTokenSwitch}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toToken">To</Label>
                  <div className="flex space-x-2">
                    <Select value={toToken} onValueChange={setToToken}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.address} value={token.address}>
                            <div className="flex items-center">
                              <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 mr-2" />
                              {token.symbol}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="toAmount"
                      type="number"
                      placeholder="0.00"
                      value={toAmount}
                      readOnly
                      className="flex-grow"
                    />
                  </div>
                </div>
                {routes.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Rate: 1 {tokens.find(t => t.address === fromToken)?.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {tokens.find(t => t.address === toToken)?.symbol}
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to perform a swap.</p>
                <WalletButton />
              </div>
            )}
          </CardContent>
          {connected && (
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                onClick={handleSwap}
                disabled={isLoading || !fromAmount || !toAmount || fromToken === toToken || routes.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Swap Tokens
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