'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SolanaWalletProvider } from '@/components/providers/solana-wallet-provider'
import { WalletButton } from '@/components/ui/wallet-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockProducts = [
  { id: 1, name: 'BARK T-Shirt', price: 20, image: '/placeholder.svg?height=200&width=200' },
  { id: 2, name: 'BARK Hoodie', price: 40, image: '/placeholder.svg?height=200&width=200' },
  { id: 3, name: 'BARK Cap', price: 15, image: '/placeholder.svg?height=200&width=200' },
]

const mockOrders = [
  { id: 1, product: 'BARK T-Shirt', status: 'Shipped', date: '2024-09-15' },
  { id: 2, product: 'BARK Hoodie', status: 'Processing', date: '2024-09-14' },
]

function ProductCard({ product }: { product: typeof mockProducts[0] }) {
  return (
    <Card key={product.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover mb-4 rounded" 
          aria-label={`Image of ${product.name}`} 
        />
        <p className="text-lg font-semibold mb-2">${product.price}</p>
        <Button className="w-full">Add to Cart</Button>
      </CardContent>
    </Card>
  )
}

function OrderItem({ order }: { order: typeof mockOrders[0] }) {
  return (
    <li key={order.id} className="flex justify-between items-center border-b pb-2">
      <div>
        <p className="font-semibold">{order.product}</p>
        <p className="text-sm text-gray-600">Order Date: {order.date}</p>
      </div>
      <span className="text-sm font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded">
        {order.status}
      </span>
    </li>
  )
}

export default function Commerce() {
  const [activeTab, setActiveTab] = useState('products')
  
  // Memoizing the mock data to prevent unnecessary re-renders
  const products = useMemo(() => mockProducts, [])
  const orders = useMemo(() => mockOrders, [])

  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">BARK Commerce</h1>

        <WalletButton />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          {/* Product List */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>

          {/* Orders List */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {orders.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SolanaWalletProvider>
  )
}
