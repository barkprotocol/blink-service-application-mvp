import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiError } from '@/utils/errors/api-error'
import { mintCNFT } from '@/utils/nft/mint-cnft'
import { ERROR_MESSAGES } from '@/utils/constants'

const CNFTSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be 1000 characters or less"),
  image: z.string().min(1, "Image is required"),
  royaltyPercentage: z.number().min(0, "Royalty percentage must be at least 0").max(100, "Royalty percentage must be 100 or less"),
  creatorAddress: z.string().min(1, "Creator address is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CNFTSchema.parse(body)

    // Mint CNFT
    const cnftResult = await mintCNFT({
      name: validatedData.name,
      description: validatedData.description,
      image: validatedData.image,
      royaltyPercentage: validatedData.royaltyPercentage,
      creatorAddress: validatedData.creatorAddress,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Compressed NFT created successfully', 
      data: {
        mintAddress: cnftResult.mintAddress,
        metadataAddress: cnftResult.metadataAddress,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in create-cnft route:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid input', 
        errors: error.errors.map(err => err.message)
      }, { status: 400 })
    }

    if (error instanceof ApiError) {
      return NextResponse.json({ 
        success: false, 
        message: error.message, 
        errors: error.errors 
      }, { status: error.statusCode })
    }

    return NextResponse.json({ 
      success: false, 
      message: ERROR_MESSAGES.CREATION_FAILED, 
      errors: [(error as Error).message] 
    }, { status: 500 })
  }
}

