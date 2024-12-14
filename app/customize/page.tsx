'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

interface BlinkAttributes {
  name: string
  color: string
  size: number
  speed: number
  pattern: string
  glow: boolean
}

const DEFAULT_BLINK: BlinkAttributes = {
  name: '',
  color: '#ff0000',
  size: 50,
  speed: 5,
  pattern: 'steady',
  glow: false,
}

export default function CustomizePage() {
  const [blink, setBlink] = useState<BlinkAttributes>(DEFAULT_BLINK)
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()

  const handleChange = (field: keyof BlinkAttributes, value: string | number | boolean) => {
    setBlink(prev => ({ ...prev, [field]: value }))
  }

  const handleCustomize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to customize your Blink.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this customization data to your backend
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating API call
      toast({
        title: "Customization Successful",
        description: `Your Blink "${blink.name}" has been successfully customized!`,
      })
    } catch (error) {
      console.error('Error customizing Blink:', error)
      toast({
        title: "Error",
        description: "Failed to customize Blink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle className="text-3xl font-bold">Customize Your Blink</CardTitle>
            <CardDescription>Create a unique Blink with custom attributes</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <form onSubmit={handleCustomize} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Blink Name</Label>
                  <Input
                    id="name"
                    value={blink.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter Blink name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color"
                      type="color"
                      value={blink.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="w-12 h-12 p-1 rounded-md"
                    />
                    <Input
                      value={blink.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Slider
                    id="size"
                    min={10}
                    max={100}
                    step={1}
                    value={[blink.size]}
                    onValueChange={(value) => handleChange('size', value[0])}
                  />
                  <div className="text-sm text-muted-foreground text-right">{blink.size}%</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speed">Speed</Label>
                  <Slider
                    id="speed"
                    min={1}
                    max={10}
                    step={1}
                    value={[blink.speed]}
                    onValueChange={(value) => handleChange('speed', value[0])}
                  />
                  <div className="text-sm text-muted-foreground text-right">{blink.speed}/10</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern</Label>
                  <Select value={blink.pattern} onValueChange={(value) => handleChange('pattern', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steady">Steady</SelectItem>
                      <SelectItem value="blink">Blink</SelectItem>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="glow"
                    checked={blink.glow}
                    onCheckedChange={(checked) => handleChange('glow', checked)}
                  />
                  <Label htmlFor="glow">Glow Effect</Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Customizing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Customize Blink
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to customize your Blink.</p>
                <WalletButton />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}