'use client';

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Header } from '@/components/ui/layout/header'
import { Hero } from '@/components/ui/layout/hero'
import { Features } from '@/components/ui/layout/features'
import { Actions } from "@/components/ui/layout/actions"
import { HowItWorks } from '@/components/ui/layout/how-it-works'
import { CTA } from '@/components/ui/layout/cta'
import { FAQ } from '@/components/ui/layout/faq'
import { Newsletter } from '@/components/ui/layout/newsletter'
import Footer from "@/components/ui/layout/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Blinkboard: React.FC = () => {
  const { connected, publicKey } = useWallet()
  const [username, setUsername] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const storedUsername = localStorage.getItem('barkBlinkUsername')
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  const handleLaunchApp = () => {
    if (connected && publicKey) {
      setIsDialogOpen(true)
    } else {
      alert("Please connect your wallet to launch the app.")
    }
  }

  const handleUsernameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (username.trim()) {
      localStorage.setItem('barkBlinkUsername', username)
      setIsDialogOpen(false)
      alert('User setup complete!')
    } else {
      alert("Please enter a valid username.")
    }
  }

  return (
    <div className="min-h-screen font-poppins bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Hero onLaunchApp={handleLaunchApp} />
        <Features />
        <HowItWorks />
        <Actions />
        <CTA onLaunchApp={handleLaunchApp} />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Your Username</DialogTitle>
            <DialogDescription>
              Enter a username to get started with BARK BLINK.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUsernameSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                Start Blinking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Blinkboard
