'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { BarChart2, Gift, ShoppingBag, Landmark, Plus, ExternalLink, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { WalletButton } from '@/components/ui/wallet-button';
import Link from 'next/link';

interface Blink {
  id: string;
  name: string;
  description: string;
  type: string;
}

export default function Blinkboard() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [blinks, setBlinks] = useState<Blink[]>([
    { id: '1', name: 'Cosmic Blink', description: 'A mesmerizing cosmic-themed Blink', type: 'NFT' },
    { id: '2', name: 'Nature Blink', description: 'A serene nature-inspired Blink', type: 'Standard' },
    { id: '3', name: 'Tech Blink', description: 'A futuristic tech-themed Blink', type: 'Premium' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBlink, setNewBlink] = useState({ name: '', description: '' });
  const [recipient, setRecipient] = useState('');
  const [blinkToSend, setBlinkToSend] = useState('');
  const [swapData, setSwapData] = useState({ fromToken: '', toToken: '', amount: '' });
  const [stakeData, setStakeData] = useState({ blink: '', amount: '' });

  // Redirect if wallet is not connected
  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  // Handle Blink creation
  const handleCreateBlink = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description } = newBlink;
    if (!name || !description) {
      toast({ title: "Validation Error", description: "Blink name and description are required.", variant: "destructive" });
      return;
    }
    
    try {
      const newBlinkEntry: Blink = {
        id: (blinks.length + 1).toString(),
        name,
        description,
        type: 'NFT',
      };
      setBlinks([...blinks, newBlinkEntry]);
      toast({ title: "Blink Created", description: `${name} has been created successfully!` });
      setNewBlink({ name: '', description: '' });
    } catch (error) {
      toast({ title: "Error Creating Blink", description: "There was an issue creating your Blink.", variant: "destructive" });
    }
  };

  // Handle sending Blink
  const handleSendBlink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !blinkToSend) {
      toast({ title: "Validation Error", description: "Recipient address and Blink selection are required.", variant: "destructive" });
      return;
    }

    try {
      toast({ title: "Blink Sent", description: `Successfully sent ${blinkToSend} to ${recipient}.` });
      setRecipient('');
      setBlinkToSend('');
    } catch (error) {
      toast({ title: "Error Sending Blink", description: "There was an issue sending your Blink.", variant: "destructive" });
    }
  };

  // Handle swapping tokens
  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fromToken, toToken, amount } = swapData;
    if (!fromToken || !toToken || !amount) {
      toast({ title: "Validation Error", description: "All fields for swapping are required.", variant: "destructive" });
      return;
    }

    try {
      // Implement swap logic here
      toast({ title: "Tokens Swapped", description: `Successfully swapped ${amount} ${fromToken} for ${toToken}.` });
      setSwapData({ fromToken: '', toToken: '', amount: '' });
    } catch (error) {
      toast({ title: "Error Swapping Tokens", description: "There was an issue swapping your tokens.", variant: "destructive" });
    }
  };

  // Handle staking Blink
  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    const { blink, amount } = stakeData;
    if (!blink || !amount) {
      toast({ title: "Validation Error", description: "Blink and amount are required for staking.", variant: "destructive" });
      return;
    }

    try {
      // Implement staking logic here
      toast({ title: "Blink Staked", description: `Successfully staked ${amount} of ${blink}.` });
      setStakeData({ blink: '', amount: '' });
    } catch (error) {
      toast({ title: "Error Staking Blink", description: "There was an issue staking your Blink.", variant: "destructive" });
    }
  };

  // Filter blinks based on search term
  const filteredBlinks = blinks.filter(blink => 
    blink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blink.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render UI based on wallet connection
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet to Access Blinkboard</h1>
        <WalletButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Your Blinkboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle>Your Blinks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-grow mr-4">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  className="pl-8 border-2 border-gray-300 rounded-md focus:outline-none focus:border-[#D0BFB4]" 
                  placeholder="Search Blinks" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => router.push('/blinks/create')} className="bg-[#D0BFB4] text-white hover:bg-[#BFA99F] transition-colors">
                <Plus className="mr-2 h-4 w-4" color="#D0BFB4" /> Create Blink
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlinks.map((blink) => (
                <Card key={blink.id} className="shadow transition-shadow hover:shadow-lg">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{blink.name}</h3>
                    <p className="text-sm text-gray-600">{blink.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Type: {blink.type}</p>
                    <Link href={`/blinks/${blink.id}`} passHref>
                      <Button variant="link" className="mt-2 p-0 text-[#D0BFB4] hover:underline">
                        View Details <ExternalLink className="ml-1 h-3 w-3" color="#D0BFB4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Connected Wallet:</strong></p>
              <p className="text-sm text-gray-600">{publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-4)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="create" className="mt-6">
        <TabsList>
          <TabsTrigger value="create">Create Blink</TabsTrigger>
          <TabsTrigger value="send">Send Blink</TabsTrigger>
          <TabsTrigger value="swap">Swap Tokens</TabsTrigger>
          <TabsTrigger value="stake">Stake Blink</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <form onSubmit={handleCreateBlink} className="space-y-4">
            <div>
              <Label htmlFor="blinkName">Blink Name</Label>
              <Input 
                id="blinkName" 
                value={newBlink.name} 
                onChange={(e) => setNewBlink({ ...newBlink, name: e.target.value })}
                required 
              />
            </div>
            <div>
              <Label htmlFor="blinkDescription">Description</Label>
              <Input 
                id="blinkDescription" 
                value={newBlink.description} 
                onChange={(e) => setNewBlink({ ...newBlink, description: e.target.value })}
                required 
              />
            </div>
            <Button type="submit" className="bg-[#D0BFB4] text-white hover:bg-[#BFA99F] transition-colors">Create Blink</Button>
          </form>
        </TabsContent>

        <TabsContent value="send">
          <form onSubmit={handleSendBlink} className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input 
                id="recipient" 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)}
                required 
              />
            </div>
            <div>
              <Label htmlFor="blinkToSend">Select Blink to Send</Label>
              <Input 
                id="blinkToSend" 
                value={blinkToSend} 
                onChange={(e) => setBlinkToSend(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="bg-[#D0BFB4] text-white hover:bg-[#BFA99F] transition-colors">Send Blink</Button>
          </form>
        </TabsContent>

        <TabsContent value="swap">
          <form onSubmit={handleSwap} className="space-y-4">
            <div>
              <Label htmlFor="fromToken">From Token</Label>
              <Input 
                id="fromToken" 
                value={swapData.fromToken} 
                onChange={(e) => setSwapData({ ...swapData, fromToken: e.target.value })}
                required 
              />
            </div>
            <div>
              <Label htmlFor="toToken">To Token</Label>
              <Input 
                id="toToken" 
                value={swapData.toToken} 
                onChange={(e) => setSwapData({ ...swapData, toToken: e.target.value })}
                required 
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                value={swapData.amount} 
                onChange={(e) => setSwapData({ ...swapData, amount: e.target.value })}
                required 
              />
            </div>
            <Button type="submit" className="bg-[#D0BFB4] text-white hover:bg-[#BFA99F] transition-colors">Swap Tokens</Button>
          </form>
        </TabsContent>

        <TabsContent value="stake">
          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <Label htmlFor="stakeBlink">Blink to Stake</Label>
              <Input 
                id="stakeBlink" 
                value={stakeData.blink} 
                onChange={(e) => setStakeData({ ...stakeData, blink: e.target.value })}
                required 
              />
            </div>
            <div>
              <Label htmlFor="stakeAmount">Amount</Label>
              <Input 
                id="stakeAmount" 
                value={stakeData.amount} 
                onChange={(e) => setStakeData({ ...stakeData, amount: e.target.value })}
                required 
              />
            </div>
            <Button type="submit" className="bg-[#D0BFB4] text-white hover:bg-[#BFA99F] transition-colors">Stake Blink</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
