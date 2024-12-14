import { NextRequest, NextResponse } from 'next/server';
import { createBlink } from '@/utils/blink/create-blink';
import { PublicKey } from '@solana/web3.js';
import { ApiError } from '@/utils/errors/api-error';
import { ERROR_MESSAGES } from '@/utils/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, name, description, blinkType, isNFT, isDonation, isGift, isPayment, isPoll } = body;

    // Validate required fields
    if (!owner || !name || !description || !blinkType) {
      throw new ApiError(400, ERROR_MESSAGES.MISSING_INFORMATION, ['owner', 'name', 'description', 'blinkType']);
    }

    // Validate owner is a valid Solana public key
    let ownerPublicKey: PublicKey;
    try {
      ownerPublicKey = new PublicKey(owner);
    } catch (error) {
      throw new ApiError(400, 'Invalid owner public key', [(error as Error).message]);
    }

    // Validate boolean fields
    const booleanFields = { isNFT, isDonation, isGift, isPayment, isPoll };
    Object.entries(booleanFields).forEach(([key, value]) => {
      if (typeof value !== 'boolean') {
        throw new ApiError(400, `Invalid ${key} value`, [`${key} must be a boolean`]);
      }
    });

    // Create the Blink
    const blinkMintAddress = await createBlink({
      owner: ownerPublicKey,
      name,
      description,
      blinkType,
      isNFT,
      isDonation,
      isGift,
      isPayment,
      isPoll
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Blink created successfully', 
      data: { blinkMintAddress } 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in create-blink route:', error);

    if (error instanceof ApiError) {
      return NextResponse.json({ 
        success: false, 
        message: error.message, 
        errors: error.errors 
      }, { status: error.statusCode });
    }

    return NextResponse.json({ 
      success: false, 
      message: ERROR_MESSAGES.CREATION_FAILED, 
      errors: [(error as Error).message] 
    }, { status: 500 });
  }
}

