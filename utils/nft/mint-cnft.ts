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
  nftStorage,
  toMetaplexFileFromBrowser,
  CreateCompressedNftInput,
  CreateCompressedNftOutput,
} from '@metaplex-foundation/js';
import { 
  createTree,
  mplBubblegum,
} from '@metaplex-foundation/mpl-bubblegum';
import { uploadJSONToPinata, uploadFileToPinata } from '../storage/pinata-upload';
import { ApiError } from '../errors/api-error';
import { SOLANA_CLUSTER, SOLANA_COMMITMENT } from '../constants';

// Initialize connection to Solana network
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || `https://api.${SOLANA_CLUSTER}.solana.com`, SOLANA_COMMITMENT);

// Initialize Metaplex
const metaplex = Metaplex.make(connection)
  .use(nftStorage())
  .use(mplBubblegum());

interface MintCNFTParams {
  name: string;
  description: string;
  image: string;
  royaltyPercentage: number;
  creatorAddress: string;
  recipientAddress: string;
  collectionAddress: string | null;
}

export async function mintCNFT({
  name,
  description,
  image,
  royaltyPercentage,
  creatorAddress,
  recipientAddress,
  collectionAddress
}: MintCNFTParams): Promise<{ mintAddress: string; metadataAddress: string }> {
  try {
    console.log('Starting CNFT minting process...');

    // Upload image to NFT.Storage
    console.log('Uploading image to NFT.Storage...');
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    const imageFile = toMetaplexFileFromBrowser(new Blob([imageBuffer]), 'image.png');
    const imageUri = await metaplex.storage().upload(imageFile);
    console.log('Image uploaded successfully to NFT.Storage:', imageUri);

    // Prepare and upload metadata to NFT.Storage
    console.log('Preparing and uploading metadata to NFT.Storage...');
    const metadata = {
      name,
      description,
      image: imageUri,
      attributes: [
        { trait_type: 'Royalty Percentage', value: royaltyPercentage.toString() }
      ],
    };
    const metadataFile = toMetaplexFileFromBrowser(new Blob([JSON.stringify(metadata)]), 'metadata.json');
    const metadataUri = await metaplex.storage().upload(metadataFile);
    console.log('Metadata uploaded successfully to NFT.Storage:', metadataUri);

    // Create a new Merkle tree for the CNFT
    console.log('Creating Merkle tree...');
    const { tree } = await createTree(metaplex, {
      maxDepth: 14,
      maxBufferSize: 64,
    });
    console.log('Merkle tree created successfully');

    // Prepare the CNFT input
    const input: CreateCompressedNftInput = {
      uri: metadataUri,
      name,
      sellerFeeBasisPoints: royaltyPercentage * 100, // Convert percentage to basis points
      symbol: 'CNFT',
      creators: [{ address: new PublicKey(creatorAddress), share: 100 }],
      isMutable: true,
      maxSupply: null,
      retainAuthority: true,
      collection: collectionAddress ? new PublicKey(collectionAddress) : null,
      uses: null,
      isCompressed: true,
      tree: tree.publicKey,
      tokenOwner: new PublicKey(recipientAddress), // Set the token owner to the recipient
    };

    // Create the CNFT
    console.log('Minting CNFT...');
    const { nft } = await metaplex.nfts().create(input);
    console.log('CNFT minted successfully');

    if (collectionAddress) {
      await metaplex.nfts().verifyCollection({
        mintAddress: nft.address,
        collectionMintAddress: new PublicKey(collectionAddress),
        isSizedCollection: true,
      });
      console.log('CNFT added to collection successfully');
    }

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
