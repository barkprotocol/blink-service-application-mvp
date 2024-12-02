import { PublicKey } from '@solana/web3.js';

// Network
export const SOLANA_NETWORK = 'mainnet-beta';
export const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

// Tokens
export const TOKENS = {
  BARK: {
    name: 'BARK',
    symbol: 'BARK',
    decimals: 9,
    logoURI: 'https://ucarecdn.com/c18275e5-d6ca-42d3-9075-676952548776/barkicon.png',
    address: new PublicKey('2NTvEssJ2i998V2cMGT4Fy3JhyFnAzHFonDo9dbAkVrg'),
  },
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    logoURI: 'https://ucarecdn.com/0aa23f11-40b3-4cdc-891b-a169ed9f9328/sol.png',
    address: new PublicKey('So11111111111111111111111111111111111111112'),
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://ucarecdn.com/ee18c01a-d01d-4ad6-adb6-cac9a5539d2c/usdc.png',
    address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  },
};

// Jupiter API
export const JUPITER_API_BASE = 'https://quote-api.jup.ag/v4';

// BARK Protocol
export const BARK_PROTOCOL_FEE_BPS = 5; // 0.05%
export const BARK_FEE_ACCOUNT = new PublicKey('9VY4bAsCS4nexXGf31CxaHUa4KnUpANvWgHTrEDyMBcK');

// Slippage
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const MAX_SLIPPAGE = 5; // 5%

// Transaction
export const TX_CONFIRM_OPTIONS = {
  maxRetries: 5,
};

// UI
export const TOAST_DURATION = 5000; // 5 seconds

// Chart
export const CHART_DAYS = 30;

// Wallet
export const WALLET_PROVIDER_URL = 'https://wallet.barkprotocol.net';

// API Endpoints
export const API_ENDPOINTS = {
  subscribe: '/api/v1/subscribe',
  swap: '/api/v1/swap',
  createBlink: '/api/v1/create-blink',
};

// Feature Flags
export const FEATURES = {
  ENABLE_STAKING: true,
  ENABLE_NFT_CREATION: true,
  ENABLE_GOVERNANCE: false,
};

// Social Media Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/bark_protocol',
  telegram: 'https://t.me/bark_protocol',
  discord: 'https://discord.gg/barkprotocol',
  medium: 'https://medium.com/@barkprotocol',
};

