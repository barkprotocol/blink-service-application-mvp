import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    NftWithToken,
  } from '@metaplex-foundation/js';
  import { NFTStorage, File } from 'nft.storage';
  import * as anchor from '@coral-xyz/anchor';
  import { BARK_BLINKS_PROGRAM_ID } from './solana/constants';
  import { BarkBlinksProgram } from './programs';
  
  // Initialize Solana connection
  const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed');
  
  // Initialize Metaplex
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SOLANA_KEYPAIR!)))))
    .use(bundlrStorage());
  
  // Initialize NFT.Storage client
  const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY! });
  
  // Initialize Anchor provider and program
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SOLANA_KEYPAIR!)))),
    { commitment: 'confirmed' }
  );
  const program = new anchor.Program(BarkBlinksProgram.IDL, BARK_BLINKS_PROGRAM_ID, provider);
  
  export async function mintNFT(
    mintAddress: string,
    creatorAddress: string,
    name: string,
    description: string,
    imageUrl: string,
    attributes: { trait_type: string; value: string | number }[],
    royaltyPercentage: number
  ): Promise<{ signature: string; mintAddress: string }> {
    try {
      // Upload image to NFT.storage
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
      const imageCid = await nftStorage.storeBlob(imageFile);
      const imageUri = `https://ipfs.io/ipfs/${imageCid}`;
  
      // Create metadata
      const metadata = {
        name,
        description,
        image: imageUri,
        attributes,
        properties: {
          files: [{ uri: imageUri, type: 'image/png' }],
          category: 'image',
          creators: [{ address: creatorAddress, share: 100 }],
        },
      };
  
      // Upload metadata to NFT.storage
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const metadataCid = await nftStorage.storeBlob(metadataFile);
      const metadataUri = `https://ipfs.io/ipfs/${metadataCid}`;
  
      // Create NFT using Metaplex
      const { nft } = await metaplex.nfts().create({
        uri: metadataUri,
        name,
        sellerFeeBasisPoints: royaltyPercentage * 100, // Convert percentage to basis points
        creators: [{ address: new PublicKey(creatorAddress), share: 100 }],
      });
  
      // Call the BARK Blinks program to register the NFT
      const mintKeypair = Keypair.generate();
      const transaction = await program.methods
        .mintNft(
          nft.mint.address.toBase58(),
          name,
          description,
          metadataUri,
          royaltyPercentage
        )
        .accounts({
          mint: mintKeypair.publicKey,
          metadata: nft.metadataAddress,
          masterEdition: nft.masterEditionAddress,
          creator: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          tokenMetadataProgram: anchor.utils.token.METADATA_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
  
      return {
        signature: transaction,
        mintAddress: nft.address.toBase58(),
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }
  
  export async function transferNFT(
    fromAddress: string,
    toAddress: string,
    mintAddress: string
  ): Promise<{ signature: string }> {
    try {
      const fromPublicKey = new PublicKey(fromAddress);
      const toPublicKey = new PublicKey(toAddress);
      const mintPublicKey = new PublicKey(mintAddress);
  
      const transaction = await program.methods
        .transferNft(toPublicKey)
        .accounts({
          from: fromPublicKey,
          to: toPublicKey,
          mint: mintPublicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
  
      return { signature: transaction };
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }
  
  export async function burnNFT(
    ownerAddress: string,
    mintAddress: string
  ): Promise<{ signature: string }> {
    try {
      const ownerPublicKey = new PublicKey(ownerAddress);
      const mintPublicKey = new PublicKey(mintAddress);
  
      const transaction = await program.methods
        .burnNft()
        .accounts({
          owner: ownerPublicKey,
          mint: mintPublicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          metadata: anchor.utils.token.METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
  
      return { signature: transaction };
    } catch (error) {
      console.error('Error burning NFT:', error);
      throw error;
    }
  }
  
  export async function getAccountBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / anchor.web3.LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }
  
  export async function getNFTMetadata(mintAddress: string): Promise<any> {
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
      return nft.json;
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      throw error;
    }
  }