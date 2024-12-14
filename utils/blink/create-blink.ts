import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { BLINK_IDL } from './programs/blink_idl';
import { ApiError } from '../errors/api-error';
import { SOLANA_CLUSTER, SOLANA_COMMITMENT } from '../constants';

const BLINK_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_BLINK_PROGRAM_ID || 'BLINK_PROGRAM_ID');
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || `https://api.${SOLANA_CLUSTER}.solana.com`,
  SOLANA_COMMITMENT
);

interface BlinkParams {
  owner: PublicKey;
  name: string;
  description: string;
  blinkType: string;
  isNFT: boolean;
  isDonation: boolean;
  isGift: boolean;
  isPayment: boolean;
  isPoll: boolean;
}

export async function createBlink({
  owner,
  name,
  description,
  blinkType,
  isNFT,
  isDonation,
  isGift,
  isPayment,
  isPoll
}: BlinkParams): Promise<string> {
  try {
    const payer = Keypair.generate(); // In a real app, this would be your server's keypair
    const mintKeypair = Keypair.generate();

    const provider = new AnchorProvider(
      connection,
      {
        publicKey: payer.publicKey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      },
      { commitment: SOLANA_COMMITMENT }
    );

    const program = new Program(BLINK_IDL, BLINK_PROGRAM_ID, provider);

    const [blinkPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('blink'), mintKeypair.publicKey.toBuffer()],
      program.programId
    );

    const transaction = new Transaction();

    // Create mint account
    transaction.add(
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mintKeypair.publicKey,
        0,
        payer.publicKey,
        payer.publicKey
      )
    );

    // Create Blink account
    transaction.add(
      await program.methods.createBlink(name, description, blinkType, isNFT, isDonation, isGift, isPayment, isPoll)
        .accounts({
          blink: blinkPDA,
          mint: mintKeypair.publicKey,
          owner: owner,
          payer: payer.publicKey,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .instruction()
    );

    // Sign and send transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, mintKeypair],
      { commitment: SOLANA_COMMITMENT }
    );

    console.log(`Blink created with signature ${signature}`);

    return mintKeypair.publicKey.toBase58();
  } catch (error) {
    console.error('Error creating Blink:', error);
    throw new ApiError(500, 'Failed to create Blink', [(error as Error).message]);
  }
}

export async function getBlink(blinkAddress: string): Promise<any> {
  try {
    const blinkPublicKey = new PublicKey(blinkAddress);
    const provider = AnchorProvider.env();
    const program = new Program(BLINK_IDL, BLINK_PROGRAM_ID, provider);
    const blinkAccount = await program.account.blink.fetch(blinkPublicKey);
    return blinkAccount;
  } catch (error) {
    console.error('Error fetching Blink:', error);
    throw new ApiError(404, 'Blink not found', [(error as Error).message]);
  }
}

export async function updateBlink(blinkAddress: string, updateParams: Partial<BlinkParams>): Promise<string> {
  try {
    const blinkPublicKey = new PublicKey(blinkAddress);
    const provider = AnchorProvider.env();
    const program = new Program(BLINK_IDL, BLINK_PROGRAM_ID, provider);
    const tx = await program.methods.updateBlink(
      updateParams.name,
      updateParams.description,
      updateParams.blinkType
    )
      .accounts({
        blink: blinkPublicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();

    console.log(`Blink updated with signature ${tx}`);
    return tx;
  } catch (error) {
    console.error('Error updating Blink:', error);
    throw new ApiError(500, 'Failed to update Blink', [(error as Error).message]);
  }
}

export async function deleteBlink(blinkAddress: string): Promise<string> {
  try {
    const blinkPublicKey = new PublicKey(blinkAddress);
    const provider = AnchorProvider.env();
    const program = new Program(BLINK_IDL, BLINK_PROGRAM_ID, provider);
    const tx = await program.methods.deleteBlink()
      .accounts({
        blink: blinkPublicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();

    console.log(`Blink deleted with signature ${tx}`);
    return tx;
  } catch (error) {
    console.error('Error deleting Blink:', error);
    throw new ApiError(500, 'Failed to delete Blink', [(error as Error).message]);
  }
}

export async function getBlinksByOwner(ownerAddress: string): Promise<any[]> {
  try {
    const ownerPublicKey = new PublicKey(ownerAddress);
    const provider = AnchorProvider.env();
    const program = new Program(BLINK_IDL, BLINK_PROGRAM_ID, provider);
    const blinks = await program.account.blink.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: ownerPublicKey.toBase58(),
        },
      },
    ]);
    return blinks;
  } catch (error) {
    console.error('Error fetching Blinks by owner:', error);
    throw new ApiError(500, 'Failed to fetch Blinks', [(error as Error).message]);
  }
}

