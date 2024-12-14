import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { SOLANA_RPC_URL, CREATOR_PRIVATE_KEY } from '@/config/env';

// Initialize Solana connection
const connection = new Connection(SOLANA_RPC_URL);

// Load the creator's keypair
const creatorKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(CREATOR_PRIVATE_KEY))
);

// Initialize Metaplex
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(creatorKeypair))
  .use(bundlrStorage());

export async function updateBlinkOnChain(
  mintAddress: string,
  name?: string,
  description?: string,
  imageUrl?: string,
  blinkType?: string
): Promise<string> {
  try {
    const mint = new PublicKey(mintAddress);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

    if (!nft) {
      throw new Error('Blink not found on-chain');
    }

    const { response } = await metaplex.nfts().update({
      nftOrSft: nft,
      name: name || nft.name,
      description: description || nft.description,
      image: imageUrl || nft.json?.image,
      attributes: [
        ...(nft.json?.attributes || []),
        { trait_type: 'blinkType', value: blinkType || nft.json?.attributes?.find(attr => attr.trait_type === 'blinkType')?.value }
      ],
    });

    return response.signature;
  } catch (error) {
    console.error('Error updating Blink on-chain:', error);
    throw new Error('Failed to update Blink on-chain');
  }
}

export async function deleteBlinkFromChain(mintAddress: string): Promise<string> {
  try {
    const mint = new PublicKey(mintAddress);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

    if (!nft) {
      throw new Error('Blink not found on-chain');
    }

    const { response } = await metaplex.nfts().delete({
      mintAddress: mint,
    });

    return response.signature;
  } catch (error) {
    console.error('Error deleting Blink from chain:', error);
    throw new Error('Failed to delete Blink from chain');
  }
}

export async function getBlinkFromChain(mintAddress: string) {
  try {
    const mint = new PublicKey(mintAddress);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

    if (!nft) {
      throw new Error('Blink not found on-chain');
    }

    return {
      mintAddress: nft.address.toBase58(),
      name: nft.name,
      description: nft.description,
      imageUrl: nft.json?.image,
      blinkType: nft.json?.attributes?.find(attr => attr.trait_type === 'blinkType')?.value,
    };
  } catch (error) {
    console.error('Error fetching Blink from chain:', error);
    throw new Error('Failed to fetch Blink from chain');
  }
}
