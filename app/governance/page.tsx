'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Plus, Check, X } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion } from 'framer-motion'

interface Proposal {
  id: string
  title: string
  description: string
  proposer: string
  status: 'active' | 'passed' | 'rejected'
  forVotes: number
  againstVotes: number
  startDate: Date
  endDate: Date
}

const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Increase BARK token staking rewards',
    description: 'Proposal to increase the staking rewards for BARK token holders from 5% to 7% APY.',
    proposer: '7X8jbJdZh2Wi4cmM...',
    status: 'active',
    forVotes: 1500000,
    againstVotes: 500000,
    startDate: new Date('2023-05-01'),
    endDate: new Date('2023-05-08'),
  },
  {
    id: '2',
    title: 'Add new Blink type: Mythical',
    description: 'Introduce a new ultra-rare Blink type called Mythical with special abilities.',
    proposer: '3Fej7yNhJoHCmJ9X...',
    status: 'passed',
    forVotes: 2000000,
    againstVotes: 300000,
    startDate: new Date('2023-04-15'),
    endDate: new Date('2023-04-22'),
  },
  {
    id: '3',
    title: 'Reduce transaction fees by 20%',
    description: 'Proposal to reduce the transaction fees on the BARK BLINK platform by 20% to encourage more trading.',
    proposer: '9Qm5tKqoWqrFxAe7...',
    status: 'rejected',
    forVotes: 800000,
    againstVotes: 1200000,
    startDate: new Date('2023-04-01'),
    endDate: new Date('2023-04-08'),
  },
]

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals)
  const [activeTab, setActiveTab] = useState('active')
  const [isLoading, setIsLoading] = useState(false)
  const [newProposal, setNewProposal] = useState({ title: '', description: '' })
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // In a real application, you would fetch proposals from your backend here
    setProposals(mockProposals)
  }, [])

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a proposal.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this data to your backend
      const newProposalData: Proposal = {
        id: (proposals.length + 1).toString(),
        title: newProposal.title,
        description: newProposal.description,
        proposer: publicKey.toBase58().slice(0, 10) + '...',
        status: 'active',
        forVotes: 0,
        againstVotes: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }

      setProposals([newProposalData, ...proposals])
      setNewProposal({ title: '', description: '' })
      toast({
        title: "Proposal Created",
        description: "Your proposal has been successfully created.",
      })
    } catch (error) {
      console.error('Error creating proposal:', error)
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (proposalId: string, voteFor: boolean) => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real application, you would send this vote to your backend
      const updatedProposals = proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            forVotes: voteFor ? proposal.forVotes + 1 : proposal.forVotes,
            againstVotes: voteFor ? proposal.againstVotes : proposal.againstVotes + 1,
          }
        }
        return proposal
      })

      setProposals(updatedProposals)
      toast({
        title: "Vote Recorded",
        description: `Your vote has been successfully recorded.`,
      })
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'active') return proposal.status === 'active'
    if (activeTab === 'passed') return proposal.status === 'passed'
    if (activeTab === 'rejected') return proposal.status === 'rejected'
    return true
  })

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
        <Card className="bg-white shadow-md mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold mb-2">BARK BLINK Governance</CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Participate in shaping the future of BARK BLINK by creating and voting on proposals.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>

        {connected ? (
          <>
            <Card className="bg-white shadow-md mb-8">
              <CardHeader>
                <CardTitle>Create New Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProposal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Proposal Title</Label>
                    <Input
                      id="title"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                      required
                      placeholder="Enter proposal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Proposal Description</Label>
                    <Textarea
                      id="description"
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                      required
                      placeholder="Enter proposal description"
                      rows={4}
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
                        Create Proposal
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle>Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="passed">Passed</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab}>
                    {filteredProposals.map((proposal) => (
                      <Card key={proposal.id} className="mb-4">
                        <CardHeader>
                          <CardTitle>{proposal.title}</CardTitle>
                          <CardDescription>Proposed by: {proposal.proposer}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4">{proposal.description}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p>For: {proposal.forVotes}</p>
                              <p>Against: {proposal.againstVotes}</p>
                            </div>
                            <div>
                              <p>Start: {proposal.startDate.toLocaleDateString()}</p>
                              <p>End: {proposal.endDate.toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                        {proposal.status === 'active' && (
                          <CardFooter className="flex justify-end space-x-2">
                            <Button onClick={() => handleVote(proposal.id, true)} disabled={isLoading}>
                              <Check className="mr-2 h-4 w-4" />
                              For
                            </Button>
                            <Button onClick={() => handleVote(proposal.id, false)} disabled={isLoading}>
                              <X className="mr-2 h-4 w-4" />
                              Against
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-white shadow-md">
            <CardContent className="text-center py-8">
              <p className="mb-4 text-lg text-muted-foreground">
                Please connect your wallet to participate in governance.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}