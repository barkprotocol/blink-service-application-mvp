import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Share2, Copy, Twitter, Facebook, Send, MessageSquare } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface NFTPreviewProps {
  name: string
  description: string
  image: string
  royaltyPercentage?: number
  shareUrl: string
  title?: string
  subtext?: string
  textColor?: string
  fontSize?: string
  fontFamily?: string
}

export function NFTPreview({ 
  name, 
  description, 
  image, 
  royaltyPercentage, 
  shareUrl,
  title,
  subtext,
  textColor = "text-primary",
  fontSize = "text-base",
  fontFamily = "font-sans"
}: NFTPreviewProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link Copied",
      description: "The NFT link has been copied to your clipboard.",
    })
  }

  const shareToSocial = (platform: string) => {
    let url = ''
    const text = `Check out my new NFT: ${name}`
    
    switch (platform) {
      case 'x':
        url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
        break
      case 'discord':
        navigator.clipboard.writeText(`${text} ${shareUrl}`)
        toast({
          title: "Copied for Discord",
          description: "The message has been copied. Paste it in your Discord chat.",
        })
        return
    }

    if (url) window.open(url, '_blank')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{title || "NFT Preview"}</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="secondary"><Eye className="w-4 h-4 mr-1" /> Preview</Badge>
            {royaltyPercentage !== undefined && (
              <Badge variant="outline">{royaltyPercentage}% Royalty</Badge>
            )}
          </div>
        </div>
        <CardDescription>{subtext || "This is how your NFT will appear"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
            <img
              src={`data:image/png;base64,${image}`}
              alt={name}
              className="object-cover w-full h-full"
            />
          </div>
          <h3 className={`text-2xl font-bold text-center ${textColor} ${fontSize} ${fontFamily}`}>{name}</h3>
          <p className={`text-sm text-center max-w-prose ${textColor} ${fontSize} ${fontFamily}`}>{description}</p>
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share this NFT</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-4">
                <Input value={shareUrl} readOnly />
                <Button onClick={copyToClipboard} size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <Button onClick={() => shareToSocial('x')} variant="outline" size="icon">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button onClick={() => shareToSocial('facebook')} variant="outline" size="icon">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button onClick={() => shareToSocial('telegram')} variant="outline" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
                <Button onClick={() => shareToSocial('discord')} variant="outline" size="icon">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

