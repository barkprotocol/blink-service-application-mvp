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
    walletAdapterIdentity,
  } from '@metaplex-foundation/js';
  import { 
    createTree,
    mplBubblegum,
  } from '@metaplex-foundation/mpl-bubblegum';
  import { CNFTFormData } from './form-data';
  import { uploadJSONToPinata, uploadFileToPinata } from '../storage/pinata-upload';
  import { uploadToArweave } from '../storage/arweave-upload';
  import { ApiError } from '../errors/api-error';
  import { SOLANA_CLUSTER, SOLANA_COMMITMENT } from '../constants';
  import { WalletContextState } from '@solana/wallet-adapter-react';
  
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
  
  type StorageOption = 'pinata' | 'arweave' | 'local';
  
  export async function mintCNFT(formData: CNFTFormData, storageOption: StorageOption = 'pinata'): Promise<{ mintAddress: string; metadataAddress: string }> {
    try {
      console.log('Starting CNFT minting process...');
  
      let imageUrl: string;
      let metadataUrl: string;
  
      // Upload image
      console.log(`Uploading image using ${storageOption}...`);
      const imageBuffer = Buffer.from(formData.image.split(',')[1], 'base64');
      
      switch (storageOption) {
        case 'pinata':
          imageUrl = await uploadFileToPinata(imageBuffer, `${formData.name}_image`);
          break;
        case 'arweave':
          imageUrl = await uploadToArweave(imageBuffer);
          break;
        case 'local':
          const { uri: imageUri } = await metaplex.nfts().uploadMetadata({
            name: formData.name,
            image: imageBuffer,
          });
          imageUrl = imageUri;
          break;
      }
      console.log('Image uploaded successfully:', imageUrl);
  
      // Prepare metadata
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        attributes: [
          { trait_type: 'Royalty Percentage', value: formData.royaltyPercentage.toString() }
        ],
      };
  
      // Upload metadata
      console.log(`Uploading metadata using ${storageOption}...`);
      switch (storageOption) {
        case 'pinata':
          metadataUrl = await uploadJSONToPinata(metadata, `${formData.name}_metadata`);
          break;
        case 'arweave':
          metadataUrl = await uploadToArweave(Buffer.from(JSON.stringify(metadata)));
          break;
        case 'local':
          const { uri } = await metaplex.nfts().uploadMetadata(metadata);
          metadataUrl = uri;
          break;
      }
      console.log('Metadata uploaded successfully:', metadataUrl);
  
      // Create a new Merkle tree for the CNFT
      console.log('Creating Merkle tree...');
      const { tree } = await createTree(metaplex, {
        maxDepth: 14,
        maxBufferSize: 64,
      });
      console.log('Merkle tree created successfully');
  
      // Prepare the CNFT input
      const input: CreateCompressedNftInput = {
        uri: metadataUrl,
        name: formData.name,
        sellerFeeBasisPoints: formData.royaltyPercentage * 100, // Convert percentage to basis points
        symbol: 'CNFT',
        creators: [{ address: creatorKeypair.publicKey, share: 100 }],
        isMutable: true,
        maxSupply: null,
        retainAuthority: true,
        collection: null, // Set this if the CNFT belongs to a collection
        uses: null,
        isCompressed: true,
        tree: tree.publicKey,
      };
  
      // Create the CNFT
      console.log('Minting CNFT...');
      const { nft } = await metaplex.nfts().create(input);
      console.log('CNFT minted successfully');
  
      console.log(`CNFT minted with address: ${nft.address.toBase58()}`);
      console.log(`Metadata address: ${nft.metadataAddress.toBase58()}`);
  
      return {
        mintAddress: nft.address.toBase58(),
        metadataAddress: nft.metadataAddress.toBase58(),
      };
    } catch (error) {
      console.error('Error minting CNFT:', error);
      throw new ApiError(500, 'Failed to mint CNFT', [(error as Error).message]);
    }
  }
  
  export async function getCNFTData(mintAddress: string): Promise<CreateCompressedNftOutput> {
    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
      return nft as CreateCompressedNftOutput;
    } catch (error) {
      console.error('Error fetching CNFT data:', error);
      throw new ApiError(404, 'CNFT not found', [(error as Error).message]);
    }
  }
  
  export async function transferCNFT(mintAddress: string, newOwner: PublicKey): Promise<string> {
    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
      const { signature } = await metaplex.nfts().transfer({
        nftOrSft: nft,
        authority: creatorKeypair,
        fromOwner: nft.owner,
        toOwner: newOwner,
      });
      console.log('CNFT transferred successfully');
      return signature;
    } catch (error) {
      console.error('Error transferring CNFT:', error);
      throw new ApiError(500, 'Failed to transfer CNFT', [(error as Error).message]);
    }
  }
  
  export async function burnCNFT(mintAddress: string): Promise<string> {
    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
      const { signature } = await metaplex.nfts().delete({
        nftOrSft: nft,
        authority: creatorKeypair,
      });
      console.log('CNFT burned successfully');
      return signature;
    } catch (error) {
      console.error('Error burning CNFT:', error);
      throw new ApiError(500, 'Failed to burn CNFT', [(error as Error).message]);
    }
  }
  
  