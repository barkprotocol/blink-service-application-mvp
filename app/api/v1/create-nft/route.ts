import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { ApiError } from '@/utils/errors/api-error';
import { ERROR_MESSAGES, NFT_TYPES, METADATA_STANDARDS } from '@/utils/constants';
import { createNFT } from '@/utils/nft/create-nft';
import { uploadToArweave } from '@/utils/storage/arweave-upload';
import { uploadToPinata } from '@/utils/storage/pinata-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const owner = formData.get('owner') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const nftType = formData.get('type') as string;
    const image = formData.get('image') as File;
    const isTransferable = formData.get('isTransferable') === 'true';
    const metadataStandard = formData.get('metadataStandard') as string || METADATA_STANDARDS.METAPLEX;

    // Validate required fields
    if (!owner || !name || !description || !nftType || !image) {
      throw new ApiError(400, ERROR_MESSAGES.MISSING_INFORMATION, ['owner', 'name', 'description', 'type', 'image']);
    }

    // Validate owner is a valid Solana public key
    let ownerPublicKey: PublicKey;
    try {
      ownerPublicKey = new PublicKey(owner);
    } catch (error) {
      throw new ApiError(400, 'Invalid owner public key', [(error as Error).message]);
    }

    // Validate NFT type
    if (!Object.values(NFT_TYPES).includes(nftType as any)) {
      throw new ApiError(400, 'Invalid NFT type', [`Type must be one of: ${Object.values(NFT_TYPES).join(', ')}`]);
    }

    // Validate metadata standard
    if (!Object.values(METADATA_STANDARDS).includes(metadataStandard as any)) {
      throw new ApiError(400, 'Invalid metadata standard', [`Standard must be one of: ${Object.values(METADATA_STANDARDS).join(', ')}`]);
    }

    // Upload image to Arweave
    const imageUrl = await uploadToArweave(image);

    // Prepare metadata
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: [
        { trait_type: 'Type', value: nftType },
        { trait_type: 'Transferable', value: isTransferable ? 'Yes' : 'No' },
      ],
    };

    // Create the NFT
    const nftMintAddress = await createNFT({
      owner: ownerPublicKey,
      metadata,
      isTransferable,
      metadataStandard,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'NFT created successfully', 
      data: { nftMintAddress, metadata } 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in create-nft route:', error);

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

