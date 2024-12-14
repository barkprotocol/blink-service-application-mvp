import { API_ENDPOINTS, ERROR_MESSAGES, API_TIMEOUT, MAX_RETRY_ATTEMPTS, RETRY_DELAY } from './constants';

// Define the base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

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

interface BlinkData {
  id: string;
  name: string;
  description: string;
  blinkType: string;
  isNFT: boolean;
  isDonation: boolean;
  isGift: boolean;
  isPayment: boolean;
  isPoll: boolean;
  image?: string;
  expirationDate?: string;
  targetAmount?: number;
  recipientAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// Generic function to handle API calls with retry logic
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object | FormData,
  retryCount: number = 0
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || ERROR_MESSAGES.CREATION_FAILED);
    }

    return data;
  } catch (error) {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      console.warn(`API call failed, retrying (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return apiCall<T>(endpoint, method, body, retryCount + 1);
    }
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
export async function fetchBlink(blinkId: string): Promise<BlinkData> {
  const response = await apiCall<BlinkData>(`${API_ENDPOINTS.GET_BLINK}/${blinkId}`, 'GET');
  return response.data!;
}

// Function to fetch an NFT by ID
export async function fetchNFT(nftId: string): Promise<any> {
  const response = await apiCall<any>(`${API_ENDPOINTS.CREATE_NFT}/${nftId}`, 'GET');
  return response.data!;
}

// Function to update a Blink
export async function updateBlink(blinkId: string, blinkData: FormData): Promise<BlinkData> {
  const response = await apiCall<BlinkData>(`${API_ENDPOINTS.UPDATE_BLINK}/${blinkId}`, 'PUT', blinkData);
  return response.data!;
}

// Function to delete a Blink
export async function deleteBlink(blinkId: string): Promise<void> {
  await apiCall(`${API_ENDPOINTS.DELETE_BLINK}/${blinkId}`, 'DELETE');
}

// Function to fetch all Blinks
export async function fetchAllBlinks(): Promise<BlinkData[]> {
  const response = await apiCall<BlinkData[]>(API_ENDPOINTS.GET_BLINK, 'GET');
  return response.data!;
}

// Function to fetch Blinks by owner
export async function fetchBlinksByOwner(ownerAddress: string): Promise<BlinkData[]> {
  const response = await apiCall<BlinkData[]>(`${API_ENDPOINTS.GET_BLINK}?owner=${ownerAddress}`, 'GET');
  return response.data!;
}

export { ApiResponse };

