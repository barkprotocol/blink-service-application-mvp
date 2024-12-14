import { API_ENDPOINTS, ERROR_MESSAGES } from './constants';

// Define the base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://app.barkprotocol.net/api/v1';

// Define a generic API response type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Define types for different API calls
interface CreateBlinkResponse {
  blinkMintAddress: string;
}

interface CreateNFTResponse {
  nftMintAddress: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

// Generic function to handle API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object | FormData
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {};
  let requestBody: string | FormData | undefined;

  if (body) {
    if (body instanceof FormData) {
      requestBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || ERROR_MESSAGES.CREATION_FAILED);
    }

    return data;
  } catch (error) {
    console.error(`API call error (${endpoint}):`, error);
    throw error;
  }
}

// Function to create a Blink
export async function createBlink(blinkData: FormData): Promise<CreateBlinkResponse> {
  const response = await apiCall<CreateBlinkResponse>(API_ENDPOINTS.CREATE_BLINK, 'POST', blinkData);
  return response.data!;
}

// Function to create an NFT
export async function createNFT(nftData: FormData): Promise<CreateNFTResponse> {
  const response = await apiCall<CreateNFTResponse>(API_ENDPOINTS.CREATE_NFT, 'POST', nftData);
  return response.data!;
}

// Function to create a cNFT
export async function createCNFT(cnftData: FormData): Promise<CreateNFTResponse> {
  const response = await apiCall<CreateNFTResponse>(API_ENDPOINTS.CREATE_CNFT, 'POST', cnftData);
  return response.data!;
}

// Function to fetch a Blink by ID
export async function fetchBlink(blinkId: string): Promise<any> {
  const response = await apiCall<any>(`/blinks/${blinkId}`, 'GET');
  return response.data!;
}

// Function to fetch an NFT by ID
export async function fetchNFT(nftId: string): Promise<any> {
  const response = await apiCall<any>(`/nfts/${nftId}`, 'GET');
  return response.data!;
}

// Add more API functions as needed...

export { ApiResponse };