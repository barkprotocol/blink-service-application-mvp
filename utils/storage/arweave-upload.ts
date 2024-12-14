import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { ApiError } from '@/utils/errors/api-error';

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

// Load Arweave wallet from environment variable
let wallet: JWKInterface;
try {
  wallet = JSON.parse(process.env.ARWEAVE_WALLET_JSON || '');
} catch (error) {
  console.error('Failed to parse Arweave wallet:', error);
  throw new Error('Arweave wallet configuration is invalid');
}

export async function uploadToArweave(file: File): Promise<string> {
  try {
    // Read file data
    const data = await file.arrayBuffer();

    // Prepare transaction
    const transaction = await arweave.createTransaction({ data: Buffer.from(data) }, wallet);
    transaction.addTag('Content-Type', file.type);

    // Sign transaction
    await arweave.transactions.sign(transaction, wallet);

    // Submit transaction
    const response = await arweave.transactions.post(transaction);

    if (response.status !== 200) {
      throw new Error(`Failed to submit transaction: ${response.statusText}`);
    }

    // Get transaction ID
    const id = transaction.id;

    // Construct and return Arweave URL
    return `https://arweave.net/${id}`;
  } catch (error) {
    console.error('Error uploading to Arweave:', error);
    throw new ApiError(500, 'Failed to upload file to Arweave', [(error as Error).message]);
  }
}

// Helper function to chunk large files (if needed)
async function* chunkFile(file: File, chunkSize: number): AsyncGenerator<Uint8Array> {
  let offset = 0;
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const arrayBuffer = await chunk.arrayBuffer();
    yield new Uint8Array(arrayBuffer);
    offset += chunkSize;
  }
}

// Function to upload large files in chunks
export async function uploadLargeFileToArweave(file: File, chunkSize: number = 256 * 1024): Promise<string> {
  try {
    // Create a transaction for the file
    const transaction = await arweave.createTransaction({ data: file.size.toString() }, wallet);
    transaction.addTag('Content-Type', file.type);

    // Sign the transaction
    await arweave.transactions.sign(transaction, wallet);

    // Get the uploader
    const uploader = await arweave.transactions.getUploader(transaction);

    // Upload the file chunks
    for await (const chunk of chunkFile(file, chunkSize)) {
      await uploader.uploadChunk(chunk);
    }

    // Get transaction ID
    const id = transaction.id;

    // Construct and return Arweave URL
    return `https://arweave.net/${id}`;
  } catch (error) {
    console.error('Error uploading large file to Arweave:', error);
    throw new ApiError(500, 'Failed to upload large file to Arweave', [(error as Error).message]);
  }
}

