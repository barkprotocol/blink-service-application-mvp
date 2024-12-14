'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Plus, DollarSign, Leaf, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  creator: string
  endDate: Date
  category: 'Community' | 'Ecology' | 'Social' | 'Disaster Relief'
  impact: string
}

export default function CrowdfundingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', goal: '', category: '', impact: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('All')
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    if (connected) {
      fetchCampaigns()
    }
  }, [connected])

  const fetchCampaigns = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would fetch the actual campaigns from your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulating API call
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'BARK Blink Community Event',
          description: 'Help us organize a community meetup for BARK Blink enthusiasts!',
          goal: 5000,
          raised: 3500,
          creator: '5CreatorAddressHere...',
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          category: 'Community',
          impact: 'Strengthen community bonds and increase adoption of BARK Blink'
        },
        {
          id: '2',
          title: 'Reforestation Project',
          description: 'Plant 10,000 trees to combat deforestation and climate change.',
          goal: 20000,
          raised: 15000,
          creator: '5EcoWarriorAddressHere...',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          category: 'Ecology',
          impact: 'Reduce CO2 emissions and restore natural habitats'
        },
        {
          id: '3',
          title: 'Education for Underprivileged Children',
          description: 'Provide educational resources and support for 100 underprivileged children.',
          goal: 10000,
          raised: 7500,
          creator: '5EducatorAddressHere...',
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          category: 'Social',
          impact: 'Improve literacy rates and future opportunities for underprivileged children'
        },
        {
          id: '4',
          title: 'Emergency Relief for Natural Disaster Victims',
          description: 'Provide immediate aid and support to victims of recent natural disasters.',
          goal: 50000,
          raised: 30000,
          creator: '5DisasterReliefOrgAddressHere...',
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          category: 'Disaster Relief',
          impact: 'Provide food, shelter, and medical assistance to affected communities'
        },
      ]
      setCampaigns(mockCampaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast({
        title: "Error",
        description: "Failed to fetch campaigns. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this data to your backend
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulating API call
      const newCampaignData: Campaign = {
        id: (campaigns.length + 1).toString(),
        title: newCampaign.title,
        description: newCampaign.description,
        goal: parseFloat(newCampaign.goal),
        raised: 0,
        creator: publicKey.toBase58(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        category: newCampaign.category as Campaign['category'],
        impact: newCampaign.impact,
      }
      setCampaigns([...campaigns, newCampaignData])
      setNewCampaign({ title: '', description: '', goal: '', category: '', impact: '' })
      toast({
        title: "Campaign Created",
        description: "Your crowdfunding campaign has been successfully created.",
      })
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDonate = async (campaignId: string, amount: number) => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to donate.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this donation to your backend
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulating API call
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign.id === campaignId) {
          return { ...campaign, raised: campaign.raised + amount }
        }
        return campaign
      })
      setCampaigns(updatedCampaigns)
      toast({
        title: "Donation Successful",
        description: `You have successfully donated ${amount} BARK to the campaign.`,
      })
    } catch (error) {
      console.error('Error donating:', error)
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCampaigns = filter === 'All' ? campaigns : campaigns.filter(campaign => campaign.category === filter)

  const getCategoryIcon = (category: Campaign['category']) => {
    switch (category) {
      case 'Ecology':
        return <Leaf className="h-5 w-5 text-green-500" />
      case 'Social':
        return <Users className="h-5 w-5 text-blue-500" />
      case 'Disaster Relief':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <DollarSign className="h-5 w-5 text-yellow-500" />
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
            <CardTitle className="text-3xl font-bold">BARK Blink Crowdfunding</CardTitle>
            <CardDescription>Support community projects, ecological initiatives, social causes, and disaster relief efforts</CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-xl">Create New Campaign</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Campaign Title</Label>
                        <Input
                          id="title"
                          value={newCampaign.title}
                          onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                          required
                          placeholder="Enter campaign title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Campaign Description</Label>
                        <Textarea
                          id="description"
                          value={newCampaign.description}
                          onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                          required
                          placeholder="Enter campaign description"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal">Funding Goal (BARK)</Label>
                        <Input
                          id="goal"
                          type="number"
                          value={newCampaign.goal}
                          onChange={(e) => setNewCampaign({ ...newCampaign, goal: e.target.value })}
                          required
                          placeholder="Enter funding goal"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={(value) => setNewCampaign({ ...newCampaign, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Community">Community</SelectItem>
                            <SelectItem value="Ecology">Ecology</SelectItem>
                            <SelectItem value="Social">Social</SelectItem>
                            <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impact">Expected Impact</Label>
                        <Textarea
                          id="impact"
                          value={newCampaign.impact}
                          onChange={(e) => setNewCampaign({ ...newCampaign, impact: e.target.value })}
                          required
                          placeholder="Describe the expected impact of your campaign"
                          rows={3}
                        />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Campaign
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                <div className="mb-6">
                  <Label htmlFor="filter">Filter Campaigns</Label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter campaigns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Campaigns</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Ecology">Ecology</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-6">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{campaign.title}</CardTitle>
                          {getCategoryIcon(campaign.category)}
                        </div>
                        <CardDescription>Created by: {campaign.creator}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{campaign.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress: {((campaign.raised / campaign.goal) * 100).toFixed(2)}%</span>
                            <span>{campaign.raised} / {campaign.goal} BARK</span>
                          </div>
                          <Progress value={(campaign.raised / campaign.goal) * 100} />
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                          Ends on: {campaign.endDate.toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-sm font-semibold">Expected Impact:</p>
                        <p className="text-sm">{campaign.impact}</p>
                      </CardContent>
                      <CardFooter>
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          const amount = parseFloat((e.target as HTMLFormElement).amount.value)
                          handleDonate(campaign.id, amount)
                        }} className="flex w-full space-x-2">
                          <Input
                            name="amount"
                            type="number"
                            placeholder="Amount to donate"
                            required
                            min="0"
                            step="0.01"
                          />
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <Loader2 className="h-4 w-4  animate-spin" />
                            ) : (
                              <DollarSign className="h-4 w-4" />
                            )}
                            <span className="sr-only">Donate</span>
                          </Button>
                        </form>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-lg text-muted-foreground">Please connect your wallet to view and create crowdfunding campaigns.</p>
                <WalletButton />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}