import { 
    Connection, 
    Keypair, 
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import { 
    Metaplex, 
    keypairIdentity, 
    bundlrStorage,
    toMetaplexFileFromBrowser,
    CreateCompressedNftInput,
    CreateCompressedNftOutput,
  } from '@metaplex-foundation/js';
  import { 
    createTree,
    mplBubblegum,
  } from '@metaplex-foundation/mpl-bubblegum';
  import { CNFTFormData, preparePinataMetadata } from './form-data';
  import { uploadJSONToPinata, uploadFileToPinata } from '../storage/pinata-upload';
  import { uploadToArweave } from '../storage/arweave-upload';
  import { ApiError } from '../errors/api-error';
  import { SOLANA_CLUSTER, SOLANA_COMMITMENT } from '../constants';
  
  // Initialize connection to Solana network
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || `https://api.${SOLANA_CLUSTER}.solana.com`, SOLANA_COMMITMENT);
  
  // Load the creator's keypair from environment variable
  const creatorPrivateKey = JSON.parse(process.env.CREATOR_PRIVATE_KEY || '[]');
  const creatorKeypair = Keypair.fromSecretKey(Uint8Array.from(creatorPrivateKey));
  
  // Initialize Metaplex
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(creatorKeypair))
    .use(bundlrStorage())
    .use(mplBubblegum());
  
  export async function createCNFT(formData: CNFTFormData, useArweave: boolean = false): Promise<{ mintAddress: string; metadataAddress: string }> {
    try {
      console.log('Starting cNFT creation process...');
  
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
  
      // Create a new Merkle tree for the cNFT
      console.log('Creating Merkle tree...');
      const { tree } = await createTree(metaplex, {
        maxDepth: 14,
        maxBufferSize: 64,
      });
      console.log('Merkle tree created successfully');
  
      // Prepare the cNFT input
      const input: CreateCompressedNftInput = {
        uri: metadataUrl,
        name: formData.name,
        sellerFeeBasisPoints: formData.sellerFeeBasisPoints,
        symbol: formData.symbol,
        creators: [{ address: creatorKeypair.publicKey, share: 100 }],
        isMutable: true,
        maxSupply: null,
        retainAuthority: true,
        collection: null, // Set this if the cNFT belongs to a collection
        uses: null,
        isCompressed: true,
        tree: tree.publicKey,
      };
  
      // Create the cNFT
      console.log('Creating cNFT...');
      const { nft } = await metaplex.nfts().create(input);
      console.log('cNFT created successfully');
  
      console.log(`cNFT created with mint address: ${nft.address.toBase58()}`);
      console.log(`Metadata address: ${nft.metadataAddress.toBase58()}`);
  
      return {
        mintAddress: nft.address.toBase58(),
        metadataAddress: nft.metadataAddress.toBase58(),
      };
    } catch (error) {
      console.error('Error creating cNFT:', error);
      throw new ApiError(500, 'Failed to create cNFT', [(error as Error).message]);
    }
  }
  
  // Helper function to get cNFT data
  export async function getCNFTData(mintAddress: string): Promise<CreateCompressedNftOutput> {
    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
      return nft as CreateCompressedNftOutput;
    } catch (error) {
      console.error('Error fetching cNFT data:', error);
      throw new ApiError(404, 'cNFT not found', [(error as Error).message]);
    }
  }
  
  // Helper function to update cNFT metadata
  export async function updateCNFTMetadata(mintAddress: string, updateData: Partial<CNFTFormData>): Promise<void> {
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
      });
      console.log('cNFT metadata updated successfully');
    } catch (error) {
      console.error('Error updating cNFT metadata:', error);
      throw new ApiError(500, 'Failed to update cNFT metadata', [(error as Error).message]);
    }
  }
  
  // Helper function to transfer cNFT
  export async function transferCNFT(mintAddress: string, newOwner: PublicKey): Promise<string> {
    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
      const { signature } = await metaplex.nfts().transfer({
        nftOrSft: nft,
        authority: creatorKeypair,
        fromOwner: nft.owner,
        toOwner: newOwner,
      });
      console.log('cNFT transferred successfully');
      return signature;
    } catch (error) {
      console.error('Error transferring cNFT:', error);
      throw new ApiError(500, 'Failed to transfer cNFT', [(error as Error).message]);
    }
  }
  
  // Helper function to burn cNFT
  export async function burnCNFT(mintAddress: string): Promise<string> {
    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
      const { signature } = await metaplex.nfts().delete({
        nftOrSft: nft,
        authority: creatorKeypair,
      });
      console.log('cNFT burned successfully');
      return signature;
    } catch (error) {
      console.error('Error burning cNFT:', error);
      throw new ApiError(500, 'Failed to burn cNFT', [(error as Error).message]);
    }
  }
  
  