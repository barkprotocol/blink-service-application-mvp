// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// NFT Types
export const NFT_TYPES = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
  LIMITED_EDITION: 'limited',
} as const;

export type NFTType = typeof NFT_TYPES[keyof typeof NFT_TYPES];

// Blink Purposes
export const BLINK_PURPOSES = {
  GIFT: 'gift',
  NFT: 'nft',
  PAYMENT: 'payment',
  CREATE_BLINK: 'blink',
  DONATION: 'donation',
  POLL: 'poll',
} as const;

export type BlinkPurpose = typeof BLINK_PURPOSES[keyof typeof BLINK_PURPOSES];

// File Upload Constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'] as const;

// API Endpoints
export const API_ENDPOINTS = {
  CREATE_BLINK: '/api/v1/blinks',
  GET_BLINK: '/api/v1/blinks',
  UPDATE_BLINK: '/api/v1/blinks',
  DELETE_BLINK: '/api/v1/blinks',
  CREATE_NFT: '/api/v1/nfts',
  CREATE_CNFT: '/api/v1/cnfts',
} as const;

// Blockchain Constants
export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet';
export const SOLANA_COMMITMENT = 'confirmed' as const;
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// UI Constants
export const TOAST_DURATION = 5000; // milliseconds

// Sharing Platforms
export const SHARING_PLATFORMS = {
  X: 'x',
  FACEBOOK: 'facebook',
  TELEGRAM: 'telegram',
  DISCORD: 'discord',
} as const;

export type SharingPlatform = typeof SHARING_PLATFORMS[keyof typeof SHARING_PLATFORMS];

// Metadata Standards
export const METADATA_STANDARDS = {
  METAPLEX: 'metaplex',
  OPENSEA: 'opensea',
} as const;

export type MetadataStandard = typeof METADATA_STANDARDS[keyof typeof METADATA_STANDARDS];

// Default Values
export const DEFAULT_NFT_SYMBOL = 'BLINK';
export const DEFAULT_SELLER_FEE_BASIS_POINTS = 500; // 5%

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Wallet not connected. Please connect your wallet to proceed.',
  MISSING_INFORMATION: 'Please fill in all required fields.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.',
  CREATION_FAILED: 'Failed to create. Please try again.',
  UPDATE_FAILED: 'Failed to update. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  FETCH_FAILED: 'Failed to fetch data. Please try again.',
  INVALID_INPUT: 'Invalid input. Please check your entries and try again.',
} as const;

// Blink Status
export const BLINK_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type BlinkStatus = typeof BLINK_STATUS[keyof typeof BLINK_STATUS];

// Transaction Types
export const TRANSACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  TRANSFER: 'transfer',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Date Format
export const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Currency
export const DEFAULT_CURRENCY = 'SOL';

// Timeouts
export const API_TIMEOUT = 30000; // 30 seconds

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  WALLET_AUTOCONNECT: 'walletAutoConnect',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_POLLS: true,
  ENABLE_DONATIONS: true,
  ENABLE_CNFTS: true,
} as const;

// Blink Creation Fee
export const BLINK_CREATION_FEE_PERCENTAGE = 2;
export const SOLANA_CREATION_FEE = 0.00001 * 1e9; // 0.00001 SOL in lamports

// Treasury Wallet
export const TREASURY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS;

// Arweave Configuration
export const ARWEAVE_HOST = 'arweave.net';
export const ARWEAVE_PORT = 443;
export const ARWEAVE_PROTOCOL = 'https';

// Pinata Configuration
export const PINATA_API_URL = 'https://api.pinata.cloud';

// Blink Expiration
export const DEFAULT_BLINK_EXPIRATION_DAYS = 30;

// Maximum values
export const MAX_BLINK_NAME_LENGTH = 50;
export const MAX_BLINK_DESCRIPTION_LENGTH = 200;
export const MAX_NFT_NAME_LENGTH = 32;
export const MAX_NFT_SYMBOL_LENGTH = 10;

// Minimum values
export const MIN_BLINK_AMOUNT = 0.000001; // Minimum amount for a Blink payment or donation in SOL

// Retry Configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second

// Wallet Adapter Configuration
export const WALLET_ADAPTER_NETWORK = SOLANA_CLUSTER;

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Languages
export const LANGUAGES = {
  EN: 'en',
} as const;

// Social Media Links
export const SOCIAL_MEDIA = {
  X: 'https://twitter.com/bark_protocol',
  DISCORD: 'https://discord.gg/bark-protocol',
  TELEGRAM: 'https://t.me/bark-protocol',
} as const;

// App Routes
export const ROUTES = {
  HOME: '/',
  CREATE_BLINK: '/create-blink',
  CREATE_NFT: '/create-nft',
  CREATE_CNFT: '/create-cnft',
  PROFILE: '/profile',
  EXPLORE: '/explore',
  ABOUT: '/about',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const;

// Analytics
export const ANALYTICS = {
  GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
} as const;

// Cache
export const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
} as const;

// SEO
export const SEO = {
  DEFAULT_TITLE: 'Blinks As A Service - Create and Manage Digital Assets on Solana',
  DEFAULT_DESCRIPTION: 'Create, manage, and trade Blinks and NFTs on the Solana blockchain with ease.',
  DEFAULT_OG_IMAGE: 'https://blink.barkprotocol/og-image.png',
} as const;

