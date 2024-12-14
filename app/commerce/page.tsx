'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface CartItem extends Product {
  quantity: number
}

const products: Product[] = [
  { id: '1', name: 'BARK Blink T-Shirt', description: 'Comfortable cotton t-shirt with BARK Blink logo', price: 25, image: '/placeholder.svg?height=200&width=200', category: 'Apparel' },
  { id: '2', name: 'BARK Blink Hoodie', description: 'Warm hoodie with embroidered BARK Blink logo', price: 50, image: '/placeholder.svg?height=200&width=200', category: 'Apparel' },
  { id: '3', name: 'BARK Blink Cap', description: 'Adjustable cap with BARK Blink logo', price: 20, image: '/placeholder.svg?height=200&width=200', category: 'Accessories' },
  { id: '4', name: 'BARK Blink Mug', description: 'Ceramic mug with BARK Blink design', price: 15, image: '/placeholder.svg?height=200&width=200', category: 'Accessories' },
  { id: '5', name: 'BARK Blink Stickers Pack', description: 'Pack of 10 BARK Blink themed stickers', price: 10, image: '/placeholder.svg?height=200&width=200', category: 'Accessories' },
  { id: '6', name: 'BARK Blink Poster', description: 'High-quality poster featuring BARK Blink artwork', price: 30, image: '/placeholder.svg?height=200&width=200', category: 'Art' },
]

export default function CommercePage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState<string>('All')
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()

  const filteredProducts = category === 'All' ? products : products.filter(product => product.category === category)

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to complete the purchase.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this cart data to your backend for processing
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating API call
      toast({
        title: "Purchase Successful",
        description: "Thank you for your purchase! Your items will be shipped soon.",
      })
      setCart([])
    } catch (error) {
      console.error('Error processing purchase:', error)
      toast({
        title: "Error",
        description: "Failed to process your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">BARK Blink Shop</CardTitle>
            <CardDescription>Browse and purchase official BARK Blink merchandise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="category">Filter by Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Apparel">Apparel</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Art">Art</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <Image src={product.image} alt={product.name} width={200} height={200} className="w-full h-auto" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                    <p className="mt-2 font-bold">${product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => addToCart(product)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your Cart</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-xl font-bold mt-4">
                  Total: ${getTotalPrice().toFixed(2)}
                </div>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Your cart is empty.</p>
            )}
          </CardContent>
          <CardFooter>
            {connected ? (
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Checkout
                  </>
                )}
              </Button>
            ) : (
              <div className="w-full text-center">
                <p className="mb-4 text-gray-500">Please connect your wallet to complete the purchase.</p>
                <WalletButton />
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}