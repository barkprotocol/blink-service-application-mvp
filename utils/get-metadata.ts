import { PublicKey } from '@solana/web3.js';
import { Connection } from '@metaplex/mpl-core';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ApiError } from './errors/api-error';
import { SOLANA_RPC_URL } from './constants';
import { BlinkData, NFTData } from './types';

// Initialize Solana connection
const connection = new Connection(SOLANA_RPC_URL);

/**
 * Retrieve metadata for a Blink
 * @param blinkAddress The address of the Blink
 * @returns The Blink metadata
 */
export async function getBlinkMetadata(blinkAddress: string): Promise<BlinkData> {
  try {
    const blinkPublicKey = new PublicKey(blinkAddress);
    const accountInfo = await connection.getAccountInfo(blinkPublicKey);

    if (!accountInfo) {
      throw new ApiError(404, 'Blink not found', [`No account found for address: ${blinkAddress}`]);
    }

    // Deserialize the account data into BlinkData
    // This is a placeholder and should be replaced with actual deserialization logic
    const blinkData: BlinkData = {
      name: 'Sample Blink',
      description: 'This is a sample Blink description',
      purpose: 'gift',
      owner: accountInfo.owner.toBase58(),
      createdAt: new Date().toISOString(),
      // Add other fields as necessary
    };

    return blinkData;
  } catch (error) {
    console.error('Error fetching Blink metadata:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to fetch Blink metadata', [(error as Error).message]);
  }
}

/**
 * Retrieve metadata for an NFT
 * @param mintAddress The mint address of the NFT
 * @returns The NFT metadata
 */
export async function getNFTMetadata(mintAddress: string): Promise<NFTData> {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const metadataPDA = await Metadata.getPDA(mintPublicKey);
    const metadata = await Metadata.load(connection, metadataPDA);

    if (!metadata) {
      throw new ApiError(404, 'NFT metadata not found', [`No metadata found for mint address: ${mintAddress}`]);
    }

    const nftData: NFTData = {
      name: metadata.data.data.name,
      symbol: metadata.data.data.symbol,
      uri: metadata.data.data.uri,
      sellerFeeBasisPoints: metadata.data.data.sellerFeeBasisPoints,
      creators: metadata.data.data.creators?.map(creator => ({
        address: creator.address.toBase58(),
        verified: creator.verified,
        share: creator.share,
      })) || [],
      primarySaleHappened: metadata.data.primarySaleHappened,
      isMutable: metadata.data.isMutable,
      editionNonce: metadata.data.editionNonce,
      tokenStandard: metadata.data.tokenStandard,
      collection: metadata.data.collection ? {
        verified: metadata.data.collection.verified,
        key: metadata.data.collection.key.toBase58(),
      } : undefined,
      uses: metadata.data.uses ? {
        useMethod: metadata.data.uses.useMethod,
        remaining: metadata.data.uses.remaining,
        total: metadata.data.uses.total,
      } : undefined,
    };

    return nftData;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to fetch NFT metadata', [(error as Error).message]);
  }
}

/**
 * Retrieve metadata for multiple NFTs
 * @param mintAddresses An array of NFT mint addresses
 * @returns An array of NFT metadata
 */
export async function getBatchNFTMetadata(mintAddresses: string[]): Promise<NFTData[]> {
  try {
    const metadataPromises = mintAddresses.map(address => getNFTMetadata(address));
    const metadataResults = await Promise.allSettled(metadataPromises);

    const successfulResults = metadataResults
      .filter((result): result is PromiseFulfilledResult<NFTData> => result.status === 'fulfilled')
      .map(result => result.value);

    const failedAddresses = metadataResults
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result, index) => ({
        address: mintAddresses[index],
        error: result.reason,
      }));

    if (failedAddresses.length > 0) {
      console.warn('Failed to fetch metadata for some NFTs:', failedAddresses);
    }

    return successfulResults;
  } catch (error) {
    console.error('Error fetching batch NFT metadata:', error);
    throw new ApiError(500, 'Failed to fetch batch NFT metadata', [(error as Error).message]);
  }
}

/**
 * Check if an address is a valid Blink
 * @param address The address to check
 * @returns A boolean indicating if the address is a valid Blink
 */
export async function isValidBlink(address: string): Promise<boolean> {
  try {
    await getBlinkMetadata(address);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Check if an address is a valid NFT
 * @param address The address to check
 * @returns A boolean indicating if the address is a valid NFT
 */
export async function isValidNFT(address: string): Promise<boolean> {
  try {
    await getNFTMetadata(address);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return false;
    }
    throw error;
  }
}

