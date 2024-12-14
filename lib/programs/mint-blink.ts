import {
  Connection,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import {
  createV1,
  Creator,
  TokenStandard,
  PrintSupply,
} from '@metaplex-foundation/mpl-core';
import {
  RPC_URL,
  BLINK_NFT_SYMBOL,
  BLINK_NFT_NAME_PREFIX,
  BLINK_ROYALTY_PERCENTAGE,
  MINT_API_URL,
  NFT_METADATA_API_URL,
  BLINK_PROGRAM_ID,
  IDL,
} from '@/utils/constants';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import * as anchor from '@coral-xyz/anchor';

interface MintBlinkResult {
  mint: string;
  tokenAccount: string;
  metadataUri: string;
  nftAddress: string;
  blinkAddress: string;
}

export async function mintBlink(wallet: any, blink: BlinkState): Promise<MintBlinkResult> {
  const connection = new Connection(RPC_URL, 'confirmed');
  const payer = wallet.publicKey;

  // Initialize Metaplex instance
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet.payer))
    .use(bundlrStorage());

  try {
    // Step 1: Create a new mint
    const mint = await createMint(connection, wallet.payer, payer, payer, 0);

    // Step 2: Get or create associated token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer,
      mint,
      payer
    );

    // Step 3: Mint token
    await mintTo(connection, wallet.payer, mint, tokenAccount.address, wallet.payer, 1);

    // Step 4: Generate NFT image
    const imageUri = await generateNFTImageAndUpload(metaplex, blink);

    // Step 5: Create metadata
    const metadataUri = await createMetadata(imageUri, blink, payer);

    // Step 6: Mint NFT
    const nft = await createMetaplexNFT(connection, wallet, mint, metadataUri, payer);

    // Step 7: Create Blink on-chain
    const blinkAddress = await createBlinkOnChain(connection, wallet, metadataUri, payer);

    // Step 8: Notify backend via mint API
    await notifyMintAPI(mint, metadataUri, nft.address, payer);

    return {
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.address.toBase58(),
      metadataUri,
      nftAddress: nft.address.toBase58(),
      blinkAddress: blinkAddress.toBase58(),
    };
  } catch (error) {
    console.error('Error in mintBlink:', error);
    throw error;
  }
}

async function generateNFTImageAndUpload(metaplex: Metaplex, blink: BlinkState): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = blink.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = blink.textColor;
    ctx.font = `${blink.fontSize}px ${blink.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(blink.text, canvas.width / 2, canvas.height / 2);
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
  if (!blob) throw new Error('Failed to create image blob');

  const imageFile = new File([blob], 'blink.png', { type: 'image/png' });
  return await metaplex.storage().upload(imageFile);
}

async function createMetadata(imageUri: string, blink: BlinkState, payer: PublicKey): Promise<string> {
  const response = await fetch(NFT_METADATA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${BLINK_NFT_NAME_PREFIX} ${blink.text.slice(0, 20)}...`,
      symbol: BLINK_NFT_SYMBOL,
      description: blink.text,
      image: imageUri,
      attributes: [
        { trait_type: 'Font Size', value: blink.fontSize },
        { trait_type: 'Font Family', value: blink.fontFamily },
        { trait_type: 'Background Color', value: blink.bgColor },
        { trait_type: 'Text Color', value: blink.textColor },
        { trait_type: 'Animated', value: blink.isAnimated },
      ],
      solanaAddress: payer.toBase58(),
    }),
  });

  if (!response.ok) throw new Error('Failed to create NFT metadata');
  const metadata = await response.json();
  return await metaplex.storage().upload(metadata);
}

async function createMetaplexNFT(connection: Connection, wallet: any, mint: PublicKey, metadataUri: string, payer: PublicKey) {
  const { nft } = await createV1(connection, wallet.payer, {
    mint,
    name: `${BLINK_NFT_NAME_PREFIX} NFT`,
    symbol: BLINK_NFT_SYMBOL,
    uri: metadataUri,
    sellerFeeBasisPoints: BLINK_ROYALTY_PERCENTAGE,
    creators: [new Creator({ address: payer, verified: true, share: 100 })],
    tokenStandard: TokenStandard.NonFungible,
    printSupply: new PrintSupply({ type: 0 }),
  });

  return nft;
}

async function createBlinkOnChain(connection: Connection, wallet: any, metadataUri: string, payer: PublicKey): Promise<PublicKey> {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(IDL, BLINK_PROGRAM_ID, provider);
  const [blinkPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('blink'), payer.toBuffer()],
    program.programId
  );

  await program.methods
    .createBlink(metadataUri)
    .accounts({
      blink: blinkPda,
      user: payer,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return blinkPda;
}

async function notifyMintAPI(mint: PublicKey, metadataUri: string, nftAddress: PublicKey, payer: PublicKey) {
  const response = await fetch(MINT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nftAddress: nftAddress.toBase58(),
      metadataUri,
      walletAddress: payer.toBase58(),
    }),
  });

  if (!response.ok) throw new Error('Failed to call mint API');
}
