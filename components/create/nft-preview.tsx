import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Share2 } from 'lucide-react'

interface NFTPreviewProps {
  name: string
  description: string
  image: string
  royaltyPercentage?: number
}

export function NFTPreview({ name, description, image, royaltyPercentage }: NFTPreviewProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">NFT Preview</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="secondary"><Eye className="w-4 h-4 mr-1" /> Preview</Badge>
            {royaltyPercentage !== undefined && (
              <Badge variant="outline">{royaltyPercentage}% Royalty</Badge>
            )}
          </div>
        </div>
        <CardDescription>This is how your NFT will appear</CardDescription>
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
          <h3 className="text-2xl font-bold text-center">{name}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-prose">{description}</p>
          <div className="flex justify-center items-center space-x-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

