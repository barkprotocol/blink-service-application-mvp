import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ApiError } from '@/utils/errors/api-error'

const prisma = new PrismaClient()

const CNFTSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be 1000 characters or less"),
  image: z.string().url("Invalid image URL"),
  royaltyPercentage: z.number().min(0, "Royalty percentage must be at least 0").max(100, "Royalty percentage must be 100 or less"),
  creatorAddress: z.string().min(1, "Creator address is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CNFTSchema.parse(body)

    const cnft = await prisma.cNFT.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        image: validatedData.image,
        royaltyPercentage: validatedData.royaltyPercentage,
        creatorAddress: validatedData.creatorAddress,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Compressed NFT created successfully', 
      data: cnft 
    }, { status: 201 })

  } catch (error) {
    console.error('Error in create-cnft route:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid input', 
        errors: error.errors 
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
      message: 'Failed to create compressed NFT', 
      errors: [(error as Error).message] 
    }, { status: 500 })
  }
}

