import { z } from 'zod';

const envSchema = z.object({
  // Solana Configuration
  NEXT_PUBLIC_SOLANA_NETWORK: z.enum(['mainnet-beta', 'testnet', 'devnet']),
  NEXT_PUBLIC_SOLANA_RPC_URL: z.string().url(),
  CREATOR_PRIVATE_KEY: z.string(),

  // Database Configuration
  DATABASE_URL: z.string().url(),

  // Authentication
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),

  // API Keys
  PINATA_API_KEY: z.string(),
  PINATA_SECRET_API_KEY: z.string(),

  // Blink Program ID
  NEXT_PUBLIC_BLINK_PROGRAM_ID: z.string(),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number),

  // Optional: Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),

  // Optional: Error Reporting
  SENTRY_DSN: z.string().url().optional(),
});

const processEnv = {
  NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  CREATOR_PRIVATE_KEY: process.env.CREATOR_PRIVATE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY,
  NEXT_PUBLIC_BLINK_PROGRAM_ID: process.env.NEXT_PUBLIC_BLINK_PROGRAM_ID,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: process.env.SENTRY_DSN,
};

const env = envSchema.parse(processEnv);

export default env;

// Type definitions for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

