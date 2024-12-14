import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { NFTData, BlinkData, WalletBalance } from './types';
import { SOLANA_CLUSTER, SOLANA_RPC_URL } from './constants';
import { ApiError } from './errors/api-error';

// Initialize Solana connection
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Get the balance of a Solana account
 * @param publicKey The public key of the account
 * @returns The balance in SOL
 */
export async function getAccountBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw new ApiError(500, 'Failed to fetch account balance', [(error as Error).message]);
  }
}

/**
 * Get the balance of multiple tokens for a Solana account
 * @param publicKey The public key of the account
 * @param tokenAddresses An array of token mint addresses
 * @returns The wallet balance including SOL and token balances
 */
export async function getWalletBalance(publicKey: PublicKey, tokenAddresses: string[]): Promise<WalletBalance> {
  try {
    const solBalance = await getAccountBalance(publicKey);
    const tokenBalances: WalletBalance['tokens'] = {};

    for (const tokenAddress of tokenAddresses) {
      const mintPublicKey = new PublicKey(tokenAddress);
      const token = new Token(connection, mintPublicKey, TOKEN_PROGRAM_ID, Keypair.generate());
      const tokenAccountInfo = await token.getAccountInfo(publicKey);
      
      tokenBalances[tokenAddress] = {
        balance: Number(tokenAccountInfo.amount),
        decimals: tokenAccountInfo.decimals,
        symbol: await token.getMintInfo().then(info => info.symbol || 'Unknown'),
      };
    }

    return {
      sol: solBalance,
      tokens: tokenBalances,
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw new ApiError(500, 'Failed to fetch wallet balance', [(error as Error).message]);
  }
}

/**
 * Send SOL from one account to another
 * @param wallet The wallet context state
 * @param recipient The recipient's public key
 * @param amount The amount of SOL to send
 * @returns The transaction signature
 */
export async function sendSol(wallet: WalletContextState, recipient: string, amount: number): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new ApiError(400, 'Wallet not connected', ['Wallet must be connected to send SOL']);
  }

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(recipient),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error sending SOL:', error);
    throw new ApiError(500, 'Failed to send SOL', [(error as Error).message]);
  }
}

/**
 * Create a new Solana account
 * @returns The new account's keypair
 */
export function createSolanaAccount(): Keypair {
  return Keypair.generate();
}

/**
 * Airdrop SOL to an account (only works on devnet)
 * @param publicKey The public key of the account to receive the airdrop
 * @param amount The amount of SOL to airdrop
 * @returns The transaction signature
 */
export async function requestAirdrop(publicKey: PublicKey, amount: number): Promise<string> {
  if (SOLANA_CLUSTER !== 'devnet') {
    throw new ApiError(400, 'Airdrop not available', ['Airdrop is only available on devnet']);
  }

  try {
    const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    throw new ApiError(500, 'Failed to request airdrop', [(error as Error).message]);
  }
}

/**
 * Get the metadata for a Solana NFT
 * @param mintAddress The mint address of the NFT
 * @returns The NFT metadata
 */
export async function getNFTMetadata(mintAddress: string): Promise<NFTData> {
  // This is a placeholder implementation. In a real-world scenario,
  // you would interact with the Metaplex protocol to fetch NFT metadata.
  // For now, we'll return mock data.
  const mockNFTData: NFTData = {
    mintAddress,
    name: 'Mock NFT',
    symbol: 'MOCK',
    description: 'This is a mock NFT for demonstration purposes',
    image: 'https://example.com/mock-nft.png',
    type: 'standard',
    sellerFeeBasisPoints: 500,
    creators: [
      {
        address: 'MOCK_CREATOR_ADDRESS',
        verified: true,
        share: 100,
      },
    ],
    primarySaleHappened: false,
    isMutable: true,
  };

  return mockNFTData;
}

/**
 * Get the metadata for a Blink
 * @param blinkAddress The address of the Blink
 * @returns The Blink metadata
 */
export async function getBlinkMetadata(blinkAddress: string): Promise<BlinkData> {
  // This is a placeholder implementation. In a real-world scenario,
  // you would fetch the Blink data from your program on the Solana blockchain.
  // For now, we'll return mock data.
  const mockBlinkData: BlinkData = {
    id: blinkAddress,
    name: 'Mock Blink',
    description: 'This is a mock Blink for demonstration purposes',
    purpose: 'gift',
    owner: 'MOCK_OWNER_ADDRESS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    isNFT: false,
    isDonation: false,
    isGift: true,
    isPayment: false,
    isPoll: false,
  };

  return mockBlinkData;
}

/**
 * Validate a Solana public key
 * @param publicKey The public key to validate
 * @returns True if the public key is valid, false otherwise
 */
export function isValidPublicKey(publicKey: string): boolean {
  try {
    new PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the Solana explorer URL for a transaction or address
 * @param signature The transaction signature or address
 * @param isAddress Whether the signature is an address
 * @returns The Solana explorer URL
 */
export function getSolanaExplorerUrl(signature: string, isAddress: boolean = false): string {
  const baseUrl = SOLANA_CLUSTER === 'mainnet-beta'
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com/?cluster=${SOLANA_CLUSTER}`;

  const path = isAddress ? 'address' : 'tx';
  return `${baseUrl}/${path}/${signature}`;
}

/**
 * Estimate the transaction fee for a given transaction
 * @param transaction The transaction to estimate the fee for
 * @returns The estimated fee in SOL
 */
export async function estimateTransactionFee(transaction: Transaction): Promise<number> {
  try {
    const { feeCalculator } = await connection.getRecentBlockhash();
    const fee = await transaction.getEstimatedFee(connection);
    return fee ? fee / LAMPORTS_PER_SOL : 0;
  } catch (error) {
    console.error('Error estimating transaction fee:', error);
    throw new ApiError(500, 'Failed to estimate transaction fee', [(error as Error).message]);
  }
}

export { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction };
