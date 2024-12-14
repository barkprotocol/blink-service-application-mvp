import { PublicKey } from '@solana/web3.js';
import { BLINK_PURPOSES, NFT_TYPES, BLINK_STATUS } from './constants';

// Blink Types
export type BlinkPurpose = typeof BLINK_PURPOSES[keyof typeof BLINK_PURPOSES];
export type BlinkStatus = typeof BLINK_STATUS[keyof typeof BLINK_STATUS];

export interface BlinkData {
  id: string;
  name: string;
  description: string;
  purpose: BlinkPurpose;
  owner: string;
  createdAt: string;
  updatedAt: string;
  status: BlinkStatus;
  image?: string;
  expirationDate?: string;
  targetAmount?: number;
  currentAmount?: number;
  recipientAddress?: string;
  isNFT: boolean;
  isDonation: boolean;
  isGift: boolean;
  isPayment: boolean;
  isPoll: boolean;
}

export interface CreateBlinkInput {
  name: string;
  description: string;
  purpose: BlinkPurpose;
  image?: string;
  expirationDate?: Date;
  targetAmount?: number;
  recipientAddress?: string;
  isNFT: boolean;
  isDonation: boolean;
  isGift: boolean;
  isPayment: boolean;
  isPoll: boolean;
}

export interface UpdateBlinkInput {
  id: string;
  name?: string;
  description?: string;
  purpose?: BlinkPurpose;
  image?: string;
  expirationDate?: Date;
  targetAmount?: number;
  recipientAddress?: string;
  status?: BlinkStatus;
}

// NFT Types
export type NFTType = typeof NFT_TYPES[keyof typeof NFT_TYPES];

export interface NFTData {
  mintAddress: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  type: NFTType;
  animationUrl?: string;
  externalUrl?: string;
  attributes?: NFTAttribute[];
  sellerFeeBasisPoints: number;
  creators: NFTCreator[];
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce?: number;
  tokenStandard?: number;
  collection?: {
    verified: boolean;
    key: string;
  };
  uses?: {
    useMethod: number;
    remaining: number;
    total: number;
  };
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTCreator {
  address: string;
  verified: boolean;
  share: number;
}

export interface CreateNFTInput {
  name: string;
  symbol: string;
  description: string;
  image: File;
  type: NFTType;
  animationUrl?: string;
  externalUrl?: string;
  attributes?: NFTAttribute[];
  sellerFeeBasisPoints: number;
  creators?: Omit<NFTCreator, 'verified'>[];
  isMutable?: boolean;
  maxSupply?: number;
  collection?: string;
}

export interface UpdateNFTInput {
  mintAddress: string;
  name?: string;
  symbol?: string;
  description?: string;
  image?: File;
  type?: NFTType;
  animationUrl?: string;
  externalUrl?: string;
  attributes?: NFTAttribute[];
  sellerFeeBasisPoints?: number;
  primarySaleHappened?: boolean;
  isMutable?: boolean;
}

// User Types
export interface UserData {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

// Transaction Types
export interface TransactionData {
  id: string;
  type: 'create' | 'update' | 'delete' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  fromAddress: string;
  toAddress?: string;
  amount?: number;
  fee?: number;
  timestamp: string;
  signature: string;
  blinkId?: string;
  nftMintAddress?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Wallet Types
export interface WalletBalance {
  sol: number;
  tokens: {
    [mintAddress: string]: {
      balance: number;
      decimals: number;
      symbol: string;
    };
  };
}

// Search Types
export interface SearchResult {
  type: 'blink' | 'nft' | 'user';
  id: string;
  name: string;
  image?: string;
}

// Notification Types
export interface NotificationData {
  id: string;
  userId: string;
  type: 'blink_created' | 'blink_updated' | 'nft_created' | 'nft_transferred' | 'payment_received';
  message: string;
  read: boolean;
  createdAt: string;
}

