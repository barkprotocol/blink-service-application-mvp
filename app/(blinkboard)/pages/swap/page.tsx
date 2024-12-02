"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ArrowDownUp, ArrowRight, Info, RefreshCw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { ChartContainer, LineChart } from "@/components/ui/chart"

const tokens = [
  { name: "BARK", balance: 1000, icon: "https://ucarecdn.com/c18275e5-d6ca-42d3-9075-676952548776/barkicon.png" },
  { name: "SOL", balance: 50, icon: "https://ucarecdn.com/0aa23f11-40b3-4cdc-891b-a169ed9f9328/sol.png" },
  { name: "USDC", balance: 500, icon: "https://ucarecdn.com/ee18c01a-d01d-4ad6-adb6-cac9a5539d2c/usdc.png" },
]

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [rates, setRates] = useState<Record<string, number>>({})
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([])
  const [slippage, setSlippage] = useState(0.5)
  const [isAutoRouting, setIsAutoRouting] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRates()
    fetchChartData()
  }, [])

  const fetchRates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd')
      const data = await response.json()
      setRates({
        SOL: data.solana.usd,
        USDC: data['usd-coin'].usd,
        BARK: 0.1 // Assuming a fixed rate for BARK as it's not on Coingecko
      })
    } catch (error) {
      console.error('Error fetching rates:', error)
      toast({
        title: "Error",
        description: "Failed to fetch current rates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      setIsLoading(true)
      // This is a placeholder. In a real application, you would fetch actual chart data.
      const data = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.random() * 100 + 50
      }))
      setChartData(data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch chart data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('https://quote-api.jup.ag/v4/quote?' + new URLSearchParams({
        inputMint: fromToken.name,
        outputMint: toToken.name,
        amount: fromAmount,
        slippageBps: (slippage * 100).toString(),
      }))
      const data = await response.json()
      console.log('Jupiter Swap Quote:', data)
      // In a real application, you would process the quote and execute the swap
      toast({
        title: "Swap Executed",
        description: `Successfully swapped ${fromAmount} ${fromToken.name} to ${toAmount} ${toToken.name}`,
      })
    } catch (error) {
      console.error('Error fetching Jupiter swap quote:', error)
      toast({
        title: "Swap Failed",
        description: "An error occurred while processing the swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (rates[fromToken.name] && rates[toToken.name]) {
      const estimatedAmount = (Number(value) * rates[fromToken.name] / rates[toToken.name]).toFixed(6)
      setToAmount(estimatedAmount)
    }
  }

  const handleTokenSwitch = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Swap</h2>
        <Button variant="outline" size="icon" onClick={fetchRates}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Swap Tokens</CardTitle>
            <CardDescription>Exchange your tokens at the best rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-amount">From</Label>
              <div className="flex space-x-2">
                <Input
                  id="from-amount"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="flex-grow"
                />
                <Select value={fromToken.name} onValueChange={(value) => setFromToken(tokens.find(t => t.name === value) || tokens[0])}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.name} value={token.name}>
                        <div className="flex items-center">
                          <Image src={token.icon} alt={token.name} width={24} height={24} className="mr-2" />
                          {token.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">Balance: {fromToken.balance} {fromToken.name}</p>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" size="icon" onClick={handleTokenSwitch}>
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-amount">To</Label>
              <div className="flex space-x-2">
                <Input
                  id="to-amount"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="flex-grow"
                />
                <Select value={toToken.name} onValueChange={(value) => setToToken(tokens.find(t => t.name === value) || tokens[1])}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.name} value={token.name}>
                        <div className="flex items-center">
                          <Image src={token.icon} alt={token.name} width={24} height={24} className="mr-2" />
                          {token.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">Balance: {toToken.balance} {toToken.name}</p>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>Exchange Rate</span>
              <span>1 {fromToken.name} = {rates[fromToken.name] && rates[toToken.name] ? (rates[fromToken.name] / rates[toToken.name]).toFixed(6) : '...'} {toToken.name}</span>
            </div>

            <div className="space-y-2">
              <Label>Slippage Tolerance</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[slippage]}
                  onValueChange={(value) => setSlippage(value[0])}
                  max={5}
                  step={0.1}
                  className="flex-grow"
                />
                <span className="w-12 text-right">{slippage.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-routing"
                checked={isAutoRouting}
                onCheckedChange={setIsAutoRouting}
              />
              <Label htmlFor="auto-routing">Auto Routing</Label>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-between items-center text-sm">
                    <span>Network Fee</span>
                    <span className="flex items-center">
                      0.1% <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Network fee is used to incentivize liquidity providers and maintain the protocol.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSwap} disabled={isLoading}>
              {isLoading ? "Processing..." : "Swap"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "Value",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <LineChart
                    data={chartData}
                    xAxisKey="date"
                    yAxisKey="value"
                  />
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(rates).map(([token, rate]) => (
                  <div key={token} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Image src={tokens.find(t => t.name === token)?.icon || ''} alt={token} width={24} height={24} className="mr-2" />
                      <span>{token}</span>
                    </div>
                    <span>${rate.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Swaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your recent swap transactions will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

