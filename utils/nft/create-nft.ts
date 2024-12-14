import { 
  Connection, 
  Keypair, 
  PublicKey
} from '@solana/web3.js';
import { 
  Metaplex, 
  keypairIdentity, 
  bundlrStorage,
  toMetaplexFileFromBrowser,
  CreateNftInput,
  CreateNftOutput,
  Nft,
  NftWithToken,
  Sft,
  SftWithToken,
} from '@metaplex-foundation/js';
import { NFTFormData, preparePinataMetadata } from './form-data';
import { uploadJSONToPinata, uploadFileToPinata } from '../storage/pinata-upload';
import { uploadToArweave } from '../storage/arweave-upload';
import { ApiError } from '../errors/api-error';
import { SOLANA_CLUSTER, SOLANA_COMMITMENT, DEFAULT_NFT_SYMBOL } from '../constants';

// Initialize connection to Solana network
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || `https://api.${SOLANA_CLUSTER}.solana.com`, SOLANA_COMMITMENT);

// Load the creator's keypair from environment variable
const creatorPrivateKey = JSON.parse(process.env.CREATOR_PRIVATE_KEY || '[]');
const creatorKeypair = Keypair.fromSecretKey(Uint8Array.from(creatorPrivateKey));

// Initialize Metaplex
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(creatorKeypair))
  .use(bundlrStorage());

export async function createNFT(formData: NFTFormData, useArweave: boolean = false): Promise<{ mintAddress: string; metadataAddress: string }> {
  try {
    console.log('Starting NFT creation process...');

    let imageUrl: string;
    let metadataUrl: string;

    if (useArweave) {
      // Upload image to Arweave
      console.log('Uploading image to Arweave...');
      const imageBuffer = Buffer.from(formData.image.split(',')[1], 'base64');
      imageUrl = await uploadToArweave(imageBuffer);
      console.log('Image uploaded successfully to Arweave:', imageUrl);

      // Prepare and upload metadata to Arweave
      console.log('Preparing and uploading metadata to Arweave...');
      const metadata = preparePinataMetadata({ ...formData, image: imageUrl });
      metadataUrl = await uploadToArweave(Buffer.from(JSON.stringify(metadata)));
      console.log('Metadata uploaded successfully to Arweave:', metadataUrl);
    } else {
      // Upload image to Pinata
      console.log('Uploading image to Pinata...');
      const imageBuffer = Buffer.from(formData.image.split(',')[1], 'base64');
      imageUrl = await uploadFileToPinata(imageBuffer, `${formData.name}_image`);
      console.log('Image uploaded successfully to Pinata:', imageUrl);

      // Prepare and upload metadata to Pinata
      console.log('Preparing and uploading metadata to Pinata...');
      const metadata = preparePinataMetadata({ ...formData, image: imageUrl });
      metadataUrl = await uploadJSONToPinata(metadata, `${formData.name}_metadata`);
      console.log('Metadata uploaded successfully to Pinata:', metadataUrl);
    }

    // Prepare the NFT input
    const input: CreateNftInput = {
      uri: metadataUrl,
      name: formData.name,
      sellerFeeBasisPoints: formData.sellerFeeBasisPoints,
      symbol: formData.symbol || DEFAULT_NFT_SYMBOL,
      creators: [{ address: creatorKeypair.publicKey, share: 100 }],
      isMutable: true,
      maxSupply: formData.maxSupply || null,
      useNewMint: Keypair.generate(),
      collection: formData.collection ? new PublicKey(formData.collection) : null,
    };

    // Create the NFT
    console.log('Creating NFT...');
    const { nft } = await metaplex.nfts().create(input);
    console.log('NFT created successfully');

    console.log(`NFT created with mint address: ${nft.address.toBase58()}`);
    console.log(`Metadata address: ${nft.metadataAddress.toBase58()}`);

    return {
      mintAddress: nft.address.toBase58(),
      metadataAddress: nft.metadataAddress.toBase58(),
    };
  } catch (error) {
    console.error('Error creating NFT:', error);
    throw new ApiError(500, 'Failed to create NFT', [(error as Error).message]);
  }
}

// Helper function to get NFT data
export async function getNFTData(mintAddress: string): Promise<Nft | NftWithToken | Sft | SftWithToken> {
  try {
    const nftOrSft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
    if (nftOrSft.model === 'nft' || nftOrSft.model === 'sft') {
      return nftOrSft;
    } else {
      throw new Error('Unexpected asset type');
    }
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    throw new ApiError(404, 'NFT not found', [(error as Error).message]);
  }
}

// Helper function to update NFT metadata
export async function updateNFTMetadata(mintAddress: string, updateData: Partial<NFTFormData>): Promise<void> {
  try {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
    
    let newUri = nft.uri;
    if (updateData.image) {
      // Upload new image if provided
      const imageBuffer = Buffer.from(updateData.image.split(',')[1], 'base64');
      const newImageUrl = await uploadFileToPinata(imageBuffer, `${updateData.name || nft.name}_image_updated`);
      
      // Prepare and upload new metadata
      const newMetadata = preparePinataMetadata({ ...nft, ...updateData, image: newImageUrl });
      newUri = await uploadJSONToPinata(newMetadata, `${updateData.name || nft.name}_metadata_updated`);
    }

    await metaplex.nfts().update({
      nftOrSft: nft,
      name: updateData.name || nft.name,
      symbol: updateData.symbol || nft.symbol,
      uri: newUri,
      sellerFeeBasisPoints: updateData.sellerFeeBasisPoints || nft.sellerFeeBasisPoints,
      creators: updateData.creators ? updateData.creators.map(creator => ({
        address: new PublicKey(creator.address),
        share: creator.share,
      })) : nft.creators,
      isMutable: updateData.isMutable !== undefined ? updateData.isMutable : nft.isMutable,
      primarySaleHappened: updateData.primarySaleHappened !== undefined ? updateData.primarySaleHappened : nft.primarySaleHappened,
      collection: updateData.collection ? new PublicKey(updateData.collection) : nft.collection,
    });
    console.log('NFT metadata updated successfully');
  } catch (error) {
    console.error('Error updating NFT metadata:', error);
    throw new ApiError(500, 'Failed to update NFT metadata', [(error as Error).message]);
  }
}

// Helper function to transfer NFT
export async function transferNFT(mintAddress: string, newOwner: PublicKey): Promise<string> {
  try {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
    const { signature } = await metaplex.nfts().transfer({
      nftOrSft: nft,
      authority: creatorKeypair,
      fromOwner: nft.owner,
      toOwner: newOwner,
    });
    console.log('NFT transferred successfully');
    return signature;
  } catch (error) {
    console.error('Error transferring NFT:', error);
    throw new ApiError(500, 'Failed to transfer NFT', [(error as Error).message]);
  }
}

// Helper function to burn NFT
export async function burnNFT(mintAddress: string): Promise<string> {
  try {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
    const { signature } = await metaplex.nfts().delete({
      nftOrSft: nft,
      authority: creatorKeypair,
    });
    console.log('NFT burned successfully');
    return signature;
  } catch (error) {
    console.error('Error burning NFT:', error);
    throw new ApiError(500, 'Failed to burn NFT', [(error as Error).message]);
  }
}

// Helper function to verify NFT collection
export async function verifyNFTCollection(mintAddress: string, collectionMintAddress: string): Promise<string> {
  try {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
    const collectionNft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(collectionMintAddress) });
    
    const { signature } = await metaplex.nfts().verifyCollection({
      mintAddress: nft.address,
      collectionMintAddress: collectionNft.address,
      isSizedCollection: true,
    });
    
    console.log('NFT collection verified successfully');
    return signature;
  } catch (error) {
    console.error('Error verifying NFT collection:', error);
    throw new ApiError(500, 'Failed to verify NFT collection', [(error as Error).message]);
  }
}

