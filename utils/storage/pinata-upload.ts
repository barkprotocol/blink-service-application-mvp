import axios from 'axios';
import FormData from 'form-data';
import { ApiError } from '../errors/api-error';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error('Pinata API keys are not set in the environment variables.');
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export async function uploadFileToPinata(file: Buffer, fileName: string): Promise<string> {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  data.append('file', file, fileName);

  try {
    const response = await axios.post<PinataResponse>(url, data, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw new ApiError(500, 'Failed to upload file to Pinata', [(error as Error).message]);
  }
}

export async function uploadJSONToPinata(json: object, name: string): Promise<string> {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const data = JSON.stringify({
    pinataMetadata: {
      name: name,
    },
    pinataContent: json,
  });

  try {
    const response = await axios.post<PinataResponse>(url, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new ApiError(500, 'Failed to upload JSON to Pinata', [(error as Error).message]);
  }
}

export async function uploadNFTMetadataToPinata(
  name: string,
  description: string,
  image: string,
  attributes: Array<{ trait_type: string; value: string }>
): Promise<string> {
  const metadata = {
    name,
    description,
    image,
    attributes,
  };

  return uploadJSONToPinata(metadata, `${name} Metadata`);
}

