'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, BarChart, LineChart, PieChart } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  tokenDistribution: { name: string; value: number }[]
  priceHistory: { date: string; price: number }[]
  transactionVolume: { date: string; volume: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { connected } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    if (connected) {
      fetchAnalyticsData()
    }
  }, [connected])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would fetch the actual analytics data from your backend
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulating API call
      const mockData: AnalyticsData = {
        tokenDistribution: [
          { name: 'Circulating Supply', value: 50 },
          { name: 'Team & Advisors', value: 20 },
          { name: 'Community Rewards', value: 15 },
          { name: 'Development Fund', value: 10 },
          { name: 'Marketing', value: 5 },
        ],
        priceHistory: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: Math.random() * 2 + 0.5,
        })),
        transactionVolume: Array.from({ length: 7 }, (_, i) => ({
          date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          volume: Math.floor(Math.random() * 10000) + 1000,
        })),
      }
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <CardTitle className="text-3xl font-bold">BARK Blink Analytics</CardTitle>
            <CardDescription>View key metrics and insights for the BARK Blink ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analyticsData ? (
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Token Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={analyticsData.tokenDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {analyticsData.tokenDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">BARK Token Price History (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={analyticsData.priceHistory}>
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Transaction Volume (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={analyticsData.transactionVolume}>
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="volume" fill="#8884d8" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-center py-8 text-lg text-muted-foreground">No analytics data available.</p>
              )
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to view BARK Blink analytics.</p>
                <WalletButton />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}