import { NextRequest, NextResponse } from 'next/server'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createSignerFromKeypair } from '@metaplex-foundation/umi'
import { mplTokenMetadata, TokenStandard, createAndMint } from '@metaplex-foundation/mpl-token-metadata'
import { createTree, mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum"
import { generateSigner, percentAmount, createGenericFile } from '@metaplex-foundation/umi'
import { base58 } from '@metaplex-foundation/umi/serializers'

export async function POST(request: NextRequest) {
  try {
    const { name, description, image } = await request.json()

    // Initialize Umi
    const umi = createUmi('https://api.mainnet-beta.solana.com').use(mplTokenMetadata())
    
    // In a real-world scenario, you'd securely manage this keypair
    const keypair = umi.eddsa.createKeypair()
    const signer = createSignerFromKeypair(umi, keypair)
    umi.use(signer)

    // Upload the image
    const imageFile = createGenericFile(Buffer.from(image, 'base64'), 'image.png')
    const [imageUri] = await umi.uploader.upload([imageFile])

    // Create metadata
    const metadata = {
      name,
      description,
      image: imageUri,
    }
    const metadataFile = createGenericFile(JSON.stringify(metadata), 'metadata.json')
    const [metadataUri] = await umi.uploader.upload([metadataFile])

    // Create Merkle tree
    const merkleTree = generateSigner(umi)
    await createTree(umi, {
      merkleTree,
      maxDepth: 14,
      maxBufferSize: 64,
    }).sendAndConfirm(umi)

    // Create the collection NFT
    const collectionMint = generateSigner(umi)
    const collectionMetadata = {
      name: 'My cNFT Collection',
      symbol: 'cNFT',
      uri: metadataUri,
    }

    await createAndMint(umi, {
      mint: collectionMint,
      authority: umi.identity,
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      uri: collectionMetadata.uri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: 0,
      amount: 1,
      tokenStandard: TokenStandard.NonFungible,
      isCollection: true,
    }).sendAndConfirm(umi)

    // Mint the compressed NFT
    const { signature } = await mintToCollectionV1(umi, {
      leafOwner: umi.identity.publicKey,
      merkleTree: merkleTree.publicKey,
      collectionMint: collectionMint.publicKey,
      metadata: {
        name,
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(5),
        collection: { key: collectionMint.publicKey, verified: false },
        creators: [{ address: umi.identity.publicKey, verified: false, share: 100 }],
      },
    }).sendAndConfirm(umi)

    return NextResponse.json({ 
      success: true, 
      message: 'Compressed NFT created successfully',
      signature: base58.serialize(signature)
    })
  } catch (error) {
    console.error('Error creating compressed NFT:', error)
    return NextResponse.json({ success: false, message: 'Failed to create compressed NFT' }, { status: 500 })
  }
}

