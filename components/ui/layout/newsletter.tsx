'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubscribing(true)
    try {
      const response = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Subscription failed')
      }

      toast({
        title: "Subscribed successfully!",
        description: "Thank you for subscribing to our newsletter.",
      })
      setEmail('')
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "An error occurred while subscribing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <section id="newsletter" className="mb-20 py-16 sm:py-20">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-inter text-3xl sm:text-4xl font-bold mb-4 text-center">Stay in the Loop</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-light text-lg sm:text-xl mb-8 text-center text-muted-foreground max-w-2xl mx-auto">
                Get the latest updates, news, and exclusive offers directly in your inbox. Join our community today!
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <div className="flex-grow">
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <Mail className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

